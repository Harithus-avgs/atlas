export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  rank: string;
  streak_current: number;
  streak_longest: number;
  streak_last_date: string | null;
  life_score: number;
  streak_shields: number;
  created_at: string;
  updated_at: string;
}

export interface CharacterStats {
  user_id: string;
  health: number;
  strength: number;
  discipline: number;
  knowledge: number;
  focus: number;
  consistency: number;
  endurance: number;
  creativity: number;
  confidence: number;
  wisdom: number;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'daily_synchronization' | 'today_mission' | 'main_quest' | 'side_quest' | 'habit';
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary';
  xp_reward: number;
  stat_rewards: Record<string, number>;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestCompletion {
  id: string;
  quest_id: string;
  user_id: string;
  completed_at: string;
  xp_gained: number;
  stat_rewards: Record<string, number>;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  streak_current: number;
  streak_longest: number;
  last_completed_at: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  status: 'completed' | 'skipped';
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject: 'quant' | 'dilr' | 'varc';
  topic: string;
  duration_minutes: number;
  solved_count: number;
  correct_count: number;
  date: string;
  created_at: string;
}

export interface Mock {
  id: string;
  user_id: string;
  name: string;
  date: string;
  quant_score: number;
  varc_score: number;
  dilr_score: number;
  total_score: number;
  quant_percentile: number;
  varc_percentile: number;
  dilr_percentile: number;
  total_percentile: number;
  accuracy: number;
  notes: string | null;
  created_at: string;
}

export interface StudyError {
  id: string;
  user_id: string;
  subject: 'quant' | 'dilr' | 'varc';
  topic: string;
  question_text: string;
  error_type: string;
  solution: string | null;
  is_reviewed: boolean;
  created_at: string;
}

export interface FinanceAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'savings' | 'credit' | 'cash';
  balance: number;
  opening_balance: number;
  created_at: string;
}

export interface FinanceCategory {
  id: string;
  user_id: string | null;
  key: string;
  name: string;
  kind: 'income' | 'expense' | 'transfer';
  is_default: boolean;
  created_at: string;
}

export interface FinanceInvestment {
  id: string;
  user_id: string;
  name: string;
  type: 'stocks' | 'mutual_funds' | 'ppf' | 'etf';
  invested: number;
  current: number;
  purchase_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  note: string | null;
  account_id: string | null;
  category: string;
  investment_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  from_account_name: string | null;
  to_account_name: string | null;
  created_at: string;
}

export interface FinanceBudget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // 'YYYY-MM'
  created_at: string;
}

export interface FinanceRecurring {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  start_date: string;
  end_date: string | null;
  last_fired_date: string | null;
  frequency: string;
  account_id: string | null;
  account_name: string | null;
  category: string;
  investment_id: string | null;
  created_at: string;
}

export interface FinanceSavingsBucket {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface FitnessLog {
  id: string;
  user_id: string;
  weight: number | null;
  calories: number | null;
  protein_g: number | null;
  water_ml: number | null;
  sleep_hours: number | null;
  walking_steps: number | null;
  running_km: number | null;
  date: string;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  exercises: Array<{ name: string; sets: number; reps: number }>;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  date: string;
  exercises_logged: Array<{ name: string; sets: Array<{ reps: number; weight: number }> }>;
  created_at: string;
}

export interface CareerProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'in_progress' | 'completed';
  created_at: string;
}

export interface CareerLearning {
  id: string;
  user_id: string;
  topic: string;
  duration_minutes: number;
  date: string;
  created_at: string;
}

export interface CreativeSketch {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  date: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  xp_reward: number;
  criteria: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface Journal {
  id: string;
  user_id: string;
  content: string;
  mood: number;
  gratitude: string[];
  lessons: string[];
  wins: string[];
  tags: string[];
  date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'level_up' | 'quest_complete' | 'achievement_unlocked' | 'alert';
  is_read: boolean;
  created_at: string;
}
