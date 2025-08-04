import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users, Search, Send, Target, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const invitationSchema = z.object({
  inviteeEmail: z.string().email("Valid email required"),
  type: z.literal("coach_to_client"),
});

const workoutPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  clientId: z.string().min(1, "Client is required"),
  duration: z.number().min(1, "Duration must be at least 1 week"),
});

export default function CoachDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);

  const inviteForm = useForm({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      inviteeEmail: "",
      type: "coach_to_client" as const,
    },
  });

  const workoutForm = useForm({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      duration: 4,
    },
  });

  // Fetch coach data
  const { data: coach } = useQuery({
    queryKey: ["/api/coaches/user", user?.id],
    enabled: !!user?.id,
  });

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

  // Fetch invitations
  const { data: invitations = [] } = useQuery({
    queryKey: ["/api/invitations/inviter", user?.id],
    enabled: !!user?.id,
  });

  // Search gyms
  const { data: gyms = [] } = useQuery({
    queryKey: ["/api/search/gyms", searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof invitationSchema>) => {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          inviterId: user?.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to create invitation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/inviter"] });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
      toast({ title: "Invitation sent successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to send invitation", variant: "destructive" });
    },
  });

  // Create workout plan mutation
  const createWorkoutPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workoutPlanSchema>) => {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coachId: coach?.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to create workout plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans/coach"] });
      setIsWorkoutDialogOpen(false);
      workoutForm.reset();
      toast({ title: "Workout plan created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create workout plan", variant: "destructive" });
    },
  });

  // Join gym mutation
  const joinGymMutation = useMutation({
    mutationFn: async (gymId: string) => {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviterId: user?.id,
          inviteeEmail: user?.email,
          type: "coach_to_gym",
          gymId,
        }),
      });
      if (!response.ok) throw new Error("Failed to join gym");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Join request sent to gym!" });
    },
    onError: () => {
      toast({ title: "Failed to send join request", variant: "destructive" });
    },
  });

  const onInviteSubmit = (data: z.infer<typeof invitationSchema>) => {
    createInvitationMutation.mutate(data);
  };

  const onWorkoutSubmit = (data: z.infer<typeof workoutPlanSchema>) => {
    createWorkoutPlanMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="coach-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-invite-client">
                <Plus className="w-4 h-4 mr-2" />
                Invite Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Client</DialogTitle>
              </DialogHeader>
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                  <FormField
                    control={inviteForm.control}
                    name="inviteeEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Email</FormLabel>
                        <FormControl>
                          <Input placeholder="client@example.com" {...field} data-testid="input-client-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createInvitationMutation.isPending} data-testid="button-send-invitation">
                    {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-workout">
                <Target className="w-4 h-4 mr-2" />
                Create Workout Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workout Plan</DialogTitle>
              </DialogHeader>
              <Form {...workoutForm}>
                <form onSubmit={workoutForm.handleSubmit(onWorkoutSubmit)} className="space-y-4">
                  <FormField
                    control={workoutForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Strength Building Program" {...field} data-testid="input-plan-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workoutForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the workout plan..." {...field} data-testid="input-plan-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workoutForm.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-client">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client: any) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.users?.firstName} {client.users?.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workoutForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (weeks)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-plan-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createWorkoutPlanMutation.isPending} data-testid="button-create-plan">
                    {createWorkoutPlanMutation.isPending ? "Creating..." : "Create Plan"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList>
          <TabsTrigger value="clients" data-testid="tab-clients">
            <Users className="w-4 h-4 mr-2" />
            Clients ({clients.length})
          </TabsTrigger>
          <TabsTrigger value="workouts" data-testid="tab-workouts">
            <Target className="w-4 h-4 mr-2" />
            Workout Plans ({workoutPlans.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            <Send className="w-4 h-4 mr-2" />
            Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="gyms" data-testid="tab-gyms">
            <Search className="w-4 h-4 mr-2" />
            Find Gyms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(clients as any[]).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No clients yet. Start by inviting your first client!</p>
                </CardContent>
              </Card>
            ) : (
              (clients as any[]).map((client: any) => (
                <Card key={client.id} data-testid={`card-client-${client.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{client.users?.firstName} {client.users?.lastName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{client.users?.email}</p>
                      {client.fitnessGoals && (
                        <p className="text-sm"><strong>Goals:</strong> {client.fitnessGoals}</p>
                      )}
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(workoutPlans as any[]).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No workout plans yet. Create your first workout plan!</p>
                </CardContent>
              </Card>
            ) : (
              (workoutPlans as any[]).map((plan: any) => (
                <Card key={plan.id} data-testid={`card-workout-${plan.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <p className="text-sm"><strong>Duration:</strong> {plan.duration} weeks</p>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <div className="grid gap-4">
            {(invitations as any[]).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Send className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invitations sent yet.</p>
                </CardContent>
              </Card>
            ) : (
              (invitations as any[]).map((invitation: any) => (
                <Card key={invitation.id} data-testid={`card-invitation-${invitation.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{invitation.inviteeEmail}</p>
                        <p className="text-sm text-muted-foreground">Type: {invitation.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        invitation.status === "accepted" ? "default" :
                        invitation.status === "rejected" ? "destructive" :
                        "secondary"
                      }>
                        {invitation.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{gym.address}</p>
                    {gym.description && (
                      <p className="text-sm">{gym.description}</p>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => joinGymMutation.mutate(gym.id)}
                      disabled={joinGymMutation.isPending}
                      data-testid={`button-join-gym-${gym.id}`}
                    >
                      Request to Join
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