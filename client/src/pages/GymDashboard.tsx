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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Users, Search, Send, Building, Edit, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const invitationSchema = z.object({
  inviteeEmail: z.string().email("Valid email required"),
  type: z.literal("gym_to_coach"),
});

const gymUpdateSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function GymDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const inviteForm = useForm({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      inviteeEmail: "",
      type: "gym_to_coach" as const,
    },
  });

  const updateForm = useForm({
    resolver: zodResolver(gymUpdateSchema),
    defaultValues: {
      description: "",
    },
  });

  // Fetch gym data
  const { data: gym } = useQuery({
    queryKey: ["/api/gyms/owner", user?.id],
    enabled: !!user?.id,
  });

  // Fetch coaches in this gym
  const { data: coaches = [] } = useQuery({
    queryKey: ["/api/coaches/gym", gym?.id],
    enabled: !!gym?.id,
  });

  // Fetch invitations sent by this gym
  const { data: invitations = [] } = useQuery({
    queryKey: ["/api/invitations/inviter", user?.id],
    enabled: !!user?.id,
  });

  // Search coaches
  const { data: availableCoaches = [] } = useQuery({
    queryKey: ["/api/search/coaches", searchQuery],
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
          gymId: gym?.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to create invitation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations/inviter"] });
      setIsInviteDialogOpen(false);
      inviteForm.reset();
      toast({ title: "Coach invitation sent successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to send invitation", variant: "destructive" });
    },
  });

  // Update gym description mutation
  const updateGymMutation = useMutation({
    mutationFn: async (data: z.infer<typeof gymUpdateSchema>) => {
      const response = await fetch(`/api/profile/gym/${gym?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update gym");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gyms/owner"] });
      setIsUpdateDialogOpen(false);
      updateForm.reset();
      toast({ title: "Gym profile updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update gym profile", variant: "destructive" });
    },
  });

  const onInviteSubmit = (data: z.infer<typeof invitationSchema>) => {
    createInvitationMutation.mutate(data);
  };

  const onUpdateSubmit = (data: z.infer<typeof gymUpdateSchema>) => {
    updateGymMutation.mutate(data);
  };

  // Set current description when dialog opens
  const handleUpdateDialogOpen = (open: boolean) => {
    if (open && gym?.description) {
      updateForm.setValue("description", gym.description);
    }
    setIsUpdateDialogOpen(open);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="gym-dashboard">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gym Dashboard</h1>
          <p className="text-muted-foreground">Managing {gym?.name || "Your Gym"}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-invite-coach">
                <Plus className="w-4 h-4 mr-2" />
                Invite Coach
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Coach to Join</DialogTitle>
              </DialogHeader>
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                  <FormField
                    control={inviteForm.control}
                    name="inviteeEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach Email</FormLabel>
                        <FormControl>
                          <Input placeholder="coach@example.com" {...field} data-testid="input-coach-email" />
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

          <Dialog open={isUpdateDialogOpen} onOpenChange={handleUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-update-gym">
                <Edit className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Gym Description</DialogTitle>
              </DialogHeader>
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <FormField
                    control={updateForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gym Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your gym, facilities, and what makes it special..." 
                            rows={5}
                            {...field} 
                            data-testid="input-gym-description" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={updateGymMutation.isPending} data-testid="button-save-description">
                    {updateGymMutation.isPending ? "Saving..." : "Save Description"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gym Info Card */}
      {gym && (
        <Card data-testid="card-gym-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {gym.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm"><strong>Address:</strong> {gym.address}</p>
              <p className="text-sm"><strong>Phone:</strong> {gym.phone}</p>
              <p className="text-sm"><strong>Email:</strong> {gym.email}</p>
              {gym.description && (
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-muted-foreground">{gym.description}</p>
                </div>
              )}
              <Badge variant={gym.isActive ? "default" : "secondary"}>
                {gym.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="coaches" className="w-full">
        <TabsList>
          <TabsTrigger value="coaches" data-testid="tab-coaches">
            <Users className="w-4 h-4 mr-2" />
            Our Coaches ({coaches.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            <Send className="w-4 h-4 mr-2" />
            Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="find-coaches" data-testid="tab-find-coaches">
            <Search className="w-4 h-4 mr-2" />
            Find Coaches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coaches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(coaches as any[]).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No coaches yet. Start by inviting your first coach!</p>
                </CardContent>
              </Card>
            ) : (
              (coaches as any[]).map((coach: any) => (
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
                      <p className="text-sm text-muted-foreground">{coach.users?.email}</p>
                      {coach.users?.bio && (
                        <p className="text-sm">{coach.users.bio}</p>
                      )}
                      {coach.users?.experience && (
                        <p className="text-sm">
                          <strong>Experience:</strong> {coach.users.experience} years
                        </p>
                      )}
                      <Badge variant={coach.isActive ? "default" : "secondary"}>
                        {coach.isActive ? "Active" : "Inactive"}
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
                  <Mail className="w-12 h-12 text-muted-foreground mb-4" />
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
                        <p className="text-sm text-muted-foreground">
                          Invited to join as coach
                        </p>
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

        <TabsContent value="find-coaches" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search coaches by name, specialization, or experience..."
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
            {(availableCoaches as any[]).map((coach: any) => (
              <Card key={coach.id} data-testid={`card-available-coach-${coach.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {coach.users?.firstName} {coach.users?.lastName}
                  </CardTitle>
                  {coach.users?.specialization && (
                    <Badge variant="outline">{coach.users.specialization}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                    <Button 
                      size="sm" 
                      onClick={() => {
                        inviteForm.setValue("inviteeEmail", coach.users?.email || "");
                        setIsInviteDialogOpen(true);
                      }}
                      data-testid={`button-invite-coach-${coach.id}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite to Join
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
                <p className="text-muted-foreground">Enter at least 3 characters to search for coaches</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}