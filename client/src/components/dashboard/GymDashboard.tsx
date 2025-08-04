import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  UserCheck, 
  Users, 
  ClipboardList, 
  Euro,
  TrendingUp,
  Plus,
  Star,
  MoreVertical,
  Zap,
  BarChart,
  Calendar,
  UserPlus
} from "lucide-react";

export default function GymDashboard() {
  const { user, roleData } = useAuth();
  const gyms = Array.isArray(roleData) ? roleData : [];
  const primaryGym = gyms[0]; // Assuming first gym is primary

  // Fetch coaches for the gym
  const { data: coaches = [] } = useQuery({
    queryKey: ["/api/coaches/gym", primaryGym?.id],
    enabled: !!primaryGym?.id,
  });

  // Gym stats calculation  
  const gymStats = {
    activeCoaches: Array.isArray(coaches) ? coaches.length : 0,
    totalMembers: 284,
    activePrograms: 45,
    revenue: "€18.5k",
  };

  const mockCoaches = [
    {
      id: "1",
      name: "Marco Rossi",
      specialization: "Strength & Conditioning",
      clientCount: 24,
      rating: 4.9,
      status: "active",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "2",
      name: "Sarah Thompson",
      specialization: "Yoga & Pilates",
      clientCount: 18,
      rating: 4.8,
      status: "active",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b332c923?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
    },
    {
      id: "3",
      name: "David Wilson",
      specialization: "CrossFit & HIIT",
      clientCount: 31,
      rating: 4.7,
      status: "on_leave",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
    },
  ];

  const performanceData = [
    {
      label: "New Members",
      value: 42,
      change: "+18%",
      icon: UserPlus,
      color: "text-secondary-600",
      bgColor: "bg-secondary-100",
    },
    {
      label: "Retention Rate",
      value: "94%",
      change: "+2%",
      icon: TrendingUp,
      color: "text-accent-600",
      bgColor: "bg-accent-100",
    },
    {
      label: "Satisfaction",
      value: "4.8",
      change: "+0.1",
      icon: Star,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
    },
  ];

  const recentActivity = [
    {
      message: "New coach Lisa Martinez joined",
      time: "2 hours ago",
      color: "bg-green-500",
    },
    {
      message: "Monthly report generated",
      time: "5 hours ago",
      color: "bg-blue-500",
    },
    {
      message: "Equipment inspection scheduled",
      time: "1 day ago",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gym Management</h2>
        <p className="text-gray-600">Manage your coaching staff and oversee gym operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coaches</p>
                <p className="text-3xl font-bold text-gray-900">{gymStats.activeCoaches}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserCheck className="text-primary h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{gymStats.totalMembers}</p>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="text-secondary h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +18 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-3xl font-bold text-gray-900">{gymStats.activePrograms}</p>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-accent h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              <Plus className="inline h-3 w-3 mr-1" />
              8 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{gymStats.revenue}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coaches Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle>Coaching Staff</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Coach
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={coach.photo} />
                        <AvatarFallback>
                          {coach.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{coach.name}</div>
                        <div className="text-sm text-gray-600">{coach.specialization}</div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-gray-500">{coach.clientCount} clients</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-green-600">
                            {coach.rating}★
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={coach.status === "active" ? "default" : "secondary"}
                        className={
                          coach.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {coach.status === "active" ? "Active" : "On Leave"}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="gradient-bg-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite New Coach
                </Button>
                <Button className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button className="w-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/20">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`${item.color} h-4 w-4`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          {item.label === "New Members" ? "+18 vs last month" : 
                           item.label === "Retention Rate" ? "Members staying" : 
                           "Average rating"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-green-600">{item.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`h-2 w-2 ${activity.color} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
