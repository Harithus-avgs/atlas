"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, CharacterStats, Quest } from "./supabase/types";
import { supabase, isSupabaseConfigured } from "./supabase/client";

interface AuthContextType {
  user: Profile | null;
  stats: CharacterStats | null;
  quests: Quest[];
  isAuthenticated: boolean;
  isLoading: boolean;
  completeOnboarding: (username: string, fullName: string, archetype: string, targetWeight: number, allocatedStats: Record<string, number>) => void;
  logout: () => void;
  addXP: (amount: number, reason: string) => { leveledUp: boolean; newLevel: number };
  gainStatPoints: (statUpdates: Record<string, number>) => void;
  toggleQuest: (questId: string) => void;
  addQuest: (title: string, type: Quest["type"], difficulty: Quest["difficulty"], stats: Record<string, number>) => void;
  
  // Notifications
  notifications: any[];
  addNotification: (title: string, message: string, type: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Supabase Auth Methods
  supabaseUser: any | null;
  loginWithSupabase: (email: string, password: string) => Promise<{ error: any }>;
  signupWithSupabase: (email: string, password: string, username: string, fullName: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const XP_FORMULA_EXPONENT = 1.8;
export const getXpRequiredForLevel = (lvl: number) => {
  return Math.round(100 * Math.pow(lvl, XP_FORMULA_EXPONENT));
};

const getRankForLevel = (lvl: number): string => {
  if (lvl < 5) return "Novice";
  if (lvl < 10) return "Iron";
  if (lvl < 15) return "Bronze";
  if (lvl < 25) return "Silver";
  if (lvl < 40) return "Gold";
  if (lvl < 60) return "Platinum";
  if (lvl < 80) return "Diamond";
  if (lvl < 100) return "Master";
  return "Grandmaster";
};

const DEFAULT_MISSIONS: Omit<Quest, "id" | "user_id" | "created_at" | "updated_at" | "completed_at">[] = [
  {
    title: "Daily Synchronization",
    description: "Sync your metrics for the day, review your goals, and set priorities.",
    type: "daily_synchronization",
    difficulty: "easy",
    xp_reward: 25,
    stat_rewards: { discipline: 2, wisdom: 1 },
    frequency: "daily",
    is_completed: false,
    due_date: null
  },
  {
    title: "Morning Walk (30 mins)",
    description: "Start the day with fresh air and light cardio.",
    type: "today_mission",
    difficulty: "easy",
    xp_reward: 25,
    stat_rewards: { health: 2, endurance: 1 },
    frequency: "daily",
    is_completed: false,
    due_date: null
  },
  {
    title: "Hit Protein Target (120g)",
    description: "Ensure adequate protein consumption for lean muscle support.",
    type: "today_mission",
    difficulty: "medium",
    xp_reward: 50,
    stat_rewards: { health: 3, strength: 1 },
    frequency: "daily",
    is_completed: false,
    due_date: null
  },
  {
    title: "Solve 20 Quant questions",
    description: "Target topic: Arithmetic averages and percentages (CAT preparation).",
    type: "today_mission",
    difficulty: "hard",
    xp_reward: 100,
    stat_rewards: { knowledge: 4, focus: 2 },
    frequency: "daily",
    is_completed: false,
    due_date: null
  },
  {
    title: "Daily Sketch",
    description: "Complete one sketch for the creative consistency priority.",
    type: "today_mission",
    difficulty: "easy",
    xp_reward: 25,
    stat_rewards: { creativity: 3 },
    frequency: "daily",
    is_completed: false,
    due_date: null
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [stats, setStats] = useState<CharacterStats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Helper to load cloud data for authenticated Supabase users
  const loadCloudData = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: charStats } = await supabase
        .from("character_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: questList } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", userId);

      if (profile && charStats) {
        setUser(profile);
        setStats(charStats);
        setQuests(questList || []);
        setIsAuthenticated(true);

        localStorage.setItem("atlas.user", JSON.stringify(profile));
        localStorage.setItem("atlas.stats", JSON.stringify(charStats));
        if (questList) localStorage.setItem("atlas.quests", JSON.stringify(questList));
      }
    } catch (err) {
      console.error("Error loading cloud data:", err);
    }
  };

  useEffect(() => {
    // Load notifications from local storage on mount
    const storedNotif = localStorage.getItem("atlas.notifications");
    if (storedNotif) {
      setNotifications(JSON.parse(storedNotif));
    }

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadCloudData(session.user.id);
          setIsLoading(false);
          return;
        }
      }

      // Fallback local storage auth load
      const storedUser = localStorage.getItem("atlas.user");
      const storedStats = localStorage.getItem("atlas.stats");
      const storedQuests = localStorage.getItem("atlas.quests");

      if (storedUser && storedStats) {
        setUser(JSON.parse(storedUser));
        setStats(JSON.parse(storedStats));
        setIsAuthenticated(true);
        
        if (storedQuests) {
          setQuests(JSON.parse(storedQuests));
        } else {
          const initialQuests: Quest[] = DEFAULT_MISSIONS.map((q, idx) => ({
            ...q,
            id: `quest-${idx}-${Date.now()}`,
            user_id: JSON.parse(storedUser).id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: null
          }));
          setQuests(initialQuests);
          localStorage.setItem("atlas.quests", JSON.stringify(initialQuests));
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const completeOnboarding = async (
    username: string,
    fullName: string,
    archetype: string,
    targetWeight: number,
    allocatedStats: Record<string, number>
  ) => {
    const userId = supabaseUser?.id || `user-${Math.random().toString(36).substr(2, 9)}`;
    const nowStr = new Date().toISOString();

    const newUser: Profile = {
      id: userId,
      username: username.toLowerCase(),
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      level: 1,
      xp: 0,
      rank: "Novice",
      streak_current: 1,
      streak_longest: 1,
      streak_last_date: new Date().toISOString().split("T")[0],
      life_score: 95,
      streak_shields: 1,
      created_at: nowStr,
      updated_at: nowStr
    };

    const newStats: CharacterStats = {
      user_id: userId,
      health: allocatedStats.health || 10,
      strength: allocatedStats.strength || 10,
      discipline: allocatedStats.discipline || 10,
      knowledge: allocatedStats.knowledge || 10,
      focus: allocatedStats.focus || 10,
      consistency: allocatedStats.consistency || 10,
      endurance: allocatedStats.endurance || 10,
      creativity: allocatedStats.creativity || 10,
      confidence: allocatedStats.confidence || 10,
      wisdom: allocatedStats.wisdom || 10
    };

    const initialQuests: Quest[] = DEFAULT_MISSIONS.map((q, idx) => ({
      ...q,
      id: `quest-${idx}-${Date.now()}`,
      user_id: userId,
      created_at: nowStr,
      updated_at: nowStr,
      completed_at: null
    }));

    setUser(newUser);
    setStats(newStats);
    setQuests(initialQuests);
    setIsAuthenticated(true);

    localStorage.setItem("atlas.user", JSON.stringify(newUser));
    localStorage.setItem("atlas.stats", JSON.stringify(newStats));
    localStorage.setItem("atlas.quests", JSON.stringify(initialQuests));

    // Async push to Supabase if active
    if (isSupabaseConfigured && supabase && supabaseUser) {
      try {
        await supabase.from("profiles").upsert(newUser);
        await supabase.from("character_stats").upsert(newStats);
        await supabase.from("quests").upsert(initialQuests);
      } catch (err) {
        console.error("Cloud onboarding sync error:", err);
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setStats(null);
    setQuests([]);
    setSupabaseUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("atlas.user");
    localStorage.removeItem("atlas.stats");
    localStorage.removeItem("atlas.quests");
  };

  const addXP = (amount: number, reason: string) => {
    if (!user) return { leveledUp: false, newLevel: 1 };

    let currentXP = user.xp + amount;
    let currentLvl = user.level;
    let leveledUp = false;

    let xpRequired = getXpRequiredForLevel(currentLvl);

    while (currentXP >= xpRequired) {
      currentXP -= xpRequired;
      currentLvl += 1;
      leveledUp = true;
      xpRequired = getXpRequiredForLevel(currentLvl);
    }

    const updatedUser: Profile = {
      ...user,
      xp: currentXP,
      level: currentLvl,
      rank: getRankForLevel(currentLvl),
      updated_at: new Date().toISOString()
    };

    setUser(updatedUser);
    localStorage.setItem("atlas.user", JSON.stringify(updatedUser));

    if (isSupabaseConfigured && supabase && supabaseUser) {
      supabase.from("profiles").upsert(updatedUser).then(({ error }) => { if (error) console.error(error); });
    }

    // Automatically reward stats if leveled up
    if (leveledUp && stats) {
      const updatedStats: CharacterStats = {
        ...stats,
        health: stats.health + 1,
        strength: stats.strength + 1,
        discipline: stats.discipline + 1,
        knowledge: stats.knowledge + 1,
        focus: stats.focus + 1,
        consistency: stats.consistency + 1,
        endurance: stats.endurance + 1,
        creativity: stats.creativity + 1,
        confidence: stats.confidence + 1,
        wisdom: stats.wisdom + 1
      };
      setStats(updatedStats);
      localStorage.setItem("atlas.stats", JSON.stringify(updatedStats));

      if (isSupabaseConfigured && supabase && supabaseUser) {
        supabase.from("character_stats").upsert(updatedStats).then(({ error }) => { if (error) console.error(error); });
      }

      addNotification(
        "Level Up!",
        `Congratulations! You have attained Level ${currentLvl}. All primary stats increased by 1!`,
        "level_up"
      );
    }

    return { leveledUp, newLevel: currentLvl };
  };

  const addNotification = (title: string, message: string, type: string) => {
    const notificationsKey = "atlas.notifications";
    const stored = localStorage.getItem(notificationsKey);
    const list = stored ? JSON.parse(stored) : [];
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    const nextList = [newNotif, ...list];
    setNotifications(nextList);
    localStorage.setItem(notificationsKey, JSON.stringify(nextList));
  };

  const markNotificationAsRead = (id: string) => {
    const nextList = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(nextList);
    localStorage.setItem("atlas.notifications", JSON.stringify(nextList));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("atlas.notifications", JSON.stringify([]));
  };

  const gainStatPoints = (statUpdates: Record<string, number>) => {
    if (!stats) return;

    const updatedStats: CharacterStats = { ...stats };
    Object.keys(statUpdates).forEach((s) => {
      const key = s as keyof CharacterStats;
      if (typeof updatedStats[key] === "number" && key !== "user_id") {
        (updatedStats[key] as number) += statUpdates[s];
      }
    });

    setStats(updatedStats);
    localStorage.setItem("atlas.stats", JSON.stringify(updatedStats));

    if (isSupabaseConfigured && supabase && supabaseUser) {
      supabase.from("character_stats").upsert(updatedStats).then(({ error }) => { if (error) console.error(error); });
    }
  };

  const toggleQuest = (questId: string) => {
    const updatedQuests = quests.map((q) => {
      if (q.id === questId) {
        const nextState = !q.is_completed;
        
        // Log XP and stats updates upon completion
        if (nextState) {
          addXP(q.xp_reward, `Completed quest: ${q.title}`);
          gainStatPoints(q.stat_rewards);
        } else {
          if (user) {
            const reversedXP = Math.max(0, user.xp - q.xp_reward);
            const updatedUser = { ...user, xp: reversedXP };
            setUser(updatedUser);
            localStorage.setItem("atlas.user", JSON.stringify(updatedUser));
            if (isSupabaseConfigured && supabase && supabaseUser) {
              supabase.from("profiles").upsert(updatedUser).then(({ error }) => { if (error) console.error(error); });
            }
          }
          const reversedStats = { ...q.stat_rewards };
          Object.keys(reversedStats).forEach(k => {
            reversedStats[k] = -reversedStats[k];
          });
          gainStatPoints(reversedStats);
        }

        const updatedQuest = {
          ...q,
          is_completed: nextState,
          completed_at: nextState ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        };

        if (isSupabaseConfigured && supabase && supabaseUser) {
          supabase.from("quests").upsert(updatedQuest).then(({ error }) => { if (error) console.error(error); });
        }

        return updatedQuest;
      }
      return q;
    });

    setQuests(updatedQuests);
    localStorage.setItem("atlas.quests", JSON.stringify(updatedQuests));
  };

  const addQuest = (
    title: string,
    type: Quest["type"],
    difficulty: Quest["difficulty"],
    stat_rewards: Record<string, number>
  ) => {
    if (!user) return;

    let xp_reward = 25;
    if (difficulty === "trivial") xp_reward = 10;
    if (difficulty === "medium") xp_reward = 50;
    if (difficulty === "hard") xp_reward = 100;
    if (difficulty === "legendary") xp_reward = 250;

    const newQuest: Quest = {
      id: `quest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: user.id,
      title,
      description: null,
      type,
      difficulty,
      xp_reward,
      stat_rewards,
      frequency: "once",
      is_completed: false,
      due_date: new Date().toISOString().split("T")[0],
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const nextQuests = [...quests, newQuest];
    setQuests(nextQuests);
    localStorage.setItem("atlas.quests", JSON.stringify(nextQuests));

    if (isSupabaseConfigured && supabase && supabaseUser) {
      supabase.from("quests").upsert(newQuest).then(({ error }) => { if (error) console.error(error); });
    }
  };

  const loginWithSupabase = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: "Supabase is not configured." } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      setSupabaseUser(data.user);
      await loadCloudData(data.user.id);
    }
    return { error };
  };

  const signupWithSupabase = async (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: "Supabase is not configured." } };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data?.user) {
      setSupabaseUser(data.user);
      
      // Seed default profile values upon signing up
      const nowStr = new Date().toISOString();
      const initialProfile: Profile = {
        id: data.user.id,
        username: username.toLowerCase(),
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        level: 1,
        xp: 0,
        rank: "Novice",
        streak_current: 1,
        streak_longest: 1,
        streak_last_date: new Date().toISOString().split("T")[0],
        life_score: 100,
        streak_shields: 1,
        created_at: nowStr,
        updated_at: nowStr
      };

      const initialStats: CharacterStats = {
        user_id: data.user.id,
        health: 10,
        strength: 10,
        discipline: 10,
        knowledge: 10,
        focus: 10,
        consistency: 10,
        endurance: 10,
        creativity: 10,
        confidence: 10,
        wisdom: 10
      };

      await supabase.from("profiles").insert(initialProfile);
      await supabase.from("character_stats").insert(initialStats);
      await loadCloudData(data.user.id);
    }
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        quests,
        isAuthenticated,
        isLoading,
        completeOnboarding,
        logout,
        addXP,
        gainStatPoints,
        toggleQuest,
        addQuest,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        supabaseUser,
        loginWithSupabase,
        signupWithSupabase
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
