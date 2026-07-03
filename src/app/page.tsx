"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import CharacterCreation from "../components/auth/CharacterCreation";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import CommandPalette from "../components/shared/CommandPalette";
import StudyModule from "../components/study/StudyModule";
import FinanceModule from "../components/finance/FinanceModule";
import FitnessModule from "../components/fitness/FitnessModule";
import CareerModule from "../components/career/CareerModule";
import CreativeModule from "../components/creative/CreativeModule";
import { checkAndRunMigration } from "../lib/migration";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  TrendingDown,
  BookOpen,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  Target
} from "lucide-react";

export default function Home() {
  const { user, stats, quests, isAuthenticated, isLoading, toggleQuest, addXP, gainStatPoints, addQuest } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Custom toast notifications for RPG milestones
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; desc: string; xp?: string }>>([]);

  const showToast = (title: string, desc: string, xp?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, desc, xp }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Trigger legacy auto-migration on mount
  useEffect(() => {
    if (isAuthenticated) {
      const result = checkAndRunMigration();
      if (result.migrated) {
        addXP(100, "Legacy data migration completed");
        gainStatPoints({ discipline: 2, wisdom: 2 });
        showToast(
          "V1 Data Migrated!",
          "Successfully loaded your past study and finance records. +100 XP awarded!",
          "+100 XP"
        );
      }
    }
  }, [isAuthenticated]);

  const handleQuickAction = (actionKey: string) => {
    if (!user) return;

    if (actionKey === "act-water") {
      addXP(10, "Hydration logged");
      gainStatPoints({ health: 1 });
      showToast("Hydration Logged", "Logged 250ml of clean drinking water.", "+10 XP");
    } else if (actionKey === "act-protein") {
      addXP(25, "Protein shake logged");
      gainStatPoints({ health: 2, strength: 1 });
      showToast("Protein Shake Logged", "Logged 30g of protein intake.", "+25 XP");
    } else if (actionKey === "act-weight") {
      // Simulate recording weight
      addXP(25, "Weight recorded");
      gainStatPoints({ discipline: 1 });
      showToast("Weight Synchronized", "Recorded today's weight at 99.1kg.", "+25 XP");
    } else if (actionKey === "act-sketch") {
      addXP(50, "Daily sketch completed");
      gainStatPoints({ creativity: 3, consistency: 1 });
      showToast("Sketch Completed", "Uploaded sketch to Creative Streak.", "+50 XP");
    } else if (actionKey === "act-quant") {
      addXP(50, "Quant practice");
      gainStatPoints({ knowledge: 2, focus: 1 });
      showToast("Quant Problems Solved", "Completed 10 averages questions.", "+50 XP");
    } else if (actionKey === "act-journal") {
      addXP(25, "Daily reflection");
      gainStatPoints({ wisdom: 1, discipline: 1 });
      showToast("Reflection Recorded", "Logged daily wins and lessons learned.", "+25 XP");
    }
  };

  const handleQuickLogClick = () => {
    // Open the command palette to let the user select what to log
    setIsSearchOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full mb-4"
        />
        <span className="text-zinc-500 text-xs tracking-widest uppercase animate-pulse">
          Synchronizing System Core...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <CharacterCreation />;
  }

  const activeMissions = quests.filter(q => q.type === "daily_synchronization" || q.type === "today_mission");
  const completedMissions = activeMissions.filter(q => q.is_completed);
  const completionPercentage = activeMissions.length
    ? Math.round((completedMissions.length / activeMissions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-64 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

      {/* Navigation Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <Topbar
          viewTitle={currentView}
          onSearchClick={() => setIsSearchOpen(true)}
          onQuickLogClick={handleQuickLogClick}
        />

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-900">
          
          <AnimatePresence mode="wait">
            {currentView === "dashboard" ? (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                
                {/* LEFT & CENTER COLUMNS */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Today's Missions Board */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-violet-400" /> Today's Quests
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Complete daily activities to earn XP and attributes.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-mono font-bold">
                          {completionPercentage}% Complete
                        </span>
                        <div className="w-20 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900/60">
                          <div
                            style={{ width: `${completionPercentage}%` }}
                            className="h-full bg-violet-500 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeMissions.map((quest) => (
                        <div
                          key={quest.id}
                          className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 ${
                            quest.is_completed
                              ? "bg-zinc-900/10 border-zinc-900/60 opacity-60"
                              : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <input
                              type="checkbox"
                              checked={quest.is_completed}
                              onChange={() => {
                                toggleQuest(quest.id);
                                if (!quest.is_completed) {
                                  showToast("Quest Completed!", `You earned +${quest.xp_reward} XP.`, `+${quest.xp_reward} XP`);
                                }
                              }}
                              className="mt-0.5 w-5 h-5 rounded-md border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-violet-500 focus:ring-offset-black cursor-pointer accent-violet-600"
                            />
                            <div>
                              <h5 className={`text-xs font-semibold text-zinc-200 ${quest.is_completed ? "line-through text-zinc-600" : ""}`}>
                                {quest.title}
                              </h5>
                              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                                {quest.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {Object.keys(quest.stat_rewards).map((stat) => (
                              <span
                                key={stat}
                                className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase"
                              >
                                {stat} +{quest.stat_rewards[stat]}
                              </span>
                            ))}
                            <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                              +{quest.xp_reward} XP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weight goals progress trend card */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-violet-400" /> Physical Goals Progress
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Targeting vegetarian nutrition & weight reduction.
                      </p>
                      
                      <div className="mt-6 flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span>Current: 99.25 kg</span>
                        <span>Goal: 86.0 kg</span>
                      </div>
                      
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900 mt-2">
                        {/* Target is 86, start is 99.25 (diff 13.25) */}
                        <div
                          style={{ width: "10%" }} // Seed starting progression
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-center h-full">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                        Estimated Date to Hit Goal
                      </span>
                      <span className="text-lg font-bold text-zinc-100 mt-1 font-mono">
                        Oct 14, 2026
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                        Calculated by active caloric deficits and consistent home workout frequencies.
                      </p>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN (CHARACTER PROFILE) */}
                <div className="space-y-8">
                  
                  {/* Stats Attribute panel */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
                    <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-violet-400" /> Attributes
                    </h3>
                    
                    <div className="space-y-3.5">
                      {stats && Object.keys(stats).map((key) => {
                        if (key === "user_id") return null;
                        const val = stats[key as keyof typeof stats] as number;
                        
                        // Custom colors for RPG visual aesthetic
                        let barColor = "bg-zinc-700";
                        if (key === "health" || key === "endurance") barColor = "bg-rose-500";
                        if (key === "knowledge" || key === "wisdom") barColor = "bg-emerald-500";
                        if (key === "discipline" || key === "consistency") barColor = "bg-violet-500";
                        if (key === "creativity") barColor = "bg-amber-500";
                        if (key === "strength" || key === "focus") barColor = "bg-orange-500";

                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-300 uppercase tracking-wide capitalize font-mono text-[10px]">
                                {key}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-zinc-400">{val}</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
                              <div
                                style={{ width: `${Math.min(100, (val / 30) * 100)}%` }}
                                className={`h-full ${barColor} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Coach quick tips card */}
                  <div className="bg-gradient-to-br from-violet-950/20 to-zinc-950/80 border border-violet-900/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-20 h-20 text-violet-400" />
                    </div>
                    
                    <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 uppercase">
                      Coach Insight
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100 mt-2">
                      Protein Synergy Opportunity
                    </h4>
                    <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                      "I noticed that hitting your 120g protein targets on workout days matches a 12% increase in your weekly discipline consistency scores. Try logging your shake right after home training."
                    </p>
                  </div>

                </div>

              </motion.div>
            ) : currentView === "study" ? (
              <StudyModule key="study-view" />
            ) : currentView === "finance" ? (
              <FinanceModule key="finance-view" />
            ) : currentView === "fitness" ? (
              <FitnessModule key="fitness-view" />
            ) : currentView === "career" ? (
              <CareerModule key="career-view" />
            ) : currentView === "creative" ? (
              <CreativeModule key="creative-view" />
            ) : (
              <motion.div
                key="module-placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="py-24 text-center border border-zinc-900 bg-zinc-950/30 rounded-2xl space-y-4"
              >
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mx-auto">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-200 uppercase tracking-wide capitalize font-mono">
                  {currentView} Module
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  This segment will be constructed in the subsequent phase. All tracker dependencies and database schemas are already initialized.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentView}
        onQuickAction={handleQuickAction}
      />

      {/* Floating Action Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 shadow-2xl min-w-[280px] max-w-sm flex items-center justify-between gap-4 backdrop-blur-md"
            >
              <div>
                <h5 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> {toast.title}
                </h5>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  {toast.desc}
                </p>
              </div>

              {toast.xp && (
                <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/10 flex-shrink-0 animate-bounce">
                  {toast.xp}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
