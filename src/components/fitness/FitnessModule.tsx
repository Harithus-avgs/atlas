"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Utensils,
  BookOpen,
  Calendar,
  Dumbbell,
  Footprints,
  Ruler,
  Camera,
  BarChart2
} from "lucide-react";

import FitnessDashboard from "./FitnessDashboard";
import NutritionTracker from "./NutritionTracker";
import ExerciseDatabaseView from "./ExerciseDatabaseView";
import WorkoutPlanner from "./WorkoutPlanner";
import WorkoutLoggerView from "./WorkoutLoggerView";
import RunWalkTracker from "./RunWalkTracker";
import MeasurementsTracker from "./MeasurementsTracker";
import ProgressPhotosView from "./ProgressPhotosView";
import FitnessAnalytics from "./FitnessAnalytics";

type TabType =
  | "dashboard"
  | "nutrition"
  | "exercises"
  | "scheduler"
  | "logger"
  | "cardio"
  | "measurements"
  | "photos"
  | "analytics";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "exercises", label: "Exercises Library", icon: BookOpen },
  { id: "scheduler", label: "Scheduler", icon: Calendar },
  { id: "logger", label: "Set Logger", icon: Dumbbell },
  { id: "cardio", label: "Cardio Log", icon: Footprints },
  { id: "measurements", label: "Body Metrics", icon: Ruler },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "analytics", label: "Analytics", icon: BarChart2 }
] as const;

export default function FitnessModule() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <FitnessDashboard />;
      case "nutrition":
        return <NutritionTracker />;
      case "exercises":
        return <ExerciseDatabaseView />;
      case "scheduler":
        return <WorkoutPlanner />;
      case "logger":
        return <WorkoutLoggerView />;
      case "cardio":
        return <RunWalkTracker />;
      case "measurements":
        return <MeasurementsTracker />;
      case "photos":
        return <ProgressPhotosView />;
      case "analytics":
        return <FitnessAnalytics />;
      default:
        return <FitnessDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Tabs Bar */}
      <div className="flex bg-zinc-950/40 border border-zinc-900 rounded-2xl p-2 overflow-x-auto scrollbar-none gap-1.5 backdrop-blur-md">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Viewport transition shell */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
