import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  ClipboardList, 
  Dumbbell, 
  TrendingUp,
  Plus,
  UserPlus,
  Clock,
  Eye,
  MessageCircle,
  Calendar,
  Flame
} from "lucide-react";

export default function CoachDashboard() {
  const { user, roleData } = useAuth();
  const coach = roleData;
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients/coach", coach?.id],
    enabled: !!coach?.id,
  });

  // Fetch workout plans
  const { data: workoutPlans = [] } = useQuery({
    queryKey: ["/api/workout-plans/coach", coach?.id],
    enabled: !!coach?.id,
  });

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/invitations", {
        inviterId: user.id,
        inviteeEmail: email,
        type: "coach_to_client",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: "Client invitation sent successfully",
      });
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/inviter"] });
    },
    onError: () => {
      toast({
        title: "Failed to send invitation",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendInvite = () => {
    if (inviteEmail) {
      inviteMutation.mutate(inviteEmail);
    }
  };

  // Stats calculation
  const stats = {
    totalClients: Array.isArray(clients) ? clients.length : 0,
    activeWorkouts: Array.isArray(workoutPlans) ? workoutPlans.filter((plan: any) => plan.isActive).length : 0,
    exerciseCount: 156, // Mock value
    completionRate: 87, // Mock value
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coach Dashboard</h2>
        <p className="text-gray-600">Manage your clients and create personalized workout plans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workouts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeWorkouts}</p>
              </div>
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-secondary h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exercise Library</p>
                <p className="text-3xl font-bold text-gray-900">{stats.exerciseCount}</p>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-accent h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              <Plus className="inline h-3 w-3 mr-1" />
              12 added this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="outline" size="sm">View all</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity items */}
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Sarah Johnson</span> completed{" "}
                      <span className="font-medium text-primary">Upper Body Strength</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Michael Brown</span> started{" "}
                      <span className="font-medium text-primary">HIIT Cardio Session</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    In Progress
                  </Badge>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Emma Davis</span> requested feedback on{" "}
                      <span className="font-medium text-primary">Core Stability Program</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">6 hours ago</p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Create New Workout */}
          <Card className="gradient-bg-primary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Workout</h3>
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Design a personalized workout plan for your clients
              </p>
              <Button className="w-full bg-white text-primary hover:bg-gray-50">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Invite Client */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Invite Client</h3>
                <UserPlus className="text-secondary h-5 w-5" />
              </div>
              <p className="text-gray-600 text-sm mb-4">Send an invitation to a new client</p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Client email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail || inviteMutation.isPending}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Sessions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
                <Calendar className="text-accent h-5 w-5" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="text-primary h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Lisa Wilson</p>
                    <p className="text-xs text-gray-500">2:00 PM - Personal Training</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Clock className="text-secondary h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Tom Rodriguez</p>
                    <p className="text-xs text-gray-500">4:30 PM - Group Session</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
