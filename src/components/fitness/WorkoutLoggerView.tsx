"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/auth-context";
import { EXERCISE_DATABASE, ExerciseDefinition } from "./ExerciseDatabaseView";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  Award,
  Zap,
  Clock,
  Square
} from "lucide-react";

interface SetLog {
  reps: number;
  weight: number;
  rpe: number; // 1-10
  isCompleted: boolean;
}

interface LoggedExercise {
  name: string;
  category: string;
  sets: SetLog[];
  restTime: number; // seconds
}

export default function WorkoutLoggerView() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [pastLogs, setPastLogs] = useState<any[]>([]);
  const [activeExercises, setActiveExercises] = useState<LoggedExercise[]>([]);
  const [selectedExName, setSelectedExName] = useState("");

  // WORKOUT SESSION TIMER
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // REST TIMER
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load past logs
  useEffect(() => {
    const storedLogs = localStorage.getItem("atlas.fitness.workoutLogs");
    if (storedLogs) setPastLogs(JSON.parse(storedLogs));
  }, []);

  const saveWorkoutLogs = (data: any[]) => {
    setPastLogs(data);
    localStorage.setItem("atlas.fitness.workoutLogs", JSON.stringify(data));
  };

  // Workout Timer helpers
  const startWorkoutTimer = () => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    sessionTimerRef.current = setInterval(() => {
      setWorkoutTime((prev) => prev + 1);
    }, 1000);
  };

  const pauseWorkoutTimer = () => {
    if (!isTimerRunning) return;
    setIsTimerRunning(false);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  };

  const resetWorkoutTimer = () => {
    pauseWorkoutTimer();
    setWorkoutTime(0);
  };

  // Rest Timer helpers
  const startRestTimer = (seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimeLeft(seconds);
    setIsRestRunning(true);

    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRestRunning(false);
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          alert("Rest period complete! Get ready for your next set.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Add exercise to active session
  const handleAddExercise = () => {
    if (!selectedExName) return;
    const def = EXERCISE_DATABASE.find((e) => e.name === selectedExName);
    if (!def) return;

    const newEx: LoggedExercise = {
      name: def.name,
      category: def.category,
      sets: [{ reps: 10, weight: 20, rpe: 8, isCompleted: false }],
      restTime: 90
    };

    setActiveExercises([...activeExercises, newEx]);
    setSelectedExName("");
    startWorkoutTimer(); // Auto start session timer if not already running
  };

  const handleAddSet = (exIndex: number) => {
    setActiveExercises((prev) => {
      const next = [...prev];
      const currentSets = next[exIndex].sets;
      const lastSet = currentSets[currentSets.length - 1] || { reps: 10, weight: 20, rpe: 8 };
      currentSets.push({
        reps: lastSet.reps,
        weight: lastSet.weight,
        rpe: lastSet.rpe,
        isCompleted: false
      });
      return next;
    });
  };

  const handleToggleSetDone = (exIndex: number, setIndex: number) => {
    setActiveExercises((prev) => {
      const next = [...prev];
      const set = next[exIndex].sets[setIndex];
      set.isCompleted = !set.isCompleted;

      // Start rest timer upon ticking "Done"
      if (set.isCompleted) {
        startRestTimer(next[exIndex].restTime);
        checkPersonalRecord(next[exIndex].name, set.weight, set.reps);
      }
      return next;
    });
  };

  // Personal Record checks
  const checkPersonalRecord = (exName: string, weight: number, reps: number) => {
    let maxWeight = 0;
    pastLogs.forEach((log) => {
      log.exercises.forEach((ex: any) => {
        if (ex.name === exName) {
          ex.sets.forEach((s: any) => {
            if (s.weight > maxWeight) maxWeight = s.weight;
          });
        }
      });
    });

    if (weight > maxWeight && maxWeight > 0) {
      addXP(50, `Unlocked Personal Record in ${exName}: ${weight}kg!`);
      alert(`🎉 NEW PERSONAL RECORD! Tapped out ${weight}kg on ${exName}. +50 XP!`);
    }
  };

  const handleFinishWorkout = () => {
    if (activeExercises.length === 0) return;

    const finishedSession = {
      id: `wlog-${Date.now()}`,
      name: "Logged Workout",
      date: new Date().toISOString().split("T")[0],
      durationMins: Math.round(workoutTime / 60),
      exercises: activeExercises,
      createdAt: Date.now()
    };

    saveWorkoutLogs([finishedSession, ...pastLogs]);

    // Reward core XP based on training volume
    const totalSets = activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const xpReward = 100 + totalSets * 10; // 100 base + 10 XP per set

    addXP(xpReward, `Completed training session: ${totalSets} sets`);
    gainStatPoints({ strength: 4, endurance: 2, consistency: 1 });

    alert(`Workout logged! Awarded +${xpReward} XP, +4 Strength.`);
    setActiveExercises([]);
    resetWorkoutTimer();
  };

  // Format seconds to mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Active Workout Logger */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Session header & timers */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider block">
              Active Workout Session
            </span>
            <div className="flex items-center gap-2 mt-2">
              <Timer className="w-5 h-5 text-zinc-400" />
              <span className="text-xl font-bold font-mono text-zinc-100">{formatTime(workoutTime)}</span>
            </div>
          </div>

          {/* Timers controls */}
          <div className="flex gap-2">
            {!isTimerRunning ? (
              <button
                onClick={startWorkoutTimer}
                className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={pauseWorkoutTimer}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg transition-colors cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            )}
            <button
              onClick={resetWorkoutTimer}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exercises List Logger */}
        {activeExercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase">
                  {ex.category}
                </span>
                <h4 className="text-sm font-bold text-zinc-200 mt-2">{ex.name}</h4>
              </div>
              
              {/* Custom Rest Selector */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Rest Time:</span>
                <select
                  value={ex.restTime}
                  onChange={(e) => {
                    const nextRest = parseInt(e.target.value);
                    setActiveExercises((prev) => {
                      const next = [...prev];
                      next[exIdx].restTime = nextRest;
                      return next;
                    });
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none"
                >
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                  <option value={90}>90s</option>
                  <option value={120}>120s</option>
                </select>
              </div>
            </div>

            {/* Sets input list */}
            <div className="space-y-3">
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-5 gap-3.5 items-center">
                  <span className="text-xs text-zinc-500 font-mono text-center">Set {setIdx + 1}</span>
                  
                  <div>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setActiveExercises((prev) => {
                          const next = [...prev];
                          next[exIdx].sets[setIdx].weight = val;
                          return next;
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-xs font-mono text-center text-zinc-200 focus:outline-none"
                    />
                    <span className="text-[8px] text-zinc-600 text-center block mt-0.5">kg</span>
                  </div>

                  <div>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setActiveExercises((prev) => {
                          const next = [...prev];
                          next[exIdx].sets[setIdx].reps = val;
                          return next;
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-xs font-mono text-center text-zinc-200 focus:outline-none"
                    />
                    <span className="text-[8px] text-zinc-600 text-center block mt-0.5">reps</span>
                  </div>

                  <div>
                    <select
                      value={set.rpe}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 8;
                        setActiveExercises((prev) => {
                          const next = [...prev];
                          next[exIdx].sets[setIdx].rpe = val;
                          return next;
                        });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-1.5 text-xs text-center focus:outline-none text-zinc-400"
                    >
                      {[6, 7, 8, 9, 10].map(r => (
                        <option key={r} value={r}>RPE {r}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleToggleSetDone(exIdx, setIdx)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                      set.isCompleted
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {set.isCompleted ? "Done" : "Mark"}
                  </button>
                </div>
              ))}
            </div>

            {/* Set Actions row */}
            <div className="pt-2 flex justify-between">
              <button
                onClick={() => handleAddSet(exIdx)}
                className="text-[10px] text-violet-400 hover:text-violet-300 font-mono font-bold uppercase transition-colors"
              >
                + Add Set
              </button>
              <button
                onClick={() => {
                  setActiveExercises(activeExercises.filter((_, idx) => idx !== exIdx));
                }}
                className="text-[10px] text-zinc-600 hover:text-red-400 font-mono font-bold uppercase transition-colors"
              >
                Remove Exercise
              </button>
            </div>

          </div>
        ))}

        {activeExercises.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleFinishWorkout}
              className="py-3 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/10 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Training Log
            </button>
          </div>
        )}

      </div>

      {/* Right Col: Exercise Library Selector & Rest Timer */}
      <div className="space-y-6">
        
        {/* Rest Timer Panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 mb-4 font-mono uppercase tracking-wider">
            <Clock className="w-4 h-4 text-violet-400" /> Rest Countdown
          </h4>
          <div className="text-center py-4">
            <span className="text-3xl font-mono font-bold text-zinc-200 block">{formatTime(restTimeLeft)}</span>
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => startRestTimer(90)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 transition-colors"
              >
                90s Rest
              </button>
              <button
                onClick={() => {
                  setIsRestRunning(false);
                  if (restTimerRef.current) clearInterval(restTimerRef.current);
                  setRestTimeLeft(0);
                }}
                className="p-2 bg-zinc-905 border border-zinc-850 text-zinc-600 hover:text-zinc-300 rounded-lg"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Exercise Selector Panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
          <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
            Add Exercise to Workout
          </h4>
          <div className="space-y-4">
            <select
              value={selectedExName}
              onChange={(e) => setSelectedExName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
            >
              <option value="">Select Exercise</option>
              {EXERCISE_DATABASE.map((ex) => (
                <option key={ex.name} value={ex.name}>{ex.name} ({ex.category})</option>
              ))}
            </select>

            <button
              onClick={handleAddExercise}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Exercise
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
