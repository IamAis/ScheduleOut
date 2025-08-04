import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Temporarily disable auto-check to prevent request spam
  // Will be re-enabled once database connection is working
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: false, // Disabled until database is working
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/auth";
    },
  });

  // Type safe data access
  const user = authData && typeof authData === 'object' && 'user' in authData ? authData.user : null;
  const roleData = authData && typeof authData === 'object' && 'roleData' in authData ? authData.roleData : null;
  const isAuthenticated = !!user && !error;

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    roleData,
    isAuthenticated,
    isLoading,
    logout,
  };
}