"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import {
  Flame,
  Droplet,
  GlassWater,
  Dumbbell,
  Scale,
  Award,
  Calendar,
  Sparkles,
  Heart,
  Plus
} from "lucide-react";

export default function FitnessDashboard() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [meals, setMeals] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    neck: 40.5,
    chest: 110,
    waist: 102,
    hips: 108,
    bicep: 38
  });

  const [waterMl, setWaterMl] = useState(1500);
  const [proteinG, setProteinG] = useState(45);
  const [calories, setCalories] = useState(900);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {
    const storedMeals = localStorage.getItem("atlas.fitness.meals");
    const storedSchedules = localStorage.getItem("atlas.fitness.schedules");
    const storedWeights = localStorage.getItem("atlas.fitness.weights");
    const storedPhotos = localStorage.getItem("atlas.fitness.photos");
    const storedWorkouts = localStorage.getItem("atlas.fitness.workoutLogs");
    const storedMeasurements = localStorage.getItem("atlas.fitness.measurements");

    if (storedMeals) {
      const parsedMeals = JSON.parse(storedMeals);
      setMeals(parsedMeals);
      // Sum today's macros
      const todayMeals = parsedMeals.filter((m: any) => m.date === todayStr);
      const sumCal = todayMeals.reduce((acc: number, m: any) => acc + m.calories, 0);
      const sumProt = todayMeals.reduce((acc: number, m: any) => acc + m.protein_g, 0);
      const sumWater = todayMeals.reduce((acc: number, m: any) => acc + m.water_ml, 0);
      setCalories(sumCal);
      setProteinG(sumProt);
      setWaterMl(sumWater);
    }
    if (storedSchedules) setSchedules(JSON.parse(storedSchedules));
    if (storedWeights) setWeights(JSON.parse(storedWeights));
    if (storedPhotos) setPhotos(JSON.parse(storedPhotos));
    if (storedWorkouts) setWorkoutLogs(JSON.parse(storedWorkouts));
    if (storedMeasurements) setBodyMeasurements(JSON.parse(storedMeasurements));
  }, []);

  const TARGET_CALORIES = 2500;
  const TARGET_PROTEIN = 120;
  const TARGET_WATER = 3500;

  // Quick Action methods
  const logQuickWater = () => {
    const nextWater = waterMl + 250;
    setWaterMl(nextWater);
    // Find or create today's meal entry for quick log
    const quickMeal = {
      id: `meal-${Date.now()}`,
      mealType: "custom",
      mealName: "Quick Water Intake",
      time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      foods: [],
      quantity: 1,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      water_ml: 250,
      date: todayStr
    };
    const nextMeals = [quickMeal, ...meals];
    setMeals(nextMeals);
    localStorage.setItem("atlas.fitness.meals", JSON.stringify(nextMeals));

    addXP(5, "Quick Logged 250ml Water");
    gainStatPoints({ health: 1 });
    alert("Water logged! +5 XP.");
  };

  const logQuickProtein = () => {
    const nextProtein = proteinG + 30;
    const nextCal = calories + 120;
    setProteinG(nextProtein);
    setCalories(nextCal);

    const quickMeal = {
      id: `meal-${Date.now()}`,
      mealType: "custom",
      mealName: "Protein Shake Quick Log",
      time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      foods: [{ name: "Whey Protein", calories: 120, protein: 30, carbs: 2, fat: 1, fiber: 0 }],
      quantity: 1,
      calories: 120,
      protein_g: 30,
      carbs_g: 2,
      fat_g: 1,
      fiber_g: 0,
      water_ml: 250,
      date: todayStr
    };
    const nextMeals = [quickMeal, ...meals];
    setMeals(nextMeals);
    localStorage.setItem("atlas.fitness.meals", JSON.stringify(nextMeals));

    addXP(15, "Logged 30g Protein Shake");
    gainStatPoints({ health: 1, strength: 1 });
    alert("Protein Shake logged! +15 XP.");
  };

  const todayWorkout = schedules.find((s) => s.date === todayStr);
  const tomorrowWorkout = schedules.find((s) => s.date === tomorrowStr);
  const latestWeight = weights[0]?.weight || 99.25;

  // Extract latest personal record
  const getRecentPR = () => {
    if (workoutLogs.length === 0) return null;
    // Simple look up of heaviest set logged
    let prName = "";
    let prWeight = 0;
    let prReps = 0;

    workoutLogs.forEach((log) => {
      log.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          if (s.weight > prWeight) {
            prWeight = s.weight;
            prName = ex.name;
            prReps = s.reps;
          }
        });
      });
    });

    if (prWeight === 0) return null;
    return `${prName}: ${prWeight}kg x ${prReps}`;
  };

  const recentPR = getRecentPR();

  // Progress ring percentage
  const calPercent = Math.min(100, Math.round((calories / TARGET_CALORIES) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Col: Nutrition progress ring and quick add buttons */}
      <div className="space-y-6">
        
        {/* Nutrition progress ring */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur flex flex-col items-center text-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">
            Daily Calories Ring
          </span>

          {/* SVG Progress Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#18181b" strokeWidth="6" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="hsl(250, 95%, 65%)"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * calPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold font-mono text-zinc-100">{calories}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Target {TARGET_CALORIES}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mt-6 text-center border-t border-zinc-900 pt-4">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Protein target</span>
              <span className="text-sm font-bold text-emerald-400 block font-mono mt-0.5">{proteinG} / {TARGET_PROTEIN} g</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Water target</span>
              <span className="text-sm font-bold text-blue-400 block font-mono mt-0.5">{waterMl} / {TARGET_WATER} ml</span>
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono mb-4">
            Quick Log Activity
          </h4>
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={logQuickWater}
              className="py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors cursor-pointer text-zinc-300"
            >
              <GlassWater className="w-4 h-4 text-blue-400" />
              <span>+250ml Water</span>
            </button>
            <button
              onClick={logQuickProtein}
              className="py-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors cursor-pointer text-zinc-300"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>+30g Protein</span>
            </button>
          </div>
        </div>

      </div>

      {/* Middle Col: Workouts scheduler list & Today's meals */}
      <div className="space-y-6">
        
        {/* Workout Scheduler display */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-2">
            Training Schedule
          </span>
          
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Today's Workout</span>
                <span className="text-xs font-bold text-zinc-200 block mt-1">
                  {todayWorkout ? todayWorkout.workoutName : "No scheduled workout (Rest)"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-xl p-4 flex items-center justify-between opacity-70">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 text-zinc-500 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Tomorrow's Routine</span>
                <span className="text-xs font-semibold text-zinc-400 block mt-1">
                  {tomorrowWorkout ? tomorrowWorkout.workoutName : "No scheduled workout (Rest)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Meals list */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-3 max-h-72 overflow-y-auto">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-2">
            Today's Logged Foods
          </span>

          {meals.filter(m => m.date === todayStr).map((m) => (
            <div key={m.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">{m.mealType}</span>
                <h5 className="text-xs font-bold text-zinc-200 mt-1">{m.mealName}</h5>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">{m.calories} kcal</span>
            </div>
          ))}

          {meals.filter(m => m.date === todayStr).length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-600">No meals logged today.</div>
          )}
        </div>

      </div>

      {/* Right Col: Weight trends, measurements summary, recent PRs */}
      <div className="space-y-6">
        
        {/* Weight trend summary */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-2">
            Weight Target Tracking
          </span>

          <div className="flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-[9px] text-zinc-500 block">Current Weight</span>
              <span className="text-sm font-bold text-zinc-200 mt-1 block">{latestWeight} kg</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-500 block">Goal Weight</span>
              <span className="text-sm font-bold text-violet-400 mt-1 block">86.0 kg</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900">
            {/* Start 99.25, goal 86. diff 13.25 */}
            <div
              style={{ width: `${Math.min(100, Math.round(((99.25 - latestWeight) / 13.25) * 100))}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>

        {/* PR & Metrics summaries */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-2">
            Recent PR & Dimensions
          </span>

          {recentPR && (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                <span className="text-xs font-bold text-zinc-200">Personal Record</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{recentPR}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-2.5 text-center">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Chest</span>
              <span className="text-xs font-bold text-zinc-300 block mt-1 font-mono">{bodyMeasurements.chest}cm</span>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-2.5 text-center">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Waist</span>
              <span className="text-xs font-bold text-zinc-300 block mt-1 font-mono">{bodyMeasurements.waist}cm</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
