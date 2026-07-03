"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../lib/auth-context";
import { Search, Compass, LogIn, ChevronRight, Calculator, Plus, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onQuickAction: (actionKey: string) => void;
}

const COMMANDS = [
  { group: "Navigation", items: [
    { key: "nav-dashboard", label: "Navigate to Dashboard", view: "dashboard", icon: Compass, shortcut: "/dashboard" },
    { key: "nav-fitness", label: "Navigate to Fitness Logs", view: "fitness", icon: Compass, shortcut: "/fitness" },
    { key: "nav-study", label: "Navigate to Study Tracker", view: "study", icon: Compass, shortcut: "/study" },
    { key: "nav-career", label: "Navigate to Career & SAP", view: "career", icon: Compass, shortcut: "/career" },
    { key: "nav-finance", label: "Navigate to Finance Portal", view: "finance", icon: Compass, shortcut: "/finance" },
    { key: "nav-creative", label: "Navigate to Creative Studio", view: "creative", icon: Compass, shortcut: "/creative" },
    { key: "nav-journal", label: "Navigate to Daily Journal", view: "journal", icon: Compass, shortcut: "/journal" },
    { key: "nav-goals", label: "Navigate to Quests & Goals", view: "goals", icon: Compass, shortcut: "/goals" },
    { key: "nav-calendar", label: "Navigate to Master Calendar", view: "calendar", icon: Compass, shortcut: "/calendar" }
  ]},
  { group: "Quick Actions (XP Awards)", items: [
    { key: "act-water", label: "Quick Log: Hydration (+250ml)", xp: "10 XP", icon: Plus, shortcut: "/water" },
    { key: "act-protein", label: "Quick Log: Protein Shake (+30g)", xp: "25 XP", icon: Plus, shortcut: "/protein" },
    { key: "act-weight", label: "Quick Log: Record Weight Trend", xp: "25 XP", icon: Plus, shortcut: "/weight" },
    { key: "act-sketch", label: "Quick Log: Daily Sketch Upload", xp: "50 XP", icon: Plus, shortcut: "/sketch" },
    { key: "act-quant", label: "Quick Log: 10 Quant Questions", xp: "50 XP", icon: Plus, shortcut: "/quant" },
    { key: "act-journal", label: "Quick Log: Quick Reflection", xp: "25 XP", icon: Plus, shortcut: "/log-journal" }
  ]}
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onQuickAction }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard triggers listener
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Flattened commands list for index calculation
  const getFilteredCommands = () => {
    const flattened: any[] = [];
    COMMANDS.forEach(group => {
      const filteredItems = group.items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.shortcut.toLowerCase().includes(search.toLowerCase())
      );
      if (filteredItems.length > 0) {
        flattened.push({ isHeader: true, label: group.group });
        filteredItems.forEach(item => {
          flattened.push({ ...item, isHeader: false });
        });
      }
    });
    return flattened;
  };

  const filteredList = getFilteredCommands();
  const selectablesOnly = filteredList.filter(item => !item.isHeader);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % selectablesOnly.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + selectablesOnly.length) % selectablesOnly.length);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = selectablesOnly[selectedIndex];
        if (selected) {
          executeCommand(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, selectablesOnly]);

  const executeCommand = (cmd: any) => {
    if (cmd.view) {
      onNavigate(cmd.view);
    } else {
      onQuickAction(cmd.key);
    }
    onClose();
    setSearch("");
  };

  let selectableCounter = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Search Box Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[480px]"
          >
            {/* Input Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command, slash, or navigation view..."
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
              <span className="text-[10px] font-mono font-semibold text-zinc-600 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* List Results */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin scrollbar-thumb-zinc-900">
              {filteredList.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-600 font-medium">
                  No matching sync command found.
                </div>
              ) : (
                filteredList.map((item, idx) => {
                  if (item.isHeader) {
                    return (
                      <div
                        key={item.label}
                        className="px-3.5 py-2 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  const itemIndex = selectableCounter;
                  selectableCounter++;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between transition-colors relative ${
                        isSelected
                          ? "bg-zinc-900 border border-zinc-800 text-white"
                          : "border border-transparent text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-zinc-800 text-violet-400" : "bg-transparent text-zinc-500"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item.xp && (
                          <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/10">
                            {item.xp}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-zinc-600 font-medium bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                          {item.shortcut}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
