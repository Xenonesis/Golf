// This file should be generated from your Supabase project using:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
//
// For now, this is a placeholder with the basic structure.
// Replace this with the actual generated types after setting up your Supabase project.

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
          role: 'public' | 'subscriber' | 'admin'
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'public' | 'subscriber' | 'admin'
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'public' | 'subscriber' | 'admin'
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          charity_contribution_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          charity_contribution_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          charity_contribution_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      golf_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          play_date: string
          course_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          play_date: string
          course_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          play_date?: string
          course_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'education' | 'health' | 'environment' | 'sports' | 'community' | 'other'
          logo_url: string | null
          website_url: string | null
          is_featured: boolean | null
          is_active: boolean | null
          total_donations: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: 'education' | 'health' | 'environment' | 'sports' | 'community' | 'other'
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean | null
          is_active?: boolean | null
          total_donations?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'education' | 'health' | 'environment' | 'sports' | 'community' | 'other'
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean | null
          is_active?: boolean | null
          total_donations?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_draws: {
        Row: {
          id: string
          draw_month: string
          status: 'draft' | 'published' | 'completed'
          algorithm: 'random' | 'weighted' | null
          winning_numbers: number[] | null
          jackpot_amount: number | null
          rollover_from: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draw_month: string
          status?: 'draft' | 'published' | 'completed'
          algorithm?: 'random' | 'weighted' | null
          winning_numbers?: number[] | null
          jackpot_amount?: number | null
          rollover_from?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draw_month?: string
          status?: 'draft' | 'published' | 'completed'
          algorithm?: 'random' | 'weighted' | null
          winning_numbers?: number[] | null
          jackpot_amount?: number | null
          rollover_from?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      draw_participants: {
        Row: {
          id: string
          user_id: string
          draw_id: string
          selected_numbers: number[] | null
          matched_count: number | null
          match_type: number | null
          is_winner: boolean | null
          prize_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draw_id: string
          selected_numbers?: number[] | null
          matched_count?: number | null
          match_type?: number | null
          is_winner?: boolean | null
          prize_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draw_id?: string
          selected_numbers?: number[] | null
          matched_count?: number | null
          match_type?: number | null
          is_winner?: boolean | null
          prize_amount?: number | null
          created_at?: string
        }
      }
      winner_verifications: {
        Row: {
          id: string
          participant_id: string
          proof_image_url: string | null
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          proof_image_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          proof_image_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_charity_selections: {
        Row: {
          id: string
          user_id: string
          charity_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          charity_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          charity_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_last_5_scores: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          score: number
          play_date: string
          course_name: string | null
        }[]
      }
      calculate_draw_winners: {
        Args: {
          p_draw_id: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'public' | 'subscriber' | 'admin'
      subscription_status: 'active' | 'cancelled' | 'expired' | 'pending' | 'past_due' | 'trialing'
      subscription_plan: 'monthly' | 'yearly'
      draw_status: 'draft' | 'published' | 'completed'
      winner_verification_status: 'pending' | 'approved' | 'rejected' | 'paid'
      charity_category: 'education' | 'health' | 'environment' | 'sports' | 'community' | 'other'
      draw_algorithm: 'random' | 'weighted'
    }
  }
}
