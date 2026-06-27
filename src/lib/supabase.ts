import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  name: string;
  energy: number;
  avatar: string;
  is_you: boolean;
  telegram_id: string | null;
  upgrades: unknown[];
  multiplier: number;
  passive_income: number;
  tap_capacity: number;
  tap_progress: number;
  battery_level: number;
  peak_energy: number;
  daily_streak: number;
  last_daily_claim: string | null;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  total_energy_earned: number;
  player_level: number;
  created_at: string;
  updated_at: string;
}
