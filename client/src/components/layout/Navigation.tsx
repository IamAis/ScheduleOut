import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Home, 
  Calendar, 
  Users, 
  Library, 
  Settings,
  Bell,
  ChevronDown,
  LogOut
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Navigation({ currentView, onViewChange, onLogout }: NavigationProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "workouts", label: "Workouts", icon: Calendar },
    { id: "clients", label: user.userType === "gym" ? "Coaches" : "Clients", icon: Users },
    { id: "exercises", label: "Exercises", icon: Library },
  ];

  const handleLogout = () => {
    onLogout();
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 gradient-bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ScheduleOut</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`pb-1 text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.userType}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onViewChange("profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
