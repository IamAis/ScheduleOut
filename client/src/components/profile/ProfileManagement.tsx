import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, AlertTriangle } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  certifications: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileManagement() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    profileVisible: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      form.reset({
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        dateOfBirth: parsedUser.dateOfBirth || "",
        location: parsedUser.location || "",
        bio: parsedUser.bio || "",
        specialization: parsedUser.specialization || "",
        experience: parsedUser.experience || "",
        certifications: parsedUser.certifications || "",
      });
    }
  }, []);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      location: "",
      bio: "",
      specialization: "",
      experience: "",
      certifications: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfileMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = () => {
    // This would implement file upload functionality with Supabase Storage
    toast({
      title: "Photo upload",
      description: "Photo upload functionality would be implemented with Supabase Storage",
    });
  };

  const handleDeleteAccount = () => {
    // This would implement account deletion
    toast({
      title: "Delete account",
      description: "Account deletion would require additional confirmation",
      variant: "destructive",
    });
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    return "Jan 2023";
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Manage your personal and professional information</p>
      </div>

      <Card>
        {/* Profile Header */}
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.profilePhoto} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={handlePhotoChange}
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 capitalize">Professional {user.userType}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Active
                </span>
                <span className="text-sm text-gray-500">Member since {getMemberSince()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-6 py-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...form.register("location")}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            {(user.userType === "coach" || user.userType === "gym") && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={form.watch("specialization")}
                      onValueChange={(value) => form.setValue("specialization", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength & Conditioning</SelectItem>
                        <SelectItem value="cardio">Cardiovascular Training</SelectItem>
                        <SelectItem value="yoga">Yoga & Pilates</SelectItem>
                        <SelectItem value="crossfit">CrossFit & HIIT</SelectItem>
                        <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      value={form.watch("experience")}
                      onValueChange={(value) => form.setValue("experience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Textarea
                      id="certifications"
                      {...form.register("certifications")}
                      placeholder="List your certifications..."
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      placeholder="Tell clients about yourself..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Profile Visibility</div>
                    <div className="text-sm text-gray-600">Allow other coaches and gyms to find your profile</div>
                  </div>
                  <Switch
                    checked={settings.profileVisible}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, profileVisible: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive updates about new clients and workout completions</div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-600">Get notified about real-time activities</div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || updateProfileMutation.isPending}
                  className="gradient-bg-primary text-white hover:opacity-90"
                >
                  {isLoading || updateProfileMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
