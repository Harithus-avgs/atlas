"use client";

import React from "react";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { Sun, Moon, Flame, Search, Plus, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface TopbarProps {
  viewTitle: string;
  onSearchClick: () => void;
  onQuickLogClick: () => void;
}

export default function Topbar({ viewTitle, onSearchClick, onQuickLogClick }: TopbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const prettyDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return (
    <header className="h-20 bg-zinc-950/40 border-b border-zinc-900 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
      
      {/* View Title & Dynamic Date */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100 uppercase tracking-wide capitalize font-mono">
          {viewTitle}
        </h1>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">{prettyDate}</p>
      </div>

      {/* Global Action Cluster */}
      <div className="flex items-center gap-4">
        
        {/* Search Command Trigger */}
        <button
          onClick={onSearchClick}
          className="h-10 w-64 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-3.5 flex items-center justify-between text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all text-xs font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span>Search options...</span>
          </div>
          <kbd className="bg-zinc-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700/50">
            Ctrl+K
          </kbd>
        </button>

        {/* Streaks Badge */}
        {user && user.streak_current > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl text-amber-500 font-semibold text-xs shadow-sm shadow-amber-500/5 cursor-help"
            title={`${user.streak_current} consecutive active sync days. Keep showing up!`}
          >
            <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
            <span className="font-mono tabular-nums">{user.streak_current} Day Streak</span>
          </motion.div>
        )}

        {/* Notification alerts bell (Placeholder badge) */}
        <button className="h-10 w-10 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
        </button>

        {/* Theme Toggle Trigger */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="h-10 w-10 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Quick Log Action */}
        <button
          onClick={onQuickLogClick}
          className="h-10 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-violet-600/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Quick Log
        </button>

      </div>
    </header>
  );
}
