"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/auth-context";
import { WORKOUT_LIBRARY, WorkoutTemplate } from "../../lib/fitness/workout-library";
import { generateWeightPrediction, calculateBmi, WeightLog } from "../../lib/fitness/predictions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Dumbbell,
  Droplet,
  GlassWater,
  Heart,
  TrendingDown,
  TrendingUp,
  Activity,
  Award,
  Zap,
  CheckSquare,
  Play,
  RotateCcw,
  Moon,
  Footprints,
  Calendar
} from "lucide-react";

type TabType = "dashboard" | "metrics" | "workouts" | "predictions";

export default function FitnessModule() {
  const { addXP, gainStatPoints } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Local storage states
  const [weights, setWeights] = useState<WeightLog[]>([
    { date: "2026-06-29", weight: 99.25 } // starting baseline weight
  ]);
  const [waterMl, setWaterMl] = useState(2000);
  const [proteinG, setProteinG] = useState(60);
  const [sleepHours, setSleepHours] = useState(7);
  const [stepsCount, setStepsCount] = useState(6000);
  const [runningKm, setRunningKm] = useState(0);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    neck: 40.5,
    chest: 110,
    waist: 102,
    hips: 108,
    bicep: 38
  });
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]); // array of dates e.g. "2026-07-02"

  // Active workout session state
  const [activeSession, setActiveSession] = useState<WorkoutTemplate | null>(null);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean[]>>({});

  // Form states
  const [newWeight, setNewWeight] = useState(99.0);
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);

  // Load from local storage on mount
  useEffect(() => {
    const storedWeights = localStorage.getItem("atlas.fitness.weights");
    const storedWater = localStorage.getItem("atlas.fitness.water");
    const storedProtein = localStorage.getItem("atlas.fitness.protein");
    const storedSleep = localStorage.getItem("atlas.fitness.sleep");
    const storedSteps = localStorage.getItem("atlas.fitness.steps");
    const storedRunning = localStorage.getItem("atlas.fitness.running");
    const storedMeasurements = localStorage.getItem("atlas.fitness.measurements");
    const storedCompleted = localStorage.getItem("atlas.fitness.completedWorkouts");

    if (storedWeights) setWeights(JSON.parse(storedWeights));
    if (storedWater) setWaterMl(parseInt(storedWater));
    if (storedProtein) setProteinG(parseInt(storedProtein));
    if (storedSleep) setSleepHours(parseFloat(storedSleep));
    if (storedSteps) setStepsCount(parseInt(storedSteps));
    if (storedRunning) setRunningKm(parseFloat(storedRunning));
    if (storedMeasurements) setBodyMeasurements(JSON.parse(storedMeasurements));
    if (storedCompleted) setCompletedWorkouts(JSON.parse(storedCompleted));
  }, []);

  // Sync helpers
  const saveWeights = (data: WeightLog[]) => {
    setWeights(data);
    localStorage.setItem("atlas.fitness.weights", JSON.stringify(data));
  };
  const saveCompletedWorkouts = (data: string[]) => {
    setCompletedWorkouts(data);
    localStorage.setItem("atlas.fitness.completedWorkouts", JSON.stringify(data));
  };

  // LOGGERS ACTIONS
  const handleQuickWater = () => {
    const nextVal = waterMl + 250;
    setWaterMl(nextVal);
    localStorage.setItem("atlas.fitness.water", String(nextVal));

    addXP(5, "Logged water intake");
    gainStatPoints({ health: 1 });
  };

  const handleQuickProtein = () => {
    const nextVal = proteinG + 30;
    setProteinG(nextVal);
    localStorage.setItem("atlas.fitness.protein", String(nextVal));

    addXP(15, "Logged protein shake");
    gainStatPoints({ health: 1, strength: 1 });
  };

  const handleLogSteps = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("atlas.fitness.steps", String(stepsCount));
    
    // Reward XP based on step milestones
    const xpReward = Math.floor(stepsCount / 100);
    addXP(xpReward, `Completed step tracker: ${stepsCount} steps`);
    gainStatPoints({ endurance: Math.ceil(stepsCount / 4000), health: 1 });
    alert(`Steps updated! Awarded +${xpReward} XP.`);
  };

  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("atlas.fitness.sleep", String(sleepHours));
    
    addXP(20, `Logged sleep duration: ${sleepHours} hours`);
    gainStatPoints({ health: 2, discipline: 1 });
    alert("Sleep logged! +20 XP, +2 Health.");
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WeightLog = { date: newWeightDate, weight: newWeight };
    
    // Insert sorted
    const updated = [newLog, ...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveWeights(updated);

    addXP(25, `Synchronized body weight: ${newWeight}kg`);
    gainStatPoints({ discipline: 2 });
    
    alert(`Weight logged at ${newWeight} kg! +25 XP, +2 Discipline.`);
  };

  // WORKOUT SESSION ACTIONS
  const startWorkoutSession = (template: WorkoutTemplate) => {
    setActiveSession(template);
    
    // Initialize checkboxes for each exercise
    const checkState: Record<string, boolean[]> = {};
    template.exercises.forEach((ex) => {
      checkState[ex.name] = new Array(ex.sets).fill(false);
    });
    setCheckedExercises(checkState);
  };

  const handleToggleSetCheckbox = (exerciseName: string, setIndex: number) => {
    setCheckedExercises((prev) => {
      const currentSets = [...prev[exerciseName]];
      currentSets[setIndex] = !currentSets[setIndex];
      return { ...prev, [exerciseName]: currentSets };
    });
  };

  const finishWorkoutSession = () => {
    if (!activeSession) return;

    // Check if all sets completed
    const allChecked = Object.keys(checkedExercises).every((exName) =>
      checkedExercises[exName].every((set) => set === true)
    );

    if (!allChecked) {
      const confirmFinish = confirm("You haven't completed all sets. Finish anyway?");
      if (!confirmFinish) return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const nextCompleted = Array.from(new Set([...completedWorkouts, todayStr]));
    saveCompletedWorkouts(nextCompleted);

    // Dynamic XP based on difficulty
    let xpReward = 100;
    let strengthGain = 2;
    let enduranceGain = 1;

    if (activeSession.difficulty === "medium") {
      xpReward = 150;
      strengthGain = 3;
      enduranceGain = 2;
    } else if (activeSession.difficulty === "hard") {
      xpReward = 250;
      strengthGain = 5;
      enduranceGain = 3;
    }

    addXP(xpReward, `Finished Home Workout: ${activeSession.name}`);
    gainStatPoints({
      strength: strengthGain,
      endurance: enduranceGain,
      health: 3,
      consistency: 1
    });

    alert(`Workout complete! Awarded +${xpReward} XP, +${strengthGain} Strength, +${enduranceGain} Endurance.`);
    setActiveSession(null);
  };

  // PREDICTION SUMMARY
  const prediction = generateWeightPrediction(weights, 86.0);
  const latestWeight = weights[0]?.weight || 99.25;
  const bmiDetails = calculateBmi(latestWeight);

  // HEATMAP DATE CALCULATOR
  const getHeatmapGrid = () => {
    const list = [];
    const base = new Date();
    // Render last 28 days (4 weeks)
    for (let i = 27; i >= 0; i--) {
      const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split("T")[0];
      const isCompleted = completedWorkouts.includes(iso);
      list.push({ date: iso, active: isCompleted, dayName: d.toLocaleDateString("en-US", { weekday: "short" })[0] });
    }
    return list;
  };

  const heatmapDays = getHeatmapGrid();

  return (
    <div className="space-y-6">
      
      {/* Sub navigation Tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-2.5 pb-0.5">
        {(["dashboard", "metrics", "workouts", "predictions"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setActiveSession(null); // Cancel active session overlay
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "metrics" ? "Body Metrics" : tab === "workouts" ? "Home Workouts" : tab === "predictions" ? "Goal Forecasts" : tab}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Quick Logs & Counters (left 2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Quick Log Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Water logging */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Droplet className="w-5 h-5 fill-blue-500/10" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Hydration Target</span>
                    <span className="text-base font-bold text-zinc-200 block font-mono mt-0.5">
                      {waterMl} / 3500 ml
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleQuickWater}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg hover:text-white transition-colors"
                >
                  <GlassWater className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              {/* Protein logging */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                    <Flame className="w-5 h-5 fill-rose-500/10" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Protein Intake</span>
                    <span className="text-base font-bold text-zinc-200 block font-mono mt-0.5">
                      {proteinG} / 120 g
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleQuickProtein}
                  className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-bold font-mono transition-colors"
                >
                  +30g
                </button>
              </div>

            </div>

            {/* Steps & Sleep logs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Steps count input */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 mb-4 font-mono uppercase tracking-wider">
                  <Footprints className="w-4 h-4 text-violet-400" /> Steps Counter
                </h4>
                <form onSubmit={handleLogSteps} className="flex gap-3">
                  <input
                    type="number"
                    value={stepsCount}
                    onChange={(e) => setStepsCount(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Sync
                  </button>
                </form>
              </div>

              {/* Sleep log */}
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 mb-4 font-mono uppercase tracking-wider">
                  <Moon className="w-4 h-4 text-violet-400" /> Sleep Duration
                </h4>
                <form onSubmit={handleLogSleep} className="flex gap-3">
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Sync
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* SVG Activity Heatmap (right col) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
                <Calendar className="w-4 h-4 text-violet-400" /> Workout Heatmap
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Consistency tracker detailing completed home workouts in the last 28 days.
              </p>
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-7 gap-2.5 my-6">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date} - ${day.active ? "Workout Completed" : "Rest Day"}`}
                  className={`aspect-square rounded-md border flex flex-col items-center justify-center font-mono text-[9px] relative group cursor-help transition-all ${
                    day.active
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-400 shadow-sm shadow-violet-600/10"
                      : "bg-zinc-900/10 border-zinc-900 text-zinc-600"
                  }`}
                >
                  {day.dayName}
                </div>
              ))}
            </div>

            <div className="text-[9px] font-mono text-zinc-500 flex justify-between items-center uppercase tracking-wider">
              <span>Rest day</span>
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded border border-zinc-900" />
                <span className="text-[8px]">&rarr;</span>
                <div className="w-2.5 h-2.5 bg-violet-600/20 border border-violet-500/40" />
                <span>Active</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Weight log history & body parameters */}
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Body Parameters & Composition
            </h3>

            {/* Grid display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Height</span>
                <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">190.5 cm</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Weight</span>
                <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">{latestWeight} kg</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">BMI Index</span>
                <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">{bmiDetails.bmi}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">BMI Status</span>
                <span className="text-xs font-semibold text-violet-400 block mt-2.5 uppercase tracking-wide">
                  {bmiDetails.category}
                </span>
              </div>
            </div>

            {/* Measurements */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider">
                Body Measurements
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.keys(bodyMeasurements).map((k) => {
                  const val = bodyMeasurements[k as keyof typeof bodyMeasurements];
                  return (
                    <div key={k} className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5 text-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block capitalize">{k}</span>
                      <span className="text-sm font-bold text-zinc-300 block font-mono mt-1">{val} cm</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form to log weight */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Synchronize Weight Log
            </h4>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Weight Value (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Log Date</label>
                <input
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Weight Entry
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === "workouts" && (
        <div className="space-y-6">
          
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div
                key="workout-library-list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {WORKOUT_LIBRARY.map((w) => (
                  <div
                    key={w.id}
                    className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur flex flex-col justify-between hover:border-zinc-800 transition-colors h-64"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/10 uppercase tracking-wider">
                          {w.category}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">
                          Difficulty: {w.difficulty}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-zinc-200 mt-3">{w.name}</h4>
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
                        {w.description}
                      </p>
                    </div>

                    <button
                      onClick={() => startWorkoutSession(w)}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Training Session
                    </button>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="active-workout-session"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6"
              >
                {/* Active Session Header */}
                <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                      Training Session Active
                    </span>
                    <h3 className="text-lg font-bold text-zinc-100 mt-1">{activeSession.name}</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Cancel current workout session? Progress will be lost.")) {
                        setActiveSession(null);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white text-xs font-bold transition-colors"
                  >
                    Cancel Session
                  </button>
                </div>

                {/* Exercises set checklist */}
                <div className="space-y-4">
                  {activeSession.exercises.map((ex) => {
                    const checks = checkedExercises[ex.name] || [];
                    return (
                      <div key={ex.name} className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                        <div>
                          <span className="text-xs font-bold text-zinc-200">{ex.name}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 leading-relaxed">{ex.description}</span>
                        </div>
                        
                        <div className="text-xs font-semibold text-zinc-400 font-mono text-center">
                          Target: {ex.sets} sets &times; {ex.reps} reps
                        </div>

                        {/* Set checkboxes */}
                        <div className="flex gap-2.5 justify-end">
                          {checks.map((chk, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleToggleSetCheckbox(ex.name, idx)}
                              className={`w-8 h-8 rounded-lg font-mono font-bold text-xs border flex items-center justify-center transition-all ${
                                chk
                                  ? "bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-600/10"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              S{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Finish Session trigger */}
                <div className="border-t border-zinc-900 pt-6 flex justify-end">
                  <button
                    onClick={finishWorkoutSession}
                    className="py-3 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/10 flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" /> Finish Training & Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {activeTab === "predictions" && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <Activity className="w-4 h-4 text-violet-400" /> Goal Estimations & Calculations
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              Linear regression calculates your weight velocity slope and estimates when you hit 86 kg.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-zinc-300 text-xs leading-relaxed font-mono">
            {prediction.statusMessage}
          </div>

          {weights.length >= 2 && (
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block border-b border-zinc-900 pb-2">
                Weight Trend chart
              </span>
              
              {/* Premium custom SVG weight chart */}
              <div className="h-44 border border-zinc-900 rounded-xl bg-zinc-900/10 p-4 relative flex items-end">
                {/* Horizontal grid lines */}
                {[0, 50, 100].map((val, idx) => (
                  <div
                    key={idx}
                    className="absolute left-0 right-0 border-t border-zinc-900/40 text-[8px] font-mono text-zinc-600 pl-2 pt-0.5"
                    style={{ bottom: `${val}%` }}
                  >
                    {val === 0 ? "86kg" : val === 50 ? "93kg" : "100kg"}
                  </div>
                ))}

                <svg className="w-full h-full absolute inset-0 z-10 px-8 pb-4 pt-4 overflow-visible">
                  <polyline
                    fill="none"
                    stroke="hsl(346, 84%, 61%)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points={weights
                      .slice()
                      .reverse()
                      .map((log, idx) => {
                        const x = (idx / (weights.length - 1)) * 100; // percent
                        // map 86kg (bottom) to 100kg (top)
                        const range = 14; // 100 - 86
                        const y = 100 - ((log.weight - 86) / range) * 100;
                        return `${x}%,${y}%`;
                      })
                      .join(" ")}
                  />
                  {weights.slice().reverse().map((log, idx) => {
                    const x = `${(idx / (weights.length - 1)) * 100}%`;
                    const range = 14;
                    const y = `${100 - ((log.weight - 86) / range) * 100}%`;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="hsl(346, 84%, 61%)"
                        stroke="black"
                        strokeWidth="2"
                      >
                        <title>{`${log.date}: ${log.weight}kg`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
