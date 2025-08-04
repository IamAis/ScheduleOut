import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExerciseSchema, insertWorkoutPlanSchema, insertInvitationSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

// Extend session interface
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      userType: string;
    };
    roleData?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration with MemoryStore (better for Supabase setup)
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // 24 hours
    }),
    secret: process.env.SESSION_SECRET || 'supabase-fitness-app-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Get current user session
  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user, roleData: req.session.roleData });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.verifyUser(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get role-specific data
      let roleData = null;
      if (user.userType === "coach") {
        roleData = await storage.getCoachByUserId(user.id);
      } else if (user.userType === "client") {
        roleData = await storage.getClientByUserId(user.id);
      } else if (user.userType === "gym") {
        roleData = await storage.getGymsByOwner(user.id);
      }

      // Store in session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      };
      req.session.roleData = roleData;

      res.json({ user: req.session.user, roleData });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt with data:", req.body);
      const userData = insertUserSchema.parse(req.body);
      console.log("Parsed user data:", userData);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      console.log("Existing user check:", existingUser);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      console.log("Creating user...");
      const user = await storage.createUser(userData);
      console.log("User created:", user);

      // Create role-specific record
      let roleData = null;
      if (user.userType === "coach") {
        roleData = await storage.createCoach({ userId: user.id });
      } else if (user.userType === "client") {
        roleData = await storage.createClient({ userId: user.id });
      }

      // Store in session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      };
      req.session.roleData = roleData;

      res.json({ user: req.session.user, roleData });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, muscleGroups, equipment } = req.query;
      const filters = {
        category: category as string,
        muscleGroups: muscleGroups ? (muscleGroups as string).split(",") : undefined,
        equipment: equipment as string,
      };
      
      const exercises = await storage.getExercises(filters);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Failed to create exercise" });
    }
  });

  app.get("/api/exercises/public", async (req, res) => {
    try {
      const exercises = await storage.getPublicExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public exercises" });
    }
  });

  // Workout Plan routes
  app.get("/api/workout-plans/coach/:coachId", async (req, res) => {
    try {
      const plans = await storage.getWorkoutPlansByCoach(req.params.coachId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.get("/api/workout-plans/client/:clientId", async (req, res) => {
    try {
      const plans = await storage.getWorkoutPlansByClient(req.params.clientId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.post("/api/workout-plans", async (req, res) => {
    try {
      const planData = insertWorkoutPlanSchema.parse(req.body);
      const plan = await storage.createWorkoutPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Failed to create workout plan" });
    }
  });

  // Workout routes
  app.get("/api/workouts/plan/:planId", async (req, res) => {
    try {
      const workouts = await storage.getWorkoutsByPlan(req.params.planId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.patch("/api/workouts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const workout = await storage.updateWorkout(req.params.id, updates);
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Client routes
  app.get("/api/clients/coach/:coachId", async (req, res) => {
    try {
      const clients = await storage.getClientsByCoach(req.params.coachId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Coach routes
  app.get("/api/coaches/gym/:gymId", async (req, res) => {
    try {
      const coaches = await storage.getCoachesByGym(req.params.gymId);
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coaches" });
    }
  });

  // Invitation routes
  app.post("/api/invitations", async (req, res) => {
    try {
      const invitationData = insertInvitationSchema.parse(req.body);
      const invitation = await storage.createInvitation(invitationData);
      res.json(invitation);
    } catch (error) {
      res.status(400).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/invitations/inviter/:inviterId", async (req, res) => {
    try {
      const invitations = await storage.getInvitationsByInviter(req.params.inviterId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get("/api/invitations/invitee/:email", async (req, res) => {
    try {
      const invitations = await storage.getInvitationsByInvitee(req.params.email);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.patch("/api/invitations/:id", async (req, res) => {
    try {
      const updates = req.body;
      const invitation = await storage.updateInvitation(req.params.id, updates);
      res.json(invitation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invitation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
