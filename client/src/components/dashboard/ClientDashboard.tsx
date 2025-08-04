import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  Play, 
  Lock,
  Eye,
  MessageCircle,
  Calendar,
  Trophy,
  Star
} from "lucide-react";

export default function ClientDashboard() {
  const { user, roleData } = useAuth();
  const client = roleData;

  // Fetch workout plans
  const { data: workoutPlans = [] } = useQuery({
    queryKey: ["/api/workout-plans/client", client?.id],
    enabled: !!client?.id,
  });

  // Mock data for demonstration
  const clientStats = {
    streak: 12,
    completedWorkouts: 47,
    totalHours: 89,
  };

  const currentPlan = {
    name: "8-Week Strength Building Program",
    progress: 38,
    coachName: "Marco Rossi",
    weekNumber: 3,
    totalWeeks: 8,
  };

  const weekWorkouts = [
    {
      id: "1",
      name: "Upper Body Push",
      details: "5 exercises • 45 min • Completed Monday",
      status: "completed",
    },
    {
      id: "2",
      name: "Lower Body Power",
      details: "6 exercises • 50 min • Today",
      status: "current",
    },
    {
      id: "3",
      name: "Recovery & Mobility",
      details: "4 exercises • 30 min • Tomorrow",
      status: "locked",
    },
  ];

  const coach = {
    name: "Marco Rossi",
    specialization: "Strength & Conditioning",
    rating: 4.9,
    reviews: 127,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
  };

  const nextSession = {
    date: "Tomorrow",
    details: "2:00 PM • Personal Training",
    location: "Gold's Gym - Studio 2",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Fitness Journey</h2>
        <p className="text-gray-600">Track your progress and complete your personalized workouts</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="gradient-bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Current Streak</p>
                <p className="text-3xl font-bold">{clientStats.streak} days</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Flame className="text-white h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg-secondary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-foreground/80 text-sm">Workouts Completed</p>
                <p className="text-3xl font-bold">{clientStats.completedWorkouts}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-bg-accent text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground/80 text-sm">Total Hours</p>
                <p className="text-3xl font-bold">{clientStats.totalHours}h</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="text-white h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Workout Plan */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentPlan.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Week {currentPlan.weekNumber} of {currentPlan.totalWeeks} • Created by{" "}
                    <span className="font-medium text-primary">{currentPlan.coachName}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{currentPlan.progress}%</div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={currentPlan.progress} className="w-full" />
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">This Week's Workouts</h4>
              <div className="space-y-4">
                {weekWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`flex items-center p-4 rounded-lg border-2 ${
                      workout.status === "completed"
                        ? "bg-green-50 border-green-200"
                        : workout.status === "current"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                        workout.status === "completed"
                          ? "bg-green-500"
                          : workout.status === "current"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {workout.status === "completed" ? (
                        <CheckCircle className="text-white h-6 w-6" />
                      ) : workout.status === "current" ? (
                        <Play className="text-white h-6 w-6" />
                      ) : (
                        <Lock className="text-gray-600 h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{workout.name}</h5>
                      <p className="text-sm text-gray-600">{workout.details}</p>
                    </div>
                    <div>
                      {workout.status === "completed" ? (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : workout.status === "current" ? (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                          Start
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Coach Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Coach</h3>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={coach.photo} />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">{coach.name}</div>
                  <div className="text-sm text-gray-500">{coach.specialization}</div>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      {coach.rating} ({coach.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Coach
              </Button>
            </CardContent>
          </Card>

          {/* Next Session */}
          <Card className="gradient-bg-secondary text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Next Session</h3>
                <Calendar className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{nextSession.date}</div>
                <div className="text-secondary-foreground/80">{nextSession.details}</div>
                <div className="text-secondary-foreground/80 text-sm">{nextSession.location}</div>
              </div>
              <Button className="w-full mt-4 bg-white text-secondary hover:bg-gray-50">
                Reschedule
              </Button>
            </CardContent>
          </Card>

          {/* Achievement */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievement</h3>
              <div className="text-center">
                <div className="h-16 w-16 gradient-bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="text-white h-8 w-8" />
                </div>
                <div className="font-medium text-gray-900">Consistency Champion</div>
                <div className="text-sm text-gray-600 mt-1">Completed 10 workouts in a row!</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
