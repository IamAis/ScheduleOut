import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth, type User } from "@/hooks/useAuth";
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, isLoading, setAuthData } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAuthSuccess = (user: User, roleData?: any) => {
    // Update auth state and redirect to dashboard
    setAuthData(user, roleData);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Dumbbell className="text-white text-xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">ScheduleOut</h2>
          <p className="mt-2 text-sm text-gray-600">Piattaforma Professionale per il Fitness</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              !isRegistering 
                ? "bg-white shadow-sm text-primary" 
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              isRegistering 
                ? "bg-white shadow-sm text-primary" 
                : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>

        <AuthForm 
          isRegistering={isRegistering} 
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
}
