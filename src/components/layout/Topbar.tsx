"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useTheme } from "../../lib/theme-context";
import { Sun, Moon, Flame, Search, Plus, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  viewTitle: string;
  onSearchClick: () => void;
  onQuickLogClick: () => void;
}

export default function Topbar({ viewTitle, onSearchClick, onQuickLogClick }: TopbarProps) {
  const { user, notifications, markNotificationAsRead, clearNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

        {/* Notification alerts bell with dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="h-10 w-10 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
              </>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-80 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-30 backdrop-blur-md space-y-3.5"
              >
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                  <h4 className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-wider">
                    Log Alerts ({unreadCount})
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        clearNotifications();
                        setIsNotifOpen(false);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono font-bold uppercase transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-600 font-medium">
                      Caught up! No alerts logged. 🌟
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          notif.is_read
                            ? "bg-zinc-900/10 border-zinc-900 opacity-60"
                            : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-bold ${notif.is_read ? "text-zinc-500" : "text-violet-400"}`}>
                            {notif.title}
                          </span>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Trigger */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="h-10 w-10 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
