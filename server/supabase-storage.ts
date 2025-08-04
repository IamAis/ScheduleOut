import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key for full access
const supabaseUrl = 'https://zjnnfyocvlzpxscrjbcw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqbm5meW9jdmx6cHhzY3JqYmN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ1NjgwMywiZXhwIjoyMDY3MDMyODAzfQ.EKfpsRxETHmS8d4ZQXuo8AqZW1BLVJ71nGf1VzJFTX4';

const supabase = createClient(supabaseUrl, serviceRoleKey);
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



export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });

    if (!response.ok) return undefined;
    
    const data = await response.json();
    return data.length > 0 ? data[0] as User : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Use direct HTTP call instead of Supabase client
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        user_type: user.userType
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data[0] as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data as User;
  }

  // Authentication
  async verifyUser(email: string, password: string): Promise<User | null> {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}&password=eq.${password}&select=*`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.length > 0 ? data[0] as User : null;
  }

  // Gym operations
  async getGym(id: string): Promise<Gym | undefined> {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Gym;
  }

  async createGym(gym: InsertGym): Promise<Gym> {
    const { data, error } = await supabase
      .from('gyms')
      .insert(gym)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create gym: ${error.message}`);
    return data as Gym;
  }

  async getGymsByOwner(ownerId: string): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) throw new Error(`Failed to get gyms: ${error.message}`);
    return data as Gym[];
  }

  // Coach operations
  async getCoach(id: string): Promise<Coach | undefined> {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Coach;
  }

  async getCoachByUserId(userId: string): Promise<Coach | undefined> {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return data as Coach;
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const { data, error } = await supabase
      .from('coaches')
      .insert(coach)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create coach: ${error.message}`);
    return data as Coach;
  }

  async getCoachesByGym(gymId: string): Promise<Coach[]> {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('gym_id', gymId);
    
    if (error) throw new Error(`Failed to get coaches: ${error.message}`);
    return data as Coach[];
  }

  // Client operations
  async getClient(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    return data as Client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create client: ${error.message}`);
    return data as Client;
  }

  async getClientsByCoach(coachId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', coachId);
    
    if (error) throw new Error(`Failed to get clients: ${error.message}`);
    return data as Client[];
  }

  // Exercise operations
  async getExercise(id: string): Promise<Exercise | undefined> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Exercise;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create exercise: ${error.message}`);
    return data as Exercise;
  }

  async getExercises(filters?: { category?: string; muscleGroups?: string[]; equipment?: string }): Promise<Exercise[]> {
    let query = supabase.from('exercises').select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get exercises: ${error.message}`);
    return data as Exercise[];
  }

  async getPublicExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get public exercises: ${error.message}`);
    return data as Exercise[];
  }

  // Workout Plan operations
  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as WorkoutPlan;
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create workout plan: ${error.message}`);
    return data as WorkoutPlan;
  }

  async getWorkoutPlansByClient(clientId: string): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get workout plans: ${error.message}`);
    return data as WorkoutPlan[];
  }

  async getWorkoutPlansByCoach(coachId: string): Promise<WorkoutPlan[]> {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get workout plans: ${error.message}`);
    return data as WorkoutPlan[];
  }

  // Workout operations
  async getWorkout(id: string): Promise<Workout | undefined> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create workout: ${error.message}`);
    return data as Workout;
  }

  async getWorkoutsByPlan(planId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('plan_id', planId)
      .order('week_number')
      .order('day_number');
    
    if (error) throw new Error(`Failed to get workouts: ${error.message}`);
    return data as Workout[];
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update workout: ${error.message}`);
    return data as Workout;
  }

  // Workout Exercise operations
  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(workoutExercise)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create workout exercise: ${error.message}`);
    return data as WorkoutExercise;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('order_index');
    
    if (error) throw new Error(`Failed to get workout exercises: ${error.message}`);
    return data as WorkoutExercise[];
  }

  // Invitation operations
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create invitation: ${error.message}`);
    return data as Invitation;
  }

  async getInvitation(id: string): Promise<Invitation | undefined> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Invitation;
  }

  async getInvitationsByInviter(inviterId: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('inviter_id', inviterId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get invitations: ${error.message}`);
    return data as Invitation[];
  }

  async getInvitationsByInvitee(inviteeEmail: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invitee_email', inviteeEmail)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get invitations: ${error.message}`);
    return data as Invitation[];
  }

  async updateInvitation(id: string, updates: Partial<Invitation>): Promise<Invitation> {
    const { data, error } = await supabase
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update invitation: ${error.message}`);
    return data as Invitation;
  }
}

export const storage = new SupabaseStorage();