import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Target, Calendar, Search, Users, CheckCircle, Clock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const invitationResponseSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export default function ClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch client data
  const { data: client } = useQuery({
    queryKey: ["/api/clients/user", user?.id],
    enabled: !!user?.id,
  });

  // Fetch workout plans for this client
  const { data: workoutPlans = [] } = useQuery({
    queryKey: ["/api/workout-plans/client", client?.id],
    enabled: !!client?.id,
  });

  // Fetch invitations for this client
  const { data: invitations = [] } = useQuery({
    queryKey: ["/api/invitations/invitee", user?.email],
    enabled: !!user?.email,
  });

  // Search coaches
  const { data: coaches = [] } = useQuery({
    queryKey: ["/api/search/coaches", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Search gyms
  const { data: gyms = [] } = useQuery({
    queryKey: ["/api/search/gyms", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Update invitation mutation
  const updateInvitationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update invitation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/invitee"] });
      toast({ title: "Invitation response sent!" });
    },
    onError: () => {
      toast({ title: "Failed to respond to invitation", variant: "destructive" });
    },
  });

  // Mark workout as completed mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isCompleted: true, 
          completedAt: new Date().toISOString() 
        }),
      });
      if (!response.ok) throw new Error("Failed to complete workout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans/client"] });
      toast({ title: "Workout marked as completed!" });
    },
    onError: () => {
      toast({ title: "Failed to update workout", variant: "destructive" });
    },
  });

  const handleInvitationResponse = (id: string, status: "accepted" | "rejected") => {
    updateInvitationMutation.mutate({ id, status });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="client-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList>
          <TabsTrigger value="workouts" data-testid="tab-workouts">
            <Target className="w-4 h-4 mr-2" />
            My Workouts ({workoutPlans.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            <Mail className="w-4 h-4 mr-2" />
            Invitations ({invitations.filter((inv: any) => inv.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="coaches" data-testid="tab-coaches">
            <Users className="w-4 h-4 mr-2" />
            Find Coaches
          </TabsTrigger>
          <TabsTrigger value="gyms" data-testid="tab-gyms">
            <Search className="w-4 h-4 mr-2" />
            Find Gyms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(workoutPlans as any[]).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No workout plans assigned yet. Your coach will create plans for you!</p>
                </CardContent>
              </Card>
            ) : (
              (workoutPlans as any[]).map((plan: any) => (
                <Card key={plan.id} data-testid={`card-workout-${plan.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Completed"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span><strong>Duration:</strong> {plan.duration} weeks</span>
                        <span><strong>Coach:</strong> {plan.coach?.users?.firstName}</span>
                      </div>
                      
                      {/* Show workout progress */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Weekly Progress:</h4>
                        <div className="grid grid-cols-4 gap-1">
                          {Array.from({ length: plan.duration }, (_, week) => (
                            <div key={week} className="text-center">
                              <div className="text-xs text-muted-foreground">W{week + 1}</div>
                              <div className="w-full h-2 bg-secondary rounded">
                                <div 
                                  className="h-full bg-primary rounded transition-all"
                                  style={{ width: `${Math.random() * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        data-testid={`button-view-plan-${plan.id}`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        View Full Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-4">
            {(invitations as any[]).filter((inv: any) => inv.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending invitations.</p>
                </CardContent>
              </Card>
            ) : (
              (invitations as any[])
                .filter((inv: any) => inv.status === "pending")
                .map((invitation: any) => (
                  <Card key={invitation.id} data-testid={`card-invitation-${invitation.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            {invitation.type === "coach_to_client" && "Coach Invitation"}
                            {invitation.type === "gym_to_coach" && "Gym Invitation"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            From: {invitation.inviter?.firstName} {invitation.inviter?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                          {invitation.gym && (
                            <p className="text-sm">
                              <strong>Gym:</strong> {invitation.gym.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleInvitationResponse(invitation.id, "accepted")}
                            disabled={updateInvitationMutation.isPending}
                            data-testid={`button-accept-${invitation.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleInvitationResponse(invitation.id, "rejected")}
                            disabled={updateInvitationMutation.isPending}
                            data-testid={`button-reject-${invitation.id}`}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}

            {/* Show accepted/rejected invitations */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Previous Invitations</h3>
              {(invitations as any[])
                .filter((inv: any) => inv.status !== "pending")
                .map((invitation: any) => (
                  <Card key={invitation.id} className="opacity-75">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {invitation.type === "coach_to_client" && "Coach Invitation"}
                            {invitation.type === "gym_to_coach" && "Gym Invitation"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {invitation.inviter?.firstName} {invitation.inviter?.lastName}
                          </p>
                        </div>
                        <Badge variant={
                          invitation.status === "accepted" ? "default" : "destructive"
                        }>
                          {invitation.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search coaches by name, specialization, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-coach-search"
            />
            <Button variant="outline" data-testid="button-search-coaches">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(coaches as any[]).map((coach: any) => (
              <Card key={coach.id} data-testid={`card-coach-${coach.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {coach.users?.firstName} {coach.users?.lastName}
                  </CardTitle>
                  {coach.users?.specialization && (
                    <Badge variant="outline">{coach.users.specialization}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coach.users?.bio && (
                      <p className="text-sm text-muted-foreground">{coach.users.bio}</p>
                    )}
                    {coach.users?.experience && (
                      <p className="text-sm">
                        <strong>Experience:</strong> {coach.users.experience} years
                      </p>
                    )}
                    {coach.users?.location && (
                      <p className="text-sm">
                        <strong>Location:</strong> {coach.users.location}
                      </p>
                    )}
                    <Button size="sm" className="w-full" data-testid={`button-contact-coach-${coach.id}`}>
                      <Users className="w-4 h-4 mr-2" />
                      Contact Coach
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchQuery.length <= 2 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Enter at least 3 characters to search for coaches</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gyms" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search gyms by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-gym-search"
            />
            <Button variant="outline" data-testid="button-search-gyms">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(gyms as any[]).map((gym: any) => (
              <Card key={gym.id} data-testid={`card-gym-${gym.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{gym.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{gym.address}</p>
                    {gym.description && (
                      <p className="text-sm">{gym.description}</p>
                    )}
                    <Button size="sm" className="w-full" data-testid={`button-view-gym-${gym.id}`}>
                      <Search className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchQuery.length <= 2 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Enter at least 3 characters to search for gyms</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}