import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dumbbell, User, Building2, UserCheck } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userType: z.enum(["coach", "client", "gym"]).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  isRegistering: boolean;
  onSuccess: (user: any, roleData?: any) => void;
}

export default function AuthForm({ isRegistering, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      userType: "coach",
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const response = await apiRequest("POST", endpoint, data);
      const result = await response.json();

      if (result.user) {
        onSuccess(result.user, result.roleData);
        toast({
          title: isRegistering ? "Registration successful" : "Login successful",
          description: `Welcome ${isRegistering ? 'to ScheduleOut' : 'back'}!`,
        });
      }
    } catch (error: any) {
      toast({
        title: isRegistering ? "Registration failed" : "Login failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    {
      value: "coach",
      label: "Coach",
      icon: UserCheck,
      description: "Train and manage clients",
      color: "text-primary",
    },
    {
      value: "client",
      label: "Client",
      icon: User,
      description: "Follow personalized workouts",
      color: "text-secondary",
    },
    {
      value: "gym",
      label: "Gym",
      icon: Building2,
      description: "Manage coaches and facility",
      color: "text-accent",
    },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {isRegistering && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                required={isRegistering}
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
                required={isRegistering}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">I am a</Label>
            <RadioGroup
              value={form.watch("userType")}
              onValueChange={(value) => form.setValue("userType", value as "coach" | "client" | "gym")}
              className="grid grid-cols-3 gap-3"
            >
              {userTypes.map((type) => (
                <div key={type.value} className="relative">
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 p-4 hover:border-primary cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 transition-colors"
                  >
                    <type.icon className={`h-6 w-6 mb-2 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="Enter your email"
          required
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="Enter your password"
          required
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full gradient-bg-primary text-white hover:opacity-90 transition-opacity"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{isRegistering ? "Creating Account..." : "Signing In..."}</span>
          </div>
        ) : (
          isRegistering ? "Create Account" : "Sign In"
        )}
      </Button>
    </form>
  );
}
