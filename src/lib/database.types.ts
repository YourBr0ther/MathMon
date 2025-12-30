export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          trainer_name: string
          xp: number
          level: number
          highest_streak: number
          current_streak: number
          total_correct_answers: number
          total_problems_attempted: number
          daily_login_streak: number
          last_reward_claimed_date: string | null
          total_days_played: number
          last_played_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          trainer_name?: string
          xp?: number
          level?: number
          highest_streak?: number
          current_streak?: number
          total_correct_answers?: number
          total_problems_attempted?: number
          daily_login_streak?: number
          last_reward_claimed_date?: string | null
          total_days_played?: number
          last_played_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trainer_name?: string
          xp?: number
          level?: number
          highest_streak?: number
          current_streak?: number
          total_correct_answers?: number
          total_problems_attempted?: number
          daily_login_streak?: number
          last_reward_claimed_date?: string | null
          total_days_played?: number
          last_played_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      caught_pokemon: {
        Row: {
          id: string
          user_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_sprite: string
          pokemon_artwork: string
          pokemon_types: string[]
          caught_at: string
          caught_with_problem: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_sprite: string
          pokemon_artwork: string
          pokemon_types: string[]
          caught_at?: string
          caught_with_problem?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pokemon_id?: number
          pokemon_name?: string
          pokemon_sprite?: string
          pokemon_artwork?: string
          pokemon_types?: string[]
          caught_at?: string
          caught_with_problem?: string | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          current_progress: number
          unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          current_progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          current_progress?: number
          unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      worksheet_results: {
        Row: {
          id: string
          user_id: string
          worksheet_id: string
          worksheet_name: string
          grade_level: string
          operation: string
          score: number
          total_questions: number
          stars: number
          time_spent_seconds: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          worksheet_id: string
          worksheet_name: string
          grade_level: string
          operation: string
          score: number
          total_questions: number
          stars: number
          time_spent_seconds: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          worksheet_id?: string
          worksheet_name?: string
          grade_level?: string
          operation?: string
          score?: number
          total_questions?: number
          stars?: number
          time_spent_seconds?: number
          completed_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type CaughtPokemon = Database['public']['Tables']['caught_pokemon']['Row']
export type CaughtPokemonInsert = Database['public']['Tables']['caught_pokemon']['Insert']

export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']
export type UserAchievementUpdate = Database['public']['Tables']['user_achievements']['Update']

export type WorksheetResultRow = Database['public']['Tables']['worksheet_results']['Row']
export type WorksheetResultInsert = Database['public']['Tables']['worksheet_results']['Insert']
