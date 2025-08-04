import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Play,
  Heart,
  Clock,
  Signal,
  Search
} from "lucide-react";

export default function ExerciseLibrary() {
  const [filters, setFilters] = useState({
    category: "",
    muscleGroups: "",
    equipment: "",
    search: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exercises with filters
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["/api/exercises", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.muscleGroups) params.append("muscleGroups", filters.muscleGroups);
      if (filters.equipment) params.append("equipment", filters.equipment);
      
      const response = await apiRequest("GET", `/api/exercises?${params}`);
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Mock exercises data for demonstration
  const mockExercises = [
    {
      id: "1",
      name: "Push-Up",
      description: "A classic bodyweight exercise that targets the chest, triceps, and core muscles. Perfect for building upper body strength.",
      category: "Strength",
      muscleGroups: ["Chest", "Triceps", "Core"],
      difficulty: "Beginner",
      duration: 2,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
    {
      id: "2",
      name: "Bodyweight Squat",
      description: "Fundamental lower body exercise that builds strength in the legs and glutes while improving mobility and stability.",
      category: "Strength",
      muscleGroups: ["Quads", "Glutes", "Hamstrings"],
      difficulty: "Beginner",
      duration: 3,
      imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
    {
      id: "3",
      name: "Deadlift",
      description: "One of the most effective compound exercises for building overall strength and power, targeting multiple muscle groups.",
      category: "Strength",
      muscleGroups: ["Full Body", "Posterior Chain"],
      difficulty: "Advanced",
      duration: 4,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
    {
      id: "4",
      name: "Plank Hold",
      description: "Isometric core strengthening exercise that builds stability and endurance throughout the entire core region.",
      category: "Core",
      muscleGroups: ["Core", "Shoulders", "Glutes"],
      difficulty: "Intermediate",
      duration: 1,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
    {
      id: "5",
      name: "Burpee",
      description: "High-intensity full-body exercise that combines strength training with cardiovascular conditioning.",
      category: "Cardio",
      muscleGroups: ["Full Body", "Cardiovascular"],
      difficulty: "Intermediate",
      duration: 3,
      imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
    {
      id: "6",
      name: "Pull-Up",
      description: "Upper body pulling exercise that develops back strength, biceps, and grip strength using body weight.",
      category: "Strength",
      muscleGroups: ["Back", "Biceps", "Core"],
      difficulty: "Advanced",
      duration: 2,
      imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength":
        return "bg-primary-100 text-primary-800";
      case "cardio":
        return "bg-green-100 text-green-800";
      case "core":
        return "bg-accent-100 text-accent-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-yellow-600";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Library</h2>
            <p className="text-gray-600">Comprehensive collection of exercises with video demonstrations</p>
          </div>
          <Button className="gradient-bg-primary text-white hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Muscle Group</Label>
              <Select value={filters.muscleGroups} onValueChange={(value) => handleFilterChange("muscleGroups", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Muscles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Muscles</SelectItem>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="arms">Arms</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Equipment</Label>
              <Select value={filters.equipment} onValueChange={(value) => handleFilterChange("equipment", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Equipment</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="dumbbells">Dumbbells</SelectItem>
                  <SelectItem value="barbell">Barbell</SelectItem>
                  <SelectItem value="machines">Machines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search exercises..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading exercises...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={exercise.imageUrl}
                    alt={`${exercise.name} exercise demonstration`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button className="bg-white/90 hover:bg-white rounded-full p-3">
                      <Play className="text-primary h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={getCategoryColor(exercise.category)}>
                      {exercise.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.muscleGroups.join(", ")}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {exercise.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {exercise.duration} min
                      </span>
                      <span className={`flex items-center ${getDifficultyColor(exercise.difficulty)}`}>
                        <Signal className="mr-1 h-3 w-3" />
                        {exercise.difficulty}
                      </span>
                    </div>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8 py-3">
              Load More Exercises
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
