import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Gym,
  InsertGym,
  Coach,
  InsertCoach,
  Client,
  InsertClient,
  Exercise,
  InsertExercise,
  WorkoutPlan,
  InsertWorkoutPlan,
  Workout,
  InsertWorkout,
  WorkoutExercise,
  InsertWorkoutExercise,
  Invitation,
  InsertInvitation,
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const queryClient = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
});
const db = drizzle(queryClient, { schema });

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Authentication
  verifyUser(email: string, password: string): Promise<User | null>;

  // Gym operations
  getGym(id: string): Promise<Gym | undefined>;
  createGym(gym: InsertGym): Promise<Gym>;
  getGymsByOwner(ownerId: string): Promise<Gym[]>;

  // Coach operations
  getCoach(id: string): Promise<Coach | undefined>;
  getCoachByUserId(userId: string): Promise<Coach | undefined>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  getCoachesByGym(gymId: string): Promise<Coach[]>;

  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  getClientsByCoach(coachId: string): Promise<Client[]>;

  // Exercise operations
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercises(filters?: { category?: string; muscleGroups?: string[]; equipment?: string }): Promise<Exercise[]>;
  getPublicExercises(): Promise<Exercise[]>;

  // Workout Plan operations
  getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getWorkoutPlansByClient(clientId: string): Promise<WorkoutPlan[]>;
  getWorkoutPlansByCoach(coachId: string): Promise<WorkoutPlan[]>;

  // Workout operations
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkoutsByPlan(planId: string): Promise<Workout[]>;
  updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout>;

  // Workout Exercise operations
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]>;

  // Invitation operations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitation(id: string): Promise<Invitation | undefined>;
  getInvitationsByInviter(inviterId: string): Promise<Invitation[]>;
  getInvitationsByInvitee(inviteeEmail: string): Promise<Invitation[]>;
  updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.email, email), eq(schema.users.password, password)));
    return user || null;
  }

  async getGym(id: string): Promise<Gym | undefined> {
    const [gym] = await db.select().from(schema.gyms).where(eq(schema.gyms.id, id));
    return gym;
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const [newGym] = await db.insert(schema.gyms).values(gym).returning();
    return newGym;
  }

  async getGymsByOwner(ownerId: string): Promise<Gym[]> {
    return await db.select().from(schema.gyms).where(eq(schema.gyms.ownerId, ownerId));
  }

  async getCoach(id: string): Promise<Coach | undefined> {
    const [coach] = await db.select().from(schema.coaches).where(eq(schema.coaches.id, id));
    return coach;
  }

  async getCoachByUserId(userId: string): Promise<Coach | undefined> {
    const [coach] = await db.select().from(schema.coaches).where(eq(schema.coaches.userId, userId));
    return coach;
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const [newCoach] = await db.insert(schema.coaches).values(coach).returning();
    return newCoach;
  }

  async getCoachesByGym(gymId: string): Promise<Coach[]> {
    return await db.select().from(schema.coaches).where(eq(schema.coaches.gymId, gymId));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, id));
    return client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(schema.clients).where(eq(schema.clients.userId, userId));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(schema.clients).values(client).returning();
    return newClient;
  }

  async getClientsByCoach(coachId: string): Promise<Client[]> {
    return await db.select().from(schema.clients).where(eq(schema.clients.coachId, coachId));
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercise;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(schema.exercises).values(exercise).returning();
    return newExercise;
  }

  async getExercises(filters?: { category?: string; muscleGroups?: string[]; equipment?: string }): Promise<Exercise[]> {
    if (filters?.category) {
      return await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.category, filters.category))
        .orderBy(desc(schema.exercises.createdAt));
    }
    
    return await db
      .select()
      .from(schema.exercises)
      .orderBy(desc(schema.exercises.createdAt));
  }

  async getPublicExercises(): Promise<Exercise[]> {
    return await db
      .select()
      .from(schema.exercises)
      .where(eq(schema.exercises.isPublic, true))
      .orderBy(desc(schema.exercises.createdAt));
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    const [plan] = await db.select().from(schema.workoutPlans).where(eq(schema.workoutPlans.id, id));
    return plan;
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db.insert(schema.workoutPlans).values(plan).returning();
    return newPlan;
  }

  async getWorkoutPlansByClient(clientId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.clientId, clientId))
      .orderBy(desc(schema.workoutPlans.createdAt));
  }

  async getWorkoutPlansByCoach(coachId: string): Promise<WorkoutPlan[]> {
    return await db
      .select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.coachId, coachId))
      .orderBy(desc(schema.workoutPlans.createdAt));
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(schema.workouts).values(workout).returning();
    return newWorkout;
  }

  async getWorkoutsByPlan(planId: string): Promise<Workout[]> {
    return await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.planId, planId))
      .orderBy(schema.workouts.weekNumber, schema.workouts.dayNumber);
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const [updatedWorkout] = await db
      .update(schema.workouts)
      .set(updates)
      .where(eq(schema.workouts.id, id))
      .returning();
    return updatedWorkout;
  }

  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const [newWorkoutExercise] = await db.insert(schema.workoutExercises).values(workoutExercise).returning();
    return newWorkoutExercise;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return await db
      .select()
      .from(schema.workoutExercises)
      .where(eq(schema.workoutExercises.workoutId, workoutId))
      .orderBy(schema.workoutExercises.orderIndex);
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db.insert(schema.invitations).values(invitation).returning();
    return newInvitation;
  }

  async getInvitation(id: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, id));
    return invitation;
  }

  async getInvitationsByInviter(inviterId: string): Promise<Invitation[]> {
    return await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.inviterId, inviterId))
      .orderBy(desc(schema.invitations.createdAt));
  }

  async getInvitationsByInvitee(inviteeEmail: string): Promise<Invitation[]> {
    return await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.inviteeEmail, inviteeEmail))
      .orderBy(desc(schema.invitations.createdAt));
  }

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation> {
    const [updatedInvitation] = await db
      .update(schema.invitations)
      .set(updates)
      .where(eq(schema.invitations.id, id))
      .returning();
    return updatedInvitation;
  }
}

export const storage = new DatabaseStorage();
