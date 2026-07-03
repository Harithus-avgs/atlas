"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { Footprints, Activity, Plus, TrendingUp, Award, Calendar, Clock, Trash2 } from "lucide-react";

export interface RunLog {
  id: string;
  date: string;
  distance: number; // km
  durationMins: number;
  pace: string; // min/km
  splits: number[]; // min/km for each km
  calories: number;
  elevation: number; // meters
}

export interface WalkLog {
  id: string;
  date: string;
  steps: number;
  distance: number; // km
  calories: number;
  durationMins: number;
}

export default function RunWalkTracker() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [runs, setRuns] = useState<RunLog[]>([]);
  const [walks, setWalks] = useState<WalkLog[]>([]);

  // Run form states
  const [runDate, setRunDate] = useState(new Date().toISOString().split("T")[0]);
  const [runDist, setRunDist] = useState(5.0);
  const [runDur, setRunDur] = useState(27);
  const [runCal, setRunCal] = useState(450);
  const [runElev, setRunElev] = useState(15);
  const [runSplitsText, setRunSplitsText] = useState("5.3, 5.5, 5.2, 5.4, 5.2"); // comma separated paces

  // Walk form states
  const [walkDate, setWalkDate] = useState(new Date().toISOString().split("T")[0]);
  const [walkSteps, setWalkSteps] = useState(10000);
  const [walkDist, setWalkDist] = useState(7.2);
  const [walkCal, setWalkCal] = useState(350);
  const [walkDur, setWalkDur] = useState(65);

  useEffect(() => {
    const storedRuns = localStorage.getItem("atlas.fitness.runningLogs");
    const storedWalks = localStorage.getItem("atlas.fitness.walkingLogs");
    if (storedRuns) setRuns(JSON.parse(storedRuns));
    if (storedWalks) setWalks(JSON.parse(storedWalks));
  }, []);

  const saveRuns = (data: RunLog[]) => {
    setRuns(data);
    localStorage.setItem("atlas.fitness.runningLogs", JSON.stringify(data));
  };
  const saveWalks = (data: WalkLog[]) => {
    setWalks(data);
    localStorage.setItem("atlas.fitness.walkingLogs", JSON.stringify(data));
  };

  const handleLogRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (runDist <= 0 || runDur <= 0) return;

    // Calculate pace: duration / distance
    const totalPaceSecs = (runDur * 60) / runDist;
    const paceMins = Math.floor(totalPaceSecs / 60);
    const paceSecs = Math.round(totalPaceSecs % 60);
    const paceStr = `${paceMins}:${String(paceSecs).padStart(2, "0")} min/km`;

    const parsedSplits = runSplitsText
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((s) => !isNaN(s));

    const newRun: RunLog = {
      id: `run-${Date.now()}`,
      date: runDate,
      distance: runDist,
      durationMins: runDur,
      pace: paceStr,
      splits: parsedSplits,
      calories: runCal,
      elevation: runElev
    };

    const next = [newRun, ...runs];
    saveRuns(next);

    // RPG progression: running grants XP and endurance points
    addXP(100, `Logged run: ${runDist}km`);
    gainStatPoints({ endurance: Math.ceil(runDist / 2), health: 2 });

    alert(`Run logged! +100 XP, +${Math.ceil(runDist / 2)} Endurance.`);
    setRunSplitsText("");
  };

  const handleLogWalk = (e: React.FormEvent) => {
    e.preventDefault();
    if (walkSteps <= 0) return;

    const newWalk: WalkLog = {
      id: `walk-${Date.now()}`,
      date: walkDate,
      steps: walkSteps,
      distance: walkDist,
      calories: walkCal,
      durationMins: walkDur
    };

    const next = [newWalk, ...walks];
    saveWalks(next);

    // XP based on step counts
    const xpReward = Math.floor(walkSteps / 100);
    addXP(xpReward, `Logged walk: ${walkSteps} steps`);
    gainStatPoints({ endurance: Math.ceil(walkSteps / 5000), health: 1 });

    alert(`Walk logged! +${xpReward} XP.`);
  };

  const handleDeleteRun = (id: string) => {
    saveRuns(runs.filter((r) => r.id !== id));
  };
  const handleDeleteWalk = (id: string) => {
    saveWalks(walks.filter((w) => w.id !== id));
  };

  // CALCULATE MILEAGE (Last 7 days and 30 days)
  const getMileageStats = () => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);

    const weeklyRun = runs
      .filter((r) => new Date(r.date) >= weekAgo)
      .reduce((acc, r) => acc + r.distance, 0);
    const monthlyRun = runs
      .filter((r) => new Date(r.date) >= monthAgo)
      .reduce((acc, r) => acc + r.distance, 0);

    const weeklySteps = walks
      .filter((w) => new Date(w.date) >= weekAgo)
      .reduce((acc, w) => acc + w.steps, 0);

    return {
      weeklyRun: parseFloat(weeklyRun.toFixed(1)),
      monthlyRun: parseFloat(monthlyRun.toFixed(1)),
      weeklySteps
    };
  };

  const mileage = getMileageStats();

  // CALCULATE PERSONAL BESTS (PBs)
  const getPersonalBests = () => {
    // 5k PB: minimum duration for runs >= 5km
    const runs5k = runs.filter((r) => r.distance >= 5.0 && r.distance < 6.0);
    const pb5k = runs5k.length > 0 ? Math.min(...runs5k.map((r) => r.durationMins)) : null;

    // 10k PB
    const runs10k = runs.filter((r) => r.distance >= 10.0);
    const pb10k = runs10k.length > 0 ? Math.min(...runs10k.map((r) => r.durationMins)) : null;

    return { pb5k, pb10k };
  };

  const pbs = getPersonalBests();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Mileage boards & logs list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Mileage statistics widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Weekly Run Mileage</span>
            <span className="text-xl font-bold text-zinc-100 block mt-2 font-mono">{mileage.weeklyRun} km</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Monthly Run Mileage</span>
            <span className="text-xl font-bold text-zinc-100 block mt-2 font-mono">{mileage.monthlyRun} km</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 backdrop-blur">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Weekly Steps Total</span>
            <span className="text-xl font-bold text-zinc-100 block mt-2 font-mono">{mileage.weeklySteps.toLocaleString()}</span>
          </div>
        </div>

        {/* Personal bests cards */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Award className="w-4 h-4 text-violet-400" /> Personal Bests (PRs)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Fastest 5K</span>
              <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">
                {pbs.pb5k ? `${pbs.pb5k} mins` : "N/A"}
              </span>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Fastest 10K</span>
              <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">
                {pbs.pb10k ? `${pbs.pb10k} mins` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* List of recent cardio logs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Running list */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4 h-96 overflow-y-auto">
            <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
              Running Log History
            </span>
            {runs.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-600">No runs logged.</div>
            ) : (
              <div className="space-y-3">
                {runs.map((r) => (
                  <div key={r.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                    <div>
                      <span className="text-xs font-bold text-zinc-200">{r.distance} km</span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{r.date} · {r.durationMins} mins · {r.pace}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteRun(r.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Walking list */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4 h-96 overflow-y-auto">
            <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
              Walking Log History
            </span>
            {walks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-600">No steps logged.</div>
            ) : (
              <div className="space-y-3">
                {walks.map((w) => (
                  <div key={w.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                    <div>
                      <span className="text-xs font-bold text-zinc-200">{w.steps.toLocaleString()} Steps</span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{w.date} · {w.distance} km · {w.durationMins} mins</span>
                    </div>
                    <button
                      onClick={() => handleDeleteWalk(w.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Right Col: Add forms for Running and Walking */}
      <div className="space-y-6">
        
        {/* Log Run Form */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
            Log Running Session
          </h4>
          <form onSubmit={handleLogRun} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.01"
                value={runDist}
                onChange={(e) => setRunDist(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Duration (mins)</label>
                <input
                  type="number"
                  value={runDur}
                  onChange={(e) => setRunDur(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Calories (kcal)</label>
                <input
                  type="number"
                  value={runCal}
                  onChange={(e) => setRunCal(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Elevation (m)</label>
              <input
                type="number"
                value={runElev}
                onChange={(e) => setRunElev(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Pace Splits (comma separated)</label>
              <input
                type="text"
                placeholder="5.2, 5.4, 5.1"
                value={runSplitsText}
                onChange={(e) => setRunSplitsText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-200 focus:outline-none placeholder:text-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Run Date</label>
              <input
                type="date"
                value={runDate}
                onChange={(e) => setRunDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Log Running Session
            </button>
          </form>
        </div>

        {/* Log Walk Form */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
            Log Step Activity
          </h4>
          <form onSubmit={handleLogWalk} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Steps Count</label>
              <input
                type="number"
                value={walkSteps}
                onChange={(e) => setWalkSteps(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={walkDist}
                  onChange={(e) => setWalkDist(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Duration (mins)</label>
                <input
                  type="number"
                  value={walkDur}
                  onChange={(e) => setWalkDur(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Walk Date</label>
              <input
                type="date"
                value={walkDate}
                onChange={(e) => setWalkDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all"
            >
              Log Walking Session
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
