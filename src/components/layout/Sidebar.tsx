"use client";

import React, { useState } from "react";
import { useAuth, getXpRequiredForLevel } from "../../lib/auth-context";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  Briefcase,
  Wallet,
  PenTool,
  BookMarked,
  Target,
  Calendar,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "study", label: "Study (CAT)", icon: BookOpen },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "creative", label: "Creative", icon: PenTool },
  { id: "journal", label: "Journal", icon: BookMarked },
  { id: "goals", label: "Goals", icon: Target },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const xpRequired = getXpRequiredForLevel(user.level);
  const xpPercent = Math.min(100, Math.round((user.xp / xpRequired) * 100));

  return (
    <aside
      className={`h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between transition-all duration-300 relative ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Trigger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white rounded-full p-1.5 hover:bg-zinc-900 transition-colors z-30"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Logo Header */}
      <div className="p-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/20">
            A
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-wider text-zinc-100 font-mono"
            >
              ATLAS<span className="text-violet-500 font-sans">.</span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-900">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-3.5 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-violet-600/10 border border-violet-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm truncate"
                >
                  {item.label}
                </motion.span>
              )}
              {isCollapsed && (
                <div className="absolute left-20 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded px-2.5 py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & XP Status Widget */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60 backdrop-blur">
        <div className={`flex flex-col gap-4 ${isCollapsed ? "items-center" : ""}`}>
          
          {/* User Details */}
          <div className="flex items-center gap-3 w-full">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                  {user.full_name}
                </h5>
                <span className="text-xs font-mono text-zinc-500 block truncate mt-0.5">
                  @{user.username}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logout}
                title="Disconnect Profile"
                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* XP Progress Slider bar */}
          {!isCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                <span>LVL {user.level} {user.rank}</span>
                <span>{user.xp} / {xpRequired} XP</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          ) : (
            <div
              title={`LVL ${user.level} | ${user.xp}/${xpRequired} XP`}
              className="w-10 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900 cursor-help"
            >
              <div
                style={{ width: `${xpPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
