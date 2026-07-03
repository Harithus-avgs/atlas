"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Trophy, Flame, Brain, Dumbbell, Compass, PenTool, Swords } from "lucide-react";

const ARCHETYPES = [
  {
    id: "scholar",
    name: "Scholar",
    description: "Prioritizes learning, logical reasoning, and CAT preparation. Starting bonuses to Knowledge and Focus.",
    icon: Brain,
    bonuses: { knowledge: 15, focus: 13, discipline: 12 },
    color: "from-blue-600/30 to-indigo-600/30 border-blue-500/50"
  },
  {
    id: "athlete",
    name: "Athlete",
    description: "Focused on physical training, runs, home workouts, and clean eating. Starting bonuses to Health, Strength, and Endurance.",
    icon: Dumbbell,
    bonuses: { health: 15, strength: 14, endurance: 13 },
    color: "from-red-600/30 to-orange-600/30 border-red-500/50"
  },
  {
    id: "creator",
    name: "Creator",
    description: "Dedicated to consistency in daily sketches, creative design, and portfolio. Starting bonuses to Creativity and Wisdom.",
    icon: PenTool,
    bonuses: { creativity: 16, wisdom: 12, confidence: 12 },
    color: "from-amber-600/30 to-yellow-600/30 border-amber-500/50"
  },
  {
    id: "professional",
    name: "Builder",
    description: "Aimed at career growth, office milestones, and SAP certifications. Starting bonuses to Discipline and Consistency.",
    icon: Compass,
    bonuses: { discipline: 15, consistency: 14, confidence: 12 },
    color: "from-emerald-600/30 to-teal-600/30 border-emerald-500/50"
  }
];

const INITIAL_STATS = {
  health: 10,
  strength: 10,
  discipline: 10,
  knowledge: 10,
  focus: 10,
  consistency: 10,
  endurance: 10,
  creativity: 10,
  confidence: 10,
  wisdom: 10
};

export default function CharacterCreation() {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  
  // Stats allocation
  const [statPoints, setStatPoints] = useState(10);
  const [allocatedStats, setAllocatedStats] = useState<Record<string, number>>(INITIAL_STATS);

  const [weight, setWeight] = useState(99.25);
  const [targetWeight, setTargetWeight] = useState(86.0);

  const handleStatChange = (stat: string, delta: number) => {
    if (delta > 0 && statPoints > 0) {
      setAllocatedStats((prev) => ({ ...prev, [stat]: prev[stat] + 1 }));
      setStatPoints((prev) => prev - 1);
    } else if (delta < 0 && allocatedStats[stat] > 10) {
      setAllocatedStats((prev) => ({ ...prev, [stat]: prev[stat] - 1 }));
      setStatPoints((prev) => prev + 1);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && (!name || !username)) return;
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      // Merge archetype bonuses with allocated stats
      const finalStats = { ...allocatedStats };
      const bonuses = selectedArchetype.bonuses as unknown as Record<string, number>;
      Object.keys(bonuses).forEach((k) => {
        finalStats[k] = (finalStats[k] || 10) + ((bonuses[k] || 10) - 10);
      });
      completeOnboarding(username, name, selectedArchetype.id, targetWeight, finalStats);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />

      <motion.div
        layout
        className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10"
      >
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
            System Synchronization: Step {step} of 4
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-violet-500" : s < step ? "w-2 bg-violet-700/50" : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Swords className="text-violet-500 w-6 h-6" /> Initialize Profile
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Create your real-life avatar identity to begin synchronization.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Player Real Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Hero Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., solo_leveler"
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Trophy className="text-violet-500 w-6 h-6" /> Physical & Diet Metrics
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Configure your baseline stats to track health and nutrition.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-center focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Goal Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-center focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 space-y-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                  Dietary Restriction
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Vegetarian Diet Active
                </div>
                <p className="text-xs text-zinc-500">
                  Protein and calorie tracker modules will customize protein macros automatically for vegetarians.
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <Shield className="text-violet-500 w-6 h-6" /> Select Archetype Class
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Choose your class setup. Each class awards starting attribute multipliers matching your focus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ARCHETYPES.map((arch) => {
                  const Icon = arch.icon;
                  const isSelected = selectedArchetype.id === arch.id;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-44 bg-gradient-to-br ${
                        isSelected
                          ? `${arch.color} shadow-lg ring-1 ring-violet-500`
                          : "border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`p-2.5 rounded-lg ${isSelected ? "bg-white/10 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-violet-600 text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100">{arch.name}</h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {arch.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                      <Sparkles className="text-violet-500 w-6 h-6 animate-spin-slow" /> Attribute Allocations
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      Distribute your starting attribute points to customize your starting stats.
                    </p>
                  </div>
                  <div className="bg-violet-950/40 border border-violet-900/50 rounded-lg px-3 py-1.5 text-center font-mono">
                    <span className="text-[10px] text-zinc-400 block uppercase">Points Left</span>
                    <span className="text-lg font-bold text-violet-400">{statPoints}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {Object.keys(allocatedStats).map((stat) => {
                  const isMin = allocatedStats[stat] <= 10;
                  const isMax = statPoints === 0;
                  return (
                    <div
                      key={stat}
                      className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wide capitalize">
                          {stat}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {stat === "knowledge" ? "Increases via CAT Study" : stat === "creativity" ? "Increases via Sketches" : "Standard Attribute"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          disabled={isMin}
                          onClick={() => handleStatChange(stat, -1)}
                          className={`w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-sm font-semibold transition-all ${
                            isMin ? "text-zinc-700 bg-transparent border-zinc-900 cursor-not-allowed" : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          -
                        </button>
                        <span className="font-mono text-sm font-bold w-6 text-center text-zinc-100">
                          {allocatedStats[stat]}
                        </span>
                        <button
                          disabled={isMax}
                          onClick={() => handleStatChange(stat, 1)}
                          className={`w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center text-sm font-semibold transition-all ${
                            isMax ? "text-zinc-700 bg-transparent border-zinc-900 cursor-not-allowed" : "text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-900">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              step === 1
                ? "text-zinc-700 cursor-not-allowed"
                : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNextStep}
            disabled={step === 1 && (!name || !username)}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/10 flex items-center gap-1.5 transition-all ${
              step === 1 && (!name || !username) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {step === 4 ? "Begin Journey" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
