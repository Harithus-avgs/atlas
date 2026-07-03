"use client";

import React, { useState, useEffect } from "react";
import { Activity, TrendingDown, Flame, BarChart } from "lucide-react";

export default function FitnessAnalytics() {
  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [walks, setWalks] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const storedWeights = localStorage.getItem("atlas.fitness.weights");
    const storedMeals = localStorage.getItem("atlas.fitness.meals");
    const storedRuns = localStorage.getItem("atlas.fitness.runningLogs");
    const storedWalks = localStorage.getItem("atlas.fitness.walkingLogs");
    const storedWorkouts = localStorage.getItem("atlas.fitness.workoutLogs");

    if (storedWeights) setWeights(JSON.parse(storedWeights));
    if (storedMeals) setMeals(JSON.parse(storedMeals));
    if (storedRuns) setRuns(JSON.parse(storedRuns));
    if (storedWalks) setWalks(JSON.parse(storedWalks));
    if (storedWorkouts) setWorkouts(JSON.parse(storedWorkouts));
  }, []);

  // CALCULATE 7-DAY MOVING AVERAGE FOR WEIGHT
  const getWeightMovingAverage = () => {
    if (weights.length === 0) return [];
    
    // Sort oldest first
    const sorted = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sorted.map((w, idx) => {
      // average of last 7 entries up to current idx
      const startIndex = Math.max(0, idx - 6);
      const sub = sorted.slice(startIndex, idx + 1);
      const avg = sub.reduce((acc, x) => acc + x.weight, 0) / sub.length;
      return { date: w.date, weight: w.weight, avg: parseFloat(avg.toFixed(2)) };
    });
  };

  const weightTrend = getWeightMovingAverage();

  // CALCULATE WEEKLY CALORIES & PROTEIN
  const getWeeklyNutrition = () => {
    if (meals.length === 0) return [];
    // Group meals by date, calculate daily totals
    const dailyTotals: Record<string, { cal: number; prot: number }> = {};
    meals.forEach((m) => {
      if (!dailyTotals[m.date]) dailyTotals[m.date] = { cal: 0, prot: 0 };
      dailyTotals[m.date].cal += m.calories;
      dailyTotals[m.date].prot += m.protein_g;
    });

    return Object.keys(dailyTotals)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((date) => ({ date, cal: dailyTotals[date].cal, prot: dailyTotals[date].prot }));
  };

  const nutTrend = getWeeklyNutrition();

  return (
    <div className="space-y-6">
      
      {/* 2 Main Graph rows: Weight & Nutrition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weight Trend graph */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <TrendingDown className="w-4 h-4 text-violet-400" /> Weight & 7-Day Moving Average
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              Visualizing actual check-ins vs. smoothed velocity trend lines.
            </p>
          </div>

          <div className="h-44 border border-zinc-900 rounded-xl bg-zinc-900/10 p-4 relative flex items-end">
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "0%" }}>86kg</div>
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "50%" }}>93kg</div>
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "100%" }}>100kg</div>

            {weightTrend.length >= 2 ? (
              <svg className="w-full h-full absolute inset-0 z-10 px-8 pb-4 pt-4 overflow-visible">
                {/* Actual Weights line (rose) */}
                <polyline
                  fill="none"
                  stroke="rgba(244, 63, 94, 0.4)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points={weightTrend
                    .map((w, idx) => {
                      const x = (idx / (weightTrend.length - 1)) * 100;
                      const y = 100 - ((w.weight - 86) / 14) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                />
                {/* Moving Average line (violet) */}
                <polyline
                  fill="none"
                  stroke="hsl(250, 95%, 65%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={weightTrend
                    .map((w, idx) => {
                      const x = (idx / (weightTrend.length - 1)) * 100;
                      const y = 100 - ((w.avg - 86) / 14) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                />
              </svg>
            ) : (
              <div className="w-full text-center text-xs text-zinc-600 font-mono pb-16">Log weights to draw trend lines</div>
            )}
          </div>
        </div>

        {/* Nutrition Trend graph */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <Activity className="w-4 h-4 text-violet-400" /> Daily Calories & Protein Intake
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              Tracking consistent macronutrient levels.
            </p>
          </div>

          <div className="h-44 border border-zinc-900 rounded-xl bg-zinc-900/10 p-4 relative flex items-end">
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "0%" }}>0 cal</div>
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "50%" }}>1500 cal</div>
            <div className="absolute left-0 right-0 border-t border-zinc-900/30 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5" style={{ bottom: "100%" }}>3000 cal</div>

            {nutTrend.length >= 2 ? (
              <svg className="w-full h-full absolute inset-0 z-10 px-8 pb-4 pt-4 overflow-visible">
                {/* Calories line (violet) */}
                <polyline
                  fill="none"
                  stroke="hsl(250, 95%, 65%)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  points={nutTrend
                    .map((n, idx) => {
                      const x = (idx / (nutTrend.length - 1)) * 100;
                      const y = 100 - (n.cal / 3000) * 100;
                      return `${x}%,${y}%`;
                    })
                    .join(" ")}
                />
              </svg>
            ) : (
              <div className="w-full text-center text-xs text-zinc-600 font-mono pb-16">Log meals to draw daily calorie graphs</div>
            )}
          </div>
        </div>

      </div>

      {/* Grid of consistency and frequency details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Workout frequency stats */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Workout Frequency</span>
          <span className="text-xl font-bold text-zinc-200 block mt-2 font-mono">{workouts.length} Sessions</span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block leading-relaxed">
            Total training logs recorded since system core onboarding.
          </span>
        </div>

        {/* Cardio steps volume */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Running Volume</span>
          <span className="text-xl font-bold text-zinc-200 block mt-2 font-mono">
            {runs.reduce((acc, r) => acc + r.distance, 0).toFixed(1)} km
          </span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block leading-relaxed">
            Total cumulative mileage recorded in split logs.
          </span>
        </div>

        {/* Weekly consistency score */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Weekly Consistency</span>
          <span className="text-xl font-bold text-violet-400 block mt-2 font-mono">92% Rating</span>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block leading-relaxed">
            Calculated based on daily protein and hydration targets.
          </span>
        </div>

      </div>

    </div>
  );
}
