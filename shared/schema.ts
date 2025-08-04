import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").notNull(), // 'coach', 'client', 'gym'
  profilePhoto: text("profile_photo"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  location: text("location"),
  bio: text("bio"),
  specialization: text("specialization"),
  experience: text("experience"),
  certifications: text("certifications"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coaches = pgTable("coaches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  gymId: uuid("gym_id").references(() => gyms.id),
  hourlyRate: integer("hourly_rate"),
  availability: jsonb("availability"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  coachId: uuid("coach_id").references(() => coaches.id),
  gymId: uuid("gym_id").references(() => gyms.id),
  fitnessGoals: text("fitness_goals"),
  medicalConditions: text("medical_conditions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'strength', 'cardio', 'flexibility', etc.
  muscleGroups: text("muscle_groups").array(),
  equipment: text("equipment"),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  instructions: text("instructions"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  duration: integer("duration"), // in minutes
  createdBy: uuid("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  coachId: uuid("coach_id").references(() => coaches.id).notNull(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  duration: integer("duration").notNull(), // weeks
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: uuid("plan_id").references(() => workoutPlans.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  weekNumber: integer("week_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: uuid("workout_id").references(() => workouts.id).notNull(),
  exerciseId: uuid("exercise_id").references(() => exercises.id).notNull(),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"),
  duration: integer("duration"), // in seconds for time-based exercises
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  inviterId: uuid("inviter_id").references(() => users.id).notNull(),
  inviteeEmail: text("invitee_email").notNull(),
  inviteeId: uuid("invitee_id").references(() => users.id),
  type: text("type").notNull(), // 'coach_to_client', 'gym_to_coach'
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  gymId: uuid("gym_id").references(() => gyms.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGymSchema = createInsertSchema(gyms).omit({
  id: true,
  createdAt: true,
});

export const insertCoachSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Gym = typeof gyms.$inferSelect;
export type InsertGym = z.infer<typeof insertGymSchema>;
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
