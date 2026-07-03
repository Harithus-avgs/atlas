"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { Calendar, Plus, Trash2, Award, ShieldAlert, Sparkles } from "lucide-react";

export interface ScheduledWorkout {
  id: string;
  workoutName: string;
  date: string;
  isRestDay: boolean;
}

export const PRESET_TEMPLATES = [
  { name: "Push Day", desc: "Target chest, shoulders, and triceps." },
  { name: "Pull Day", desc: "Target back, biceps, and rear delts." },
  { name: "Leg Day", desc: "Target quadriceps, hamstrings, and calves." },
  { name: "Upper Body", desc: "Target chest, back, shoulders, and arms." },
  { name: "Lower Body", desc: "Target thighs, hamstrings, and calves." },
  { name: "Full Body Calisthenics", desc: "Bodyweight foundation workout." },
  { name: "HIIT Cardio", desc: "High intensity fat burner." },
  { name: "Home Beginner", desc: "Gentle exercises for home workout." },
  { name: "Home Intermediate", desc: "Core and bodyweight progressions." },
  { name: "Walking", desc: "10,000 steps cardio session." },
  { name: "Running", desc: "5km endurance jog." }
];

export default function WorkoutPlanner() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [schedules, setSchedules] = useState<ScheduledWorkout[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  });

  // Form states
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);

  // Load schedules
  useEffect(() => {
    const stored = localStorage.getItem("atlas.fitness.schedules");
    if (stored) setSchedules(JSON.parse(stored));
  }, []);

  const saveSchedules = (data: ScheduledWorkout[]) => {
    setSchedules(data);
    localStorage.setItem("atlas.fitness.schedules", JSON.stringify(data));
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWorkoutName) return;

    const newSchedule: ScheduledWorkout = {
      id: `sched-${Date.now()}`,
      workoutName: customWorkoutName,
      date: scheduleDate,
      isRestDay: false
    };

    // Replace if date already exists
    const next = [newSchedule, ...schedules.filter((s) => s.date !== scheduleDate)];
    saveSchedules(next);

    addXP(15, `Scheduled workout: ${customWorkoutName}`);
    gainStatPoints({ discipline: 1 });

    alert("Workout scheduled! +15 XP.");
    setCustomWorkoutName("");
  };

  const handleToggleRestDay = (dateStr: string) => {
    const existing = schedules.find((s) => s.date === dateStr);
    let next: ScheduledWorkout[];

    if (existing) {
      next = schedules.map((s) =>
        s.date === dateStr ? { ...s, isRestDay: !s.isRestDay, workoutName: !s.isRestDay ? "Rest Day" : "Workout" } : s
      );
    } else {
      const newRest: ScheduledWorkout = {
        id: `sched-${Date.now()}`,
        workoutName: "Rest Day",
        date: dateStr,
        isRestDay: true
      };
      next = [newRest, ...schedules];
    }
    saveSchedules(next);
  };

  const handlePresetSelect = (templateName: string, dateStr: string) => {
    const newSchedule: ScheduledWorkout = {
      id: `sched-${Date.now()}`,
      workoutName: templateName,
      date: dateStr,
      isRestDay: false
    };
    const next = [newSchedule, ...schedules.filter((s) => s.date !== dateStr)];
    saveSchedules(next);

    addXP(10, `Scheduled ${templateName}`);
    gainStatPoints({ discipline: 1 });
  };

  const deleteSchedule = (id: string) => {
    saveSchedules(schedules.filter((s) => s.id !== id));
  };

  // CALCULATE WEEK DAYS (MON-SUN)
  const getWeekDates = () => {
    const list = [];
    const base = new Date(selectedWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split("T")[0];
      const match = schedules.find((s) => s.date === iso);
      list.push({
        date: iso,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        displayDate: d.getDate(),
        schedule: match
      });
    }
    return list;
  };

  const weekDaysList = getWeekDates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Weekly Calendar Grid */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Calendar Navigation header */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-900 pb-4 gap-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Weekly Training Planner
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                Plan routines or toggle rest days to maintain long-term recovery.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const current = new Date(selectedWeekStart);
                  current.setDate(current.getDate() - 7);
                  setSelectedWeekStart(current.toISOString().split("T")[0]);
                }}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
              >
                &lsaquo;
              </button>
              <span className="font-mono text-xs font-bold text-zinc-200">
                Week starting {selectedWeekStart}
              </span>
              <button
                onClick={() => {
                  const current = new Date(selectedWeekStart);
                  current.setDate(current.getDate() + 7);
                  setSelectedWeekStart(current.toISOString().split("T")[0]);
                }}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Calendar week view list */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {weekDaysList.map((day) => {
              const hasWorkout = day.schedule && !day.schedule.isRestDay;
              const hasRest = day.schedule?.isRestDay;

              return (
                <div
                  key={day.date}
                  className={`border rounded-xl p-3 text-center flex flex-col justify-between h-32 transition-all ${
                    hasWorkout
                      ? "bg-violet-600/10 border-violet-500/30"
                      : hasRest
                      ? "bg-zinc-900/10 border-zinc-850 opacity-60"
                      : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-850"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">{day.dayName}</span>
                    <span className="text-sm font-bold text-zinc-300 block font-mono mt-0.5">{day.displayDate}</span>
                  </div>

                  <div className="text-[10px] font-bold text-zinc-200 mt-2 truncate">
                    {day.schedule ? day.schedule.workoutName : "Unscheduled"}
                  </div>

                  <div className="flex gap-1.5 justify-center mt-2.5 pt-2.5 border-t border-zinc-900/50">
                    <button
                      onClick={() => handleToggleRestDay(day.date)}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                        hasRest
                          ? "bg-amber-500/20 border border-amber-500/10 text-amber-400"
                          : "bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Rest
                    </button>
                    {day.schedule && (
                      <button
                        onClick={() => deleteSchedule(day.schedule!.id)}
                        className="p-0.5 text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule templates selector */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Routines Templates Catalog
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
            {PRESET_TEMPLATES.map((tmpl) => (
              <div key={tmpl.name} className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">{tmpl.name}</h5>
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">{tmpl.desc}</p>
                </div>
                {/* Schedule Quick Selection */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handlePresetSelect(tmpl.name, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none text-zinc-400 cursor-pointer"
                >
                  <option value="">Schedule...</option>
                  {weekDaysList.map((day) => (
                    <option key={day.date} value={day.date}>
                      {day.dayName} ({day.displayDate})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Col: Custom manual scheduler form */}
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
        <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
          Add Custom Scheduled Plan
        </h4>
        <form onSubmit={handleAddSchedule} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Workout Name</label>
            <input
              type="text"
              placeholder="e.g. Abs Burner Calisthenics"
              value={customWorkoutName}
              onChange={(e) => setCustomWorkoutName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 text-zinc-200"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Schedule Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Target
          </button>
        </form>
      </div>

    </div>
  );
}
