"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Award,
  Sparkles,
  Plus,
  Compass,
  Image as ImageIcon,
  Flame,
  CheckCircle,
  Lightbulb,
  FileCode,
  Heart,
  Calendar
} from "lucide-react";

type TabType = "dashboard" | "gallery" | "projects" | "ideas";

interface Sketch {
  id: string;
  title: string;
  description: string;
  style: "minimalist" | "abstract" | "geometric";
  date: string;
  seed: string;
}

interface CreativeProject {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed";
  createdAt: string;
}

interface CreativeIdea {
  id: string;
  category: "illustration" | "design" | "writing";
  title: string;
  notes: string;
  date: string;
}

interface MoodPin {
  id: string;
  type: "color" | "text" | "link";
  value: string; // hex code, quote, or image url
  caption: string;
}

export default function CreativeModule() {
  const { addXP, gainStatPoints } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Local storage states
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [ideas, setIdeas] = useState<CreativeIdea[]>([]);
  const [moodPins, setMoodPins] = useState<MoodPin[]>([
    { id: "pin-1", type: "color", value: "#8B5CF6", caption: "Deep Violet Accent" },
    { id: "pin-2", type: "text", value: "Minimalism is not subtraction, it is focus.", caption: "Philosophy" },
    { id: "pin-3", type: "color", value: "#F59E0B", caption: "Warm Gold Accent" }
  ]);
  const [streakCount, setStreakCount] = useState(0);

  // Form states
  const [sketchTitle, setSketchTitle] = useState("");
  const [sketchDesc, setSketchDesc] = useState("");
  const [sketchStyle, setSketchStyle] = useState<Sketch["style"]>("minimalist");
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<CreativeIdea["category"]>("illustration");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaNotes, setIdeaNotes] = useState("");
  const [pinType, setPinType] = useState<MoodPin["type"]>("color");
  const [pinVal, setPinVal] = useState("#3B82F6");
  const [pinCap, setPinCap] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const storedSketches = localStorage.getItem("atlas.creative.sketches");
    const storedProj = localStorage.getItem("atlas.creative.projects");
    const storedIdeas = localStorage.getItem("atlas.creative.ideas");
    const storedPins = localStorage.getItem("atlas.creative.pins");
    const storedStreak = localStorage.getItem("atlas.creative.streak");

    if (storedSketches) setSketches(JSON.parse(storedSketches));
    if (storedProj) setProjects(JSON.parse(storedProj));
    if (storedIdeas) setIdeas(JSON.parse(storedIdeas));
    if (storedPins) setMoodPins(JSON.parse(storedPins));
    if (storedStreak) setStreakCount(parseInt(storedStreak));
  }, []);

  // Sync helpers
  const saveSketches = (data: Sketch[]) => {
    setSketches(data);
    localStorage.setItem("atlas.creative.sketches", JSON.stringify(data));
  };
  const saveProjects = (data: CreativeProject[]) => {
    setProjects(data);
    localStorage.setItem("atlas.creative.projects", JSON.stringify(data));
  };
  const saveIdeas = (data: CreativeIdea[]) => {
    setIdeas(data);
    localStorage.setItem("atlas.creative.ideas", JSON.stringify(data));
  };
  const savePins = (data: MoodPin[]) => {
    setMoodPins(data);
    localStorage.setItem("atlas.creative.pins", JSON.stringify(data));
  };
  const saveStreak = (data: number) => {
    setStreakCount(data);
    localStorage.setItem("atlas.creative.streak", String(data));
  };

  // LOGGERS ACTIONS
  const handleAddSketch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sketchTitle) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newSketch: Sketch = {
      id: `sketch-${Date.now()}`,
      title: sketchTitle,
      description: sketchDesc,
      style: sketchStyle,
      date: todayStr,
      seed: Math.random().toString(36).substring(7)
    };

    const nextSketches = [newSketch, ...sketches];
    saveSketches(nextSketches);

    // Update creative streaks
    const lastDate = sketches[0]?.date;
    let nextStreak = streakCount;
    if (!lastDate || lastDate !== todayStr) {
      nextStreak += 1;
      saveStreak(nextStreak);
    }

    // RPG XP: Hitting daily sketch challenges gives +50 XP
    addXP(50, `Completed daily sketch: ${sketchTitle}`);
    gainStatPoints({ creativity: 3, consistency: 1 });

    alert(`Sketch logged! Creative streak: ${nextStreak} days. +50 XP awarded.`);
    setSketchTitle("");
    setSketchDesc("");
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    const newProj: CreativeProject = {
      id: `proj-${Date.now()}`,
      name: projName,
      description: projDesc,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0]
    };
    saveProjects([...projects, newProj]);
    setProjName("");
    setProjDesc("");
    alert("Creative project created!");
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle) return;
    const newIdea: CreativeIdea = {
      id: `idea-${Date.now()}`,
      category: ideaCategory,
      title: ideaTitle,
      notes: ideaNotes,
      date: new Date().toISOString().split("T")[0]
    };
    saveIdeas([newIdea, ...ideas]);

    addXP(15, `Logged creative idea: ${ideaTitle}`);
    gainStatPoints({ creativity: 1, wisdom: 1 });

    alert("Idea recorded! +15 XP.");
    setIdeaTitle("");
    setIdeaNotes("");
  };

  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinVal) return;
    const newPin: MoodPin = {
      id: `pin-${Date.now()}`,
      type: pinType,
      value: pinVal,
      caption: pinCap || "Inspiration"
    };
    savePins([...moodPins, newPin]);
    setPinCap("");
    alert("Pin added to Mood Board!");
  };

  const deletePin = (id: string) => {
    const updated = moodPins.filter(p => p.id !== id);
    savePins(updated);
  };

  // RENDER DYNAMIC VECTOR SKETCH PLACEHOLDERS
  const renderVectorPlaceholder = (seed: string, style: Sketch["style"]) => {
    // Generate a deterministically seedable geometric design matching styles
    const val1 = seed.charCodeAt(0) || 45;
    const val2 = seed.charCodeAt(1) || 90;
    const val3 = seed.charCodeAt(2) || 120;

    if (style === "minimalist") {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
          <circle cx="50" cy="50" r={Math.min(30, val1 % 30 + 10)} fill="none" stroke="hsl(250, 95%, 65%)" strokeWidth="1.5" />
          <line x1="20" y1="20" x2="80" y2="80" stroke="hsl(250, 95%, 65%)" strokeWidth="0.8" opacity="0.4" />
          <rect x={val2 % 20 + 20} y={val3 % 20 + 20} width="15" height="15" fill="hsl(32, 95%, 60%)" opacity="0.3" />
        </svg>
      );
    }
    if (style === "geometric") {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
          <polygon points="50,15 90,85 10,85" fill="none" stroke="hsl(32, 95%, 60%)" strokeWidth="1.5" />
          <circle cx="50" cy="55" r="20" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="1" />
          <line x1="10" y1="55" x2="90" y2="55" stroke="hsl(250, 95%, 65%)" strokeWidth="0.8" opacity="0.5" />
        </svg>
      );
    }
    // Abstract default
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
        <path d={`M10,80 Q50,${val1 % 60 + 10} 90,80`} fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" />
        <path d={`M10,20 Q50,${val2 % 60 + 20} 90,20`} fill="none" stroke="hsl(271, 91%, 65%)" strokeWidth="1.5" opacity="0.6" />
        <circle cx={val3 % 40 + 30} cy="50" r="8" fill="hsl(346, 84%, 61%)" opacity="0.5" />
      </svg>
    );
  };

  const completedSketchesCount = sketches.length;
  const challengePercent = Math.min(100, Math.round((completedSketchesCount / 365) * 100));

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-2.5 pb-0.5">
        {(["dashboard", "gallery", "projects", "ideas"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "gallery" ? "Sketches Gallery" : tab === "projects" ? "Projects Studio" : tab === "ideas" ? "Ideas & Mood Board" : tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Challenge & Streaks (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 365 sketches card */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    Main Quest Active
                  </span>
                  <h3 className="text-base font-bold text-zinc-100 mt-2">
                    365 Daily Sketches Challenge
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Maintain daily illustration consistency. Hit milestones for creative rank upgrades.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    {completedSketchesCount} / 365
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1">
                    {challengePercent}% Done
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${challengePercent}%` }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-zinc-900/60 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500/15" />
                  <div>
                    <span>Sketch Streak:</span>
                    <span className="block text-sm font-bold text-zinc-200 mt-0.5">{streakCount} Days</span>
                  </div>
                </div>
                <div>
                  <span>Latest log:</span>
                  <span className="block text-sm font-bold text-zinc-200 mt-0.5">{sketches[0]?.date || "None today"}</span>
                </div>
              </div>
            </div>

            {/* Quick Ideas Add form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Capture Creative Spark
              </h4>
              <form onSubmit={handleAddIdea} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Category</label>
                    <select
                      value={ideaCategory}
                      onChange={(e) => setIdeaCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="illustration">Illustration concept</option>
                      <option value="design">UI/UX Design idea</option>
                      <option value="writing">Article / Content draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Spark Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Isometric space station"
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Detailed Notes</label>
                  <textarea
                    value={ideaNotes}
                    onChange={(e) => setIdeaNotes(e.target.value)}
                    rows={2}
                    placeholder="Describe the spark..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Save Idea
                </button>
              </form>
            </div>

          </div>

          {/* Stat growth panel & guidelines (right col) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Creative Streaks Monitor
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Consistency is rewarded. Missing one day does not reset your spirits. You got this.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Creative Rank</span>
                <span className="font-bold text-violet-400">Sketch Enthusiast</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Attribute focus</span>
                <span className="font-bold text-zinc-200">Creativity + Wisdom</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Active Challenge</span>
                <span className="font-bold text-zinc-200">365 Sketches</span>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Consistency Multiplier</span>
              <span className="text-lg font-bold text-zinc-200 block mt-1 font-mono">x1.35</span>
            </div>
          </div>

        </div>
      )}

      {activeTab === "gallery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sketches Gallery Grid */}
          <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Daily Illustration Gallery
            </h3>

            {sketches.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-600 font-medium">
                No sketches registered. Log your first illustration on the right to start your gallery!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sketches.map((s) => (
                  <div key={s.id} className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-colors flex flex-col justify-between">
                    <div className="aspect-square w-full">
                      {renderVectorPlaceholder(s.seed, s.style)}
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">{s.date} · {s.style}</span>
                      <h5 className="text-xs font-bold text-zinc-200 truncate">{s.title}</h5>
                      <p className="text-[10px] text-zinc-500 truncate leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Log daily sketch form */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Log Daily Sketch Complete
            </h4>
            <form onSubmit={handleAddSketch} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Sketch Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ink study, Gesture drawings"
                  value={sketchTitle}
                  onChange={(e) => setSketchTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Vector Style (Preview generation)</label>
                <select
                  value={sketchStyle}
                  onChange={(e) => setSketchStyle(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
                >
                  <option value="minimalist">Minimalist Circular</option>
                  <option value="geometric">Geometric Poly</option>
                  <option value="abstract">Abstract Wave Curve</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Short Notes</label>
                <textarea
                  value={sketchDesc}
                  onChange={(e) => setSketchDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe materials, lighting, or focus..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Completion (+50 XP)
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono border-b border-zinc-900 pb-3">
              Studio Projects
            </h3>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-600 font-medium">
                No active projects registered. Use the panel on the right to log.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-zinc-200">{p.name}</span>
                      <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Add Creative Project
            </h4>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inktober 2026 portfolio"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={3}
                  placeholder="Scoping outlines..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "ideas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ideas list & Mood board list (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mood Board pins */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                Visual Mood Board pins
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {moodPins.map((pin) => (
                  <div key={pin.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-2 flex flex-col justify-between group relative overflow-hidden">
                    <button
                      onClick={() => deletePin(pin.id)}
                      className="absolute top-2 right-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      &times;
                    </button>

                    {pin.type === "color" ? (
                      <div
                        className="w-full aspect-[4/3] rounded-lg border border-zinc-800"
                        style={{ backgroundColor: pin.value }}
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-lg bg-zinc-900/50 flex items-center justify-center p-3 border border-zinc-800 text-[10px] text-zinc-400 font-medium leading-relaxed italic text-center">
                        "{pin.value}"
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-zinc-500 uppercase mt-1 text-center font-bold">
                      {pin.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ideas notebooks */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                Ideas Registry
              </span>

              {ideas.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-600 font-medium">
                  No ideas registered yet. Capture inspiration sparks immediately!
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {ideas.map((id) => (
                    <div key={id.id} className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase">
                          {id.category}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">{id.date}</span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-200">Title: {id.title}</h5>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Notes: {id.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Form to log mood pin */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Add Mood Board Pin
            </h4>
            <form onSubmit={handleAddPin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Pin Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinType("color");
                      setPinVal("#3B82F6");
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                      pinType === "color"
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Color Block
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinType("text");
                      setPinVal("");
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                      pinType === "text"
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Quote Note
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">
                  {pinType === "color" ? "Hex Color Code" : "Inspirational Quote"}
                </label>
                <input
                  type="text"
                  value={pinVal}
                  onChange={(e) => setPinVal(e.target.value)}
                  placeholder={pinType === "color" ? "#8B5CF6" : "Focus on constraints..."}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Design Philosophy, Accents"
                  value={pinCap}
                  onChange={(e) => setPinCap(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs placeholder:text-zinc-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all"
              >
                Add Pin
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
