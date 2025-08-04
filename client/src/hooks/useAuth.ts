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

  // Disable automatic auth check to prevent infinite loading
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: false, // Disabled to prevent loading loops
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
  
  // Since auth check is disabled, never show loading state initially
  const finalIsLoading = false;

  const logout = () => {
    logoutMutation.mutate();
  };

  const refreshAuth = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  return {
    user,
    roleData,
    isAuthenticated,
    isLoading: finalIsLoading,
    logout,
    refreshAuth,
  };
}