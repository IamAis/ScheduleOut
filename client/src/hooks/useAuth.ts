import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "coach" | "client" | "gym";
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Disable automatic auth check to prevent spam, only check when explicitly needed
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: false, // Disable automatic checking
    retry: 1,
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
  const user = authData && typeof authData === 'object' && 'user' in authData ? authData.user as User : null;
  const roleData = authData && typeof authData === 'object' && 'roleData' in authData ? authData.roleData : null;
  const isAuthenticated = !!user && !error;
  
  // Since auth check is disabled, don't show loading state unless explicitly checking
  const finalIsLoading = false;

  const logout = () => {
    logoutMutation.mutate();
  };

  const refreshAuth = async () => {
    return queryClient.fetchQuery({ queryKey: ["/api/auth/me"] });
  };

  // Function to set authentication data after login/register
  const setAuthData = (userData: User, roleData?: any) => {
    queryClient.setQueryData(["/api/auth/me"], { user: userData, roleData });
  };

  return {
    user,
    roleData,
    isAuthenticated,
    isLoading: finalIsLoading,
    logout,
    refreshAuth,
    setAuthData,
  };
}