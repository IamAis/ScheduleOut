import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, type User } from "@/hooks/useAuth";
import Navigation from "@/components/layout/Navigation";
import CoachDashboard from "./CoachDashboard";
import ClientDashboard from "./ClientDashboard";
import GymDashboard from "./GymDashboard";
import ExerciseLibrary from "@/components/exercise/ExerciseLibrary";
import ProfileManagement from "@/components/profile/ProfileManagement";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, logout, isAuthenticated, refreshAuth } = useAuth();

  // Check authentication on mount if no user data
  useEffect(() => {
    if (!user && !isAuthenticated) {
      refreshAuth().catch(() => {
        setLocation("/auth");
      });
    }
  }, [user, isAuthenticated, refreshAuth, setLocation]);

  if (!isAuthenticated || !user) {
    setLocation("/auth");
    return null;
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleLogout = () => {
    logout();
  };

  const renderDashboardContent = () => {
    switch (currentView) {
      case "dashboard":
        if (user.userType === "coach") return <CoachDashboard />;
        if (user.userType === "client") return <ClientDashboard />;
        if (user.userType === "gym") return <GymDashboard />;
        return <CoachDashboard />;
      case "workouts":
        // For now, redirect to dashboard. This would be implemented separately
        return user.userType === "coach" ? <CoachDashboard /> : <ClientDashboard />;
      case "clients":
        return user.userType === "gym" ? <GymDashboard /> : <CoachDashboard />;
      case "exercises":
        return <ExerciseLibrary />;
      case "profile":
        return <ProfileManagement />;
      default:
        return user.userType === "coach" ? <CoachDashboard /> : 
               user.userType === "client" ? <ClientDashboard /> : <GymDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
      {renderDashboardContent()}
    </div>
  );
}
