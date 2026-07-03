"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { Scale, Ruler, Plus, Calendar, Trash2, Award, ArrowDown, ArrowUp } from "lucide-react";

export interface MeasurementLog {
  id: string;
  date: string;
  weight: number;
  waist: number;
  chest: number;
  shoulders: number;
  biceps: number;
  forearms: number;
  thighs: number;
  calves: number;
  neck: number;
  hips: number;
}

export default function MeasurementsTracker() {
  const { addXP, gainStatPoints } = useAuth();

  // Local storage states
  const [logs, setLogs] = useState<MeasurementLog[]>([
    {
      id: "m-start",
      date: "2026-06-29",
      weight: 99.25,
      waist: 102,
      chest: 110,
      shoulders: 120,
      biceps: 38,
      forearms: 31,
      thighs: 64,
      calves: 42,
      neck: 40.5,
      hips: 108
    }
  ]);

  // Form states
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState(99.0);
  const [waist, setWaist] = useState(102);
  const [chest, setChest] = useState(110);
  const [shoulders, setShoulders] = useState(120);
  const [biceps, setBiceps] = useState(38);
  const [forearms, setForearms] = useState(31);
  const [thighs, setThighs] = useState(64);
  const [calves, setCalves] = useState(42);
  const [neck, setNeck] = useState(40.5);
  const [hips, setHips] = useState(108);

  useEffect(() => {
    const stored = localStorage.getItem("atlas.fitness.measurements");
    if (stored) setLogs(JSON.parse(stored));
  }, []);

  const saveLogs = (data: MeasurementLog[]) => {
    setLogs(data);
    localStorage.setItem("atlas.fitness.measurements", JSON.stringify(data));
  };

  const handleLogMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight <= 0) return;

    const newLog: MeasurementLog = {
      id: `m-${Date.now()}`,
      date: logDate,
      weight,
      waist,
      chest,
      shoulders,
      biceps,
      forearms,
      thighs,
      calves,
      neck,
      hips
    };

    const next = [newLog, ...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveLogs(next);

    addXP(30, "Synchronized body measurements");
    gainStatPoints({ discipline: 2 });

    alert("Measurements saved! +30 XP, +2 Discipline.");
  };

  const handleDeleteLog = (id: string) => {
    saveLogs(logs.filter((l) => l.id !== id));
  };

  // CALCULATE PROGRESS DELTA (Latest vs. Starting)
  const getProgressDelta = () => {
    if (logs.length < 2) return null;
    const latest = logs[0];
    const starting = logs[logs.length - 1]; // oldest log

    const keys: Array<keyof Omit<MeasurementLog, "id" | "date">> = [
      "weight",
      "waist",
      "chest",
      "shoulders",
      "biceps",
      "forearms",
      "thighs",
      "calves",
      "neck",
      "hips"
    ];

    const deltas: Record<string, { start: number; current: number; diff: number }> = {};
    keys.forEach((k) => {
      const startVal = starting[k];
      const currentVal = latest[k];
      const diff = parseFloat((currentVal - startVal).toFixed(2));
      deltas[k] = { start: startVal, current: currentVal, diff };
    });

    return deltas;
  };

  const deltas = getProgressDelta();
  const latestLog = logs[0] || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Measurements comparison & delta dashboard */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Deltas panel */}
        {deltas && (
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <Ruler className="w-4 h-4 text-violet-400" /> Transformation Deltas (vs. Start)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {Object.keys(deltas).map((key) => {
                const item = deltas[key];
                const isLoss = item.diff < 0;
                const isZero = item.diff === 0;

                return (
                  <div key={key} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 text-center">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block capitalize">{key}</span>
                    <span className="text-xs font-bold text-zinc-300 block font-mono mt-1">{item.current} {key === "weight" ? "kg" : "cm"}</span>
                    
                    {!isZero ? (
                      <span className={`text-[9px] font-mono font-bold flex items-center justify-center gap-0.5 mt-1.5 ${isLoss ? "text-emerald-400" : "text-amber-500"}`}>
                        {isLoss ? <ArrowDown className="w-2.5 h-2.5" /> : <ArrowUp className="w-2.5 h-2.5" />}
                        {Math.abs(item.diff)} {key === "weight" ? "kg" : "cm"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-500 block mt-1.5">No change</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History table list */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4 max-h-[360px] overflow-y-auto pr-1">
          <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
            Chronological Metrics History
          </span>

          <div className="space-y-3">
            {logs.map((l) => (
              <div key={l.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
                <div>
                  <span className="text-xs font-bold text-zinc-200 font-mono">{l.date}</span>
                  <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                    Weight: {l.weight}kg · Waist: {l.waist}cm · Chest: {l.chest}cm · Hips: {l.hips}cm
                  </span>
                </div>
                {l.id !== "m-start" && (
                  <button
                    onClick={() => handleDeleteLog(l.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Col: Log measurement check-in form */}
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
        <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
          Record Metrics Check-In
        </h4>
        <form onSubmit={handleLogMeasurements} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Waist (cm)</label>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Chest (cm)</label>
              <input
                type="number"
                value={chest}
                onChange={(e) => setChest(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Shoulders (cm)</label>
              <input
                type="number"
                value={shoulders}
                onChange={(e) => setShoulders(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Biceps (cm)</label>
              <input
                type="number"
                value={biceps}
                onChange={(e) => setBiceps(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Forearms (cm)</label>
              <input
                type="number"
                value={forearms}
                onChange={(e) => setForearms(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Thighs (cm)</label>
              <input
                type="number"
                value={thighs}
                onChange={(e) => setThighs(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Calves (cm)</label>
              <input
                type="number"
                value={calves}
                onChange={(e) => setCalves(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Neck (cm)</label>
              <input
                type="number"
                value={neck}
                onChange={(e) => setNeck(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Hips (cm)</label>
              <input
                type="number"
                value={hips}
                onChange={(e) => setHips(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Log Date</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
          >
            Save Metrics Log
          </button>
        </form>
      </div>

    </div>
  );
}
