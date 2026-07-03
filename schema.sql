-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE quest_type AS ENUM ('daily_synchronization', 'today_mission', 'main_quest', 'side_quest', 'habit');
CREATE TYPE difficulty_level AS ENUM ('trivial', 'easy', 'medium', 'hard', 'legendary');
CREATE TYPE study_subject AS ENUM ('quant', 'dilr', 'varc');
CREATE TYPE finance_account_type AS ENUM ('savings', 'credit', 'cash');
CREATE TYPE finance_transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE investment_type AS ENUM ('stocks', 'mutual_funds', 'ppf', 'etf');
CREATE TYPE frequency_type AS ENUM ('once', 'daily', 'weekly', 'monthly');

-- User Profile & Character Stats
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    level INTEGER DEFAULT 1 NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    rank TEXT DEFAULT 'Novice' NOT NULL,
    streak_current INTEGER DEFAULT 0 NOT NULL,
    streak_longest INTEGER DEFAULT 0 NOT NULL,
    streak_last_date DATE,
    life_score INTEGER DEFAULT 100 NOT NULL,
    streak_shields INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE character_stats (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    health INTEGER DEFAULT 10 NOT NULL,
    strength INTEGER DEFAULT 10 NOT NULL,
    discipline INTEGER DEFAULT 10 NOT NULL,
    knowledge INTEGER DEFAULT 10 NOT NULL,
    focus INTEGER DEFAULT 10 NOT NULL,
    consistency INTEGER DEFAULT 10 NOT NULL,
    endurance INTEGER DEFAULT 10 NOT NULL,
    creativity INTEGER DEFAULT 10 NOT NULL,
    confidence INTEGER DEFAULT 10 NOT NULL,
    wisdom INTEGER DEFAULT 10 NOT NULL
);

-- Quests
CREATE TABLE quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type quest_type DEFAULT 'side_quest' NOT NULL,
    difficulty difficulty_level DEFAULT 'easy' NOT NULL,
    xp_reward INTEGER DEFAULT 25 NOT NULL,
    stat_rewards JSONB DEFAULT '{}'::jsonb NOT NULL, -- e.g., {"knowledge": 5, "focus": 2}
    frequency frequency_type DEFAULT 'once' NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE quest_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    xp_gained INTEGER NOT NULL,
    stat_rewards JSONB NOT NULL
);

-- Habits (Preserving habit features)
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency frequency_type DEFAULT 'daily' NOT NULL,
    streak_current INTEGER DEFAULT 0 NOT NULL,
    streak_longest INTEGER DEFAULT 0 NOT NULL,
    last_completed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE habit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL, -- 'completed', 'skipped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (habit_id, date)
);

-- Study Module (CAT prep tracker)
CREATE TABLE study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subject study_subject NOT NULL,
    topic TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    solved_count INTEGER DEFAULT 0 NOT NULL,
    correct_count INTEGER DEFAULT 0 NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE mocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    quant_score NUMERIC DEFAULT 0 NOT NULL,
    varc_score NUMERIC DEFAULT 0 NOT NULL,
    dilr_score NUMERIC DEFAULT 0 NOT NULL,
    total_score NUMERIC DEFAULT 0 NOT NULL,
    quant_percentile NUMERIC DEFAULT 0 NOT NULL,
    varc_percentile NUMERIC DEFAULT 0 NOT NULL,
    dilr_percentile NUMERIC DEFAULT 0 NOT NULL,
    total_percentile NUMERIC DEFAULT 0 NOT NULL,
    accuracy NUMERIC DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE study_errors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    subject study_subject NOT NULL,
    topic TEXT NOT NULL,
    question_text TEXT NOT NULL,
    error_type TEXT NOT NULL, -- e.g., 'conceptual', 'silly_mistake', 'time_pressure'
    solution TEXT,
    is_reviewed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Finance Module
CREATE TABLE finance_accounts (
    id TEXT PRIMARY KEY, -- Using TEXT to support frontend-generated ID strings
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type finance_account_type NOT NULL,
    balance NUMERIC DEFAULT 0 NOT NULL,
    opening_balance NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_categories (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Nullable for default global templates
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    kind finance_transaction_type NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_investments (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type investment_type NOT NULL,
    invested NUMERIC DEFAULT 0 NOT NULL,
    current NUMERIC DEFAULT 0 NOT NULL,
    purchase_date DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type finance_transaction_type NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    account_id TEXT REFERENCES finance_accounts(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- Matching string tag category from seed data
    investment_id TEXT REFERENCES finance_investments(id) ON DELETE SET NULL,
    from_account_id TEXT REFERENCES finance_accounts(id) ON DELETE SET NULL,
    to_account_id TEXT REFERENCES finance_accounts(id) ON DELETE SET NULL,
    from_account_name TEXT,
    to_account_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_budgets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_recurring (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type finance_transaction_type NOT NULL,
    amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    last_fired_date DATE,
    frequency TEXT NOT NULL, -- 'monthly', 'weekly', etc.
    account_id TEXT REFERENCES finance_accounts(id) ON DELETE SET NULL,
    account_name TEXT,
    category TEXT NOT NULL,
    investment_id TEXT REFERENCES finance_investments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE finance_savings_buckets (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fitness Module
CREATE TABLE fitness_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC,
    calories INTEGER,
    protein_g NUMERIC,
    water_ml INTEGER,
    sleep_hours NUMERIC,
    walking_steps INTEGER,
    running_km NUMERIC,
    date DATE UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE workout_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL, -- Array of objects: [{name: "Pushups", sets: 3, reps: 15}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE workout_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    exercises_logged JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE fitness_meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    meal_type TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    time TEXT,
    foods JSONB NOT NULL,
    quantity NUMERIC DEFAULT 1,
    calories INTEGER DEFAULT 0 NOT NULL,
    protein_g NUMERIC DEFAULT 0 NOT NULL,
    carbs_g NUMERIC DEFAULT 0 NOT NULL,
    fat_g NUMERIC DEFAULT 0 NOT NULL,
    fiber_g NUMERIC DEFAULT 0 NOT NULL,
    water_ml INTEGER DEFAULT 0 NOT NULL,
    is_favorite BOOLEAN DEFAULT false NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE fitness_measurements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC NOT NULL,
    waist NUMERIC,
    chest NUMERIC,
    shoulders NUMERIC,
    biceps NUMERIC,
    forearms NUMERIC,
    thighs NUMERIC,
    calves NUMERIC,
    neck NUMERIC,
    hips NUMERIC,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE fitness_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
    workout_name TEXT NOT NULL,
    date DATE NOT NULL,
    is_rest_day BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE fitness_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    photo_type TEXT NOT NULL,
    photo_data TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Career Module
CREATE TABLE career_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in_progress' NOT NULL, -- 'planning', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE career_learning (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL, -- e.g., 'SAP Certification', 'Interview Prep'
    duration_minutes INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creative Module
CREATE TABLE creative_sketches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Achievements & Achievements Log
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 50 NOT NULL,
    criteria JSONB NOT NULL -- conditions e.g., {"type": "mock_percentile", "value": 95}
);

CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, achievement_id)
);

-- Journals
CREATE TABLE journals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    mood INTEGER NOT NULL, -- 1 to 5 scale
    gratitude JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of strings
    lessons JSONB DEFAULT '[]'::jsonb NOT NULL,
    wins JSONB DEFAULT '[]'::jsonb NOT NULL,
    tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
    date DATE UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'level_up', 'quest_complete', 'achievement_unlocked', 'alert'
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_savings_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_photos ENABLE ROW LEVEL SECURITY;

-- Creating standard RLS Policies (Owner access)
CREATE POLICY "Users can access their own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access their own character stats" ON character_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own quests" ON quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own quest completions" ON quest_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own study sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own mocks" ON mocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own study errors" ON study_errors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own finance accounts" ON finance_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access default or own categories" ON finance_categories FOR ALL USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can access their own investments" ON finance_investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own transactions" ON finance_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own budgets" ON finance_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own recurring rules" ON finance_recurring FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own savings buckets" ON finance_savings_buckets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own fitness logs" ON fitness_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own templates" ON workout_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own workout logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own projects" ON career_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own learning logs" ON career_learning FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own sketches" ON creative_sketches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own journal" ON journals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own meals" ON fitness_meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own measurements" ON fitness_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own schedules" ON fitness_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own photos" ON fitness_photos FOR ALL USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX idx_quests_user_due ON quests(user_id, due_date);
CREATE INDEX idx_transactions_user_date ON finance_transactions(user_id, date);
CREATE INDEX idx_study_sessions_user_date ON study_sessions(user_id, date);
CREATE INDEX idx_fitness_logs_user_date ON fitness_logs(user_id, date);
CREATE INDEX idx_journals_user_date ON journals(user_id, date);
