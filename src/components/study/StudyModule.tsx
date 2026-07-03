"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/auth-context";
import { WEEKLY_SCHEDULE, CAT_EXAM_DATE, WeeklyTask } from "../../lib/study/schedule-data";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Plus,
  BookOpen,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Bookmark,
  Trash2
} from "lucide-react";

type TabType = "dashboard" | "quant" | "dilr" | "varc" | "mocks" | "errors" | "analytics";

export default function StudyModule() {
  const { addXP, gainStatPoints } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Local state synced with localStorage (populated by auto-migration or starting blank)
  const [mocks, setMocks] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [quantData, setQuantData] = useState<Record<string, { solved: number; correct: number }>>({
    'Arithmetic':    { solved: 0, correct: 0 },
    'Algebra':       { solved: 0, correct: 0 },
    'Number System': { solved: 0, correct: 0 },
    'Geometry':      { solved: 0, correct: 0 },
    'Modern Math':   { solved: 0, correct: 0 }
  });
  const [dilrData, setDilrData] = useState<Record<string, { sets: number; correct: number }>>({
    'Arrangements': { sets: 0, correct: 0 },
    'Games & Tournaments': { sets: 0, correct: 0 },
    'Data Interpretation': { sets: 0, correct: 0 },
    'Binary Logic': { sets: 0, correct: 0 },
    'Venn Diagrams': { sets: 0, correct: 0 },
    'Mixed Sets': { sets: 0, correct: 0 }
  });
  const [varcData, setVarcData] = useState({ rcCount: 0, vaCount: 0, readingHabitDays: 0 });

  // Load state on mount
  useEffect(() => {
    const storedMocks = localStorage.getItem("atlas.study.mocks");
    const storedErrors = localStorage.getItem("atlas.study.errors");
    const storedQuant = localStorage.getItem("atlas.study.quant");
    const storedDilr = localStorage.getItem("atlas.study.dilr");
    const storedVarc = localStorage.getItem("atlas.study.varc");

    if (storedMocks) setMocks(JSON.parse(storedMocks));
    if (storedErrors) setErrors(JSON.parse(storedErrors));
    if (storedQuant) setQuantData(JSON.parse(storedQuant));
    if (storedDilr) setDilrData(JSON.parse(storedDilr));
    if (storedVarc) setVarcData(JSON.parse(storedVarc));
  }, []);

  // Sync helpers
  const saveMocks = (data: any[]) => {
    setMocks(data);
    localStorage.setItem("atlas.study.mocks", JSON.stringify(data));
  };
  const saveErrors = (data: any[]) => {
    setErrors(data);
    localStorage.setItem("atlas.study.errors", JSON.stringify(data));
  };
  const saveQuant = (data: typeof quantData) => {
    setQuantData(data);
    localStorage.setItem("atlas.study.quant", JSON.stringify(data));
  };
  const saveDilr = (data: typeof dilrData) => {
    setDilrData(data);
    localStorage.setItem("atlas.study.dilr", JSON.stringify(data));
  };
  const saveVarc = (data: typeof varcData) => {
    setVarcData(data);
    localStorage.setItem("atlas.study.varc", JSON.stringify(data));
  };

  // POMODORO TIMER STATE
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            if (!isBreak) {
              addXP(50, "Completed focus session");
              gainStatPoints({ focus: 3, discipline: 1 });
              alert("Focus session complete! Awarded +50 XP and +3 Focus.");
              setIsBreak(true);
              return 300; // 5 mins break
            } else {
              alert("Break complete! Ready to start another focus block?");
              setIsBreak(false);
              return 1500; // Reset focus
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isBreak]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setPomodoroTime(isBreak ? 300 : 1500);
  };

  // EXAM COUNTDOWN
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const updateCountdown = () => {
      const examDate = new Date(`${CAT_EXAM_DATE}T09:00:00`);
      const now = new Date();
      const diff = examDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, mins, secs });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // FIND ACTIVE WEEK TARGETS
  const getActiveWeek = (): WeeklyTask | null => {
    const now = new Date();
    const active = WEEKLY_SCHEDULE.find((w) => {
      const start = new Date(w.start);
      const end = new Date(w.end);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    });
    return active || WEEKLY_SCHEDULE[0]; // fallback to week 1 if out of bound
  };

  const activeWeek = getActiveWeek();

  // QUANT FORM LOGGING
  const [quantTopic, setQuantTopic] = useState("Arithmetic");
  const [quantSolved, setQuantSolved] = useState(20);
  const [quantCorrect, setQuantCorrect] = useState(16);

  const handleLogQuant = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantSolved <= 0 || quantCorrect < 0 || quantCorrect > quantSolved) {
      alert("Invalid solve count input.");
      return;
    }

    const current = quantData[quantTopic] || { solved: 0, correct: 0 };
    const updated = {
      ...quantData,
      [quantTopic]: {
        solved: current.solved + quantSolved,
        correct: current.correct + quantCorrect
      }
    };
    saveQuant(updated);

    // RPG XP reward: 2 XP per question solved, 3 XP per correct answer
    const xpReward = quantSolved * 2 + quantCorrect * 3;
    addXP(xpReward, `Solved ${quantSolved} Quant questions in ${quantTopic}`);
    gainStatPoints({ knowledge: Math.ceil(quantSolved / 5), focus: 1 });

    alert(`Logged! Awarded +${xpReward} XP, +${Math.ceil(quantSolved / 5)} Knowledge.`);
  };

  // DILR FORM LOGGING
  const [dilrTopic, setDilrTopic] = useState("Arrangements");
  const [dilrSets, setDilrSets] = useState(4);
  const [dilrCorrect, setDilrCorrect] = useState(3);

  const handleLogDilr = (e: React.FormEvent) => {
    e.preventDefault();
    if (dilrSets <= 0 || dilrCorrect < 0 || dilrCorrect > dilrSets) {
      alert("Invalid set count input.");
      return;
    }

    const current = dilrData[dilrTopic] || { sets: 0, correct: 0 };
    const updated = {
      ...dilrData,
      [dilrTopic]: {
        sets: current.sets + dilrSets,
        correct: current.correct + dilrCorrect
      }
    };
    saveDilr(updated);

    // RPG XP: 15 XP per set solved, 20 XP per correct set
    const xpReward = dilrSets * 15 + dilrCorrect * 20;
    addXP(xpReward, `Completed DILR practice sets: ${dilrTopic}`);
    gainStatPoints({ knowledge: dilrSets * 2, focus: 2 });

    alert(`Logged! Awarded +${xpReward} XP.`);
  };

  // VARC FORM LOGGING
  const [varcRcs, setVarcRcs] = useState(2);
  const [varcVa, setVarcVa] = useState(10);
  const [readingHabit, setReadingHabit] = useState(false);

  const handleLogVarc = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      rcCount: varcData.rcCount + varcRcs,
      vaCount: varcData.vaCount + varcVa,
      readingHabitDays: varcData.readingHabitDays + (readingHabit ? 1 : 0)
    };
    saveVarc(updated);

    const xpReward = varcRcs * 25 + varcVa * 3 + (readingHabit ? 20 : 0);
    addXP(xpReward, "Logged VARC practice metrics");
    gainStatPoints({ knowledge: Math.ceil(varcVa / 5) + varcRcs, focus: 1 });

    alert(`Logged! Awarded +${xpReward} XP.`);
    setReadingHabit(false);
  };

  // MOCKS LOGGING
  const [mockName, setMockName] = useState("");
  const [mockDate, setMockDate] = useState(new Date().toISOString().split("T")[0]);
  const [mockQScore, setMockQScore] = useState(25);
  const [mockDScore, setMockDScore] = useState(20);
  const [mockVScore, setMockVScore] = useState(30);
  const [mockQPercent, setMockQPercent] = useState(90);
  const [mockDPercent, setMockDPercent] = useState(85);
  const [mockVPercent, setMockVPercent] = useState(95);

  const handleLogMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName) {
      alert("Mock name is required.");
      return;
    }

    const total = mockQScore + mockDScore + mockVScore;
    const overallPercentile = parseFloat(((mockQPercent + mockDPercent + mockVPercent) / 3).toFixed(2));
    const accuracy = 85; // default simulated baseline

    const newMock = {
      id: `mock-${Date.now()}`,
      name: mockName,
      date: mockDate,
      quant_score: mockQScore,
      dilr_score: mockDScore,
      varc_score: mockVScore,
      total_score: total,
      quant_percentile: mockQPercent,
      dilr_percentile: mockDPercent,
      varc_percentile: mockVPercent,
      total_percentile: overallPercentile,
      accuracy,
      notes: "Mock recorded in Atlas"
    };

    const nextMocks = [newMock, ...mocks];
    saveMocks(nextMocks);

    // Large XP reward for completed Mock exam: 250 base XP + bonus percentile XP
    const xpReward = Math.round(250 + overallPercentile * 2.5);
    addXP(xpReward, `Completed Mock Exam: ${mockName}`);
    gainStatPoints({ knowledge: 10, focus: 5, confidence: 4, consistency: 2 });

    alert(`Mock logged! Awarded +${xpReward} XP. overall percentile: ${overallPercentile}%`);
    setMockName("");
  };

  // ERROR NOTEBOOK LOGGING
  const [errorSubject, setErrorSubject] = useState<"quant" | "dilr" | "varc">("quant");
  const [errorTopic, setErrorTopic] = useState("");
  const [errorQuestion, setErrorQuestion] = useState("");
  const [errorType, setErrorType] = useState("conceptual");
  const [errorSolution, setErrorSolution] = useState("");

  const handleAddError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorTopic || !errorQuestion) {
      alert("Topic and Question fields are required.");
      return;
    }

    const newError = {
      id: `err-${Date.now()}`,
      subject: errorSubject,
      topic: errorTopic,
      question_text: errorQuestion,
      error_type: errorType,
      solution: errorSolution,
      is_reviewed: false,
      created_at: new Date().toISOString()
    };

    const nextErrors = [newError, ...errors];
    saveErrors(nextErrors);

    addXP(25, "Logged study error to notebooks");
    gainStatPoints({ wisdom: 2, discipline: 1 });

    alert("Error recorded! +25 XP, +2 Wisdom.");
    setErrorTopic("");
    setErrorQuestion("");
    setErrorSolution("");
  };

  const toggleReviewError = (id: string) => {
    const updated = errors.map((err) => {
      if (err.id === id) {
        const nextState = !err.is_reviewed;
        if (nextState) {
          addXP(15, "Reviewed error notebook entry");
          gainStatPoints({ wisdom: 1 });
        }
        return { ...err, is_reviewed: nextState };
      }
      return err;
    });
    saveErrors(updated);
  };

  const deleteError = (id: string) => {
    const updated = errors.filter((err) => err.id !== id);
    saveErrors(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-2.5 pb-0.5">
        {(["dashboard", "quant", "dilr", "varc", "mocks", "errors", "analytics"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "errors" ? "Error Notebook" : tab}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TABS */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Countdown & Weekly targets (left 2 cols) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Exam Countdown banner */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-center items-center text-center backdrop-blur">
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">
                Time Remaining until exam
              </span>
              
              <div className="flex gap-4 md:gap-8 mt-4 font-mono">
                <div className="text-center">
                  <span className="text-3xl md:text-5xl font-bold text-zinc-100 block">
                    {String(countdown.days).padStart(3, "0")}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Days</span>
                </div>
                <div className="text-3xl md:text-5xl font-bold text-zinc-800">:</div>
                <div className="text-center">
                  <span className="text-3xl md:text-5xl font-bold text-zinc-100 block">
                    {String(countdown.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Hours</span>
                </div>
                <div className="text-3xl md:text-5xl font-bold text-zinc-800">:</div>
                <div className="text-center">
                  <span className="text-3xl md:text-5xl font-bold text-zinc-100 block">
                    {String(countdown.mins).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Mins</span>
                </div>
                <div className="text-3xl md:text-5xl font-bold text-zinc-800">:</div>
                <div className="text-center">
                  <span className="text-3xl md:text-5xl font-bold text-violet-400 block animate-pulse">
                    {String(countdown.secs).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Secs</span>
                </div>
              </div>
              
              <span className="text-[10px] text-zinc-500 mt-4 font-mono">
                Target Date: November 29, 2026 @ 9:00 AM
              </span>
            </div>

            {/* Weekly Syllabus Focus */}
            {activeWeek && (
              <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                  <h4 className="font-bold text-sm text-zinc-200">
                    Week {activeWeek.week} targets
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeWeek.start} to {activeWeek.end}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-xl p-4">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-blue-400 uppercase block">
                      Quant Focus
                    </span>
                    <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                      {activeWeek.quant}
                    </p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-xl p-4">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-rose-400 uppercase block">
                      DILR Focus
                    </span>
                    <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                      {activeWeek.dilr}
                    </p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900/50 rounded-xl p-4">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 uppercase block">
                      VARC Focus
                    </span>
                    <p className="text-xs text-zinc-300 mt-2 font-medium leading-relaxed">
                      {activeWeek.varc}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Pomodoro Timer widget (right col) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur">
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 uppercase">
                {isBreak ? "Break Interval" : "Focus Session"}
              </span>

              <div className="text-5xl font-mono font-bold text-zinc-100 my-8">
                {String(Math.floor(pomodoroTime / 60)).padStart(2, "0")}:
                {String(pomodoroTime % 60).padStart(2, "0")}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={toggleTimer}
                className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isTimerRunning
                    ? "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/10"
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                {isTimerRunning ? "Pause Timer" : "Start Focus Block"}
              </button>

              <button
                onClick={resetTimer}
                className="w-full py-2.5 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Session
              </button>
            </div>
          </div>

        </div>
      )}

      {activeTab === "quant" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-wide font-mono">
              <BookOpen className="w-4 h-4 text-violet-400" /> Topic Mastery Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(quantData).map((topic) => {
                const item = quantData[topic];
                const acc = item.solved > 0 ? Math.round((item.correct / item.solved) * 100) : 0;
                return (
                  <div key={topic} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                    <span className="text-xs font-bold text-zinc-200">{topic}</span>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
                      <span>Questions: {item.solved} solved</span>
                      <span className="text-emerald-400 font-bold">{acc}% Acc</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900/60 mt-2">
                      <div style={{ width: `${acc}%` }} className="h-full bg-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to log practice */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Log Quant Practice
            </h4>
            <form onSubmit={handleLogQuant} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Topic Area</label>
                <select
                  value={quantTopic}
                  onChange={(e) => setQuantTopic(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                >
                  {Object.keys(quantData).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Solved</label>
                  <input
                    type="number"
                    value={quantSolved}
                    onChange={(e) => setQuantSolved(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Correct</label>
                  <input
                    type="number"
                    value={quantCorrect}
                    onChange={(e) => setQuantCorrect(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Session
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "dilr" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-wide font-mono">
              <BookOpen className="w-4 h-4 text-violet-400" /> Category Set Statistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(dilrData).map((cat) => {
                const item = dilrData[cat];
                const acc = item.sets > 0 ? Math.round((item.correct / item.sets) * 100) : 0;
                return (
                  <div key={cat} className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                    <span className="text-xs font-bold text-zinc-200">{cat}</span>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
                      <span>Sets Solved: {item.sets}</span>
                      <span className="text-emerald-400 font-bold">{acc}% Acc</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-900/60 mt-2">
                      <div style={{ width: `${acc}%` }} className="h-full bg-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to log DILR */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Log DILR Practice
            </h4>
            <form onSubmit={handleLogDilr} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Category Area</label>
                <select
                  value={dilrTopic}
                  onChange={(e) => setDilrTopic(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                >
                  {Object.keys(dilrData).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Sets Solved</label>
                  <input
                    type="number"
                    value={dilrSets}
                    onChange={(e) => setDilrSets(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Sets Correct</label>
                  <input
                    type="number"
                    value={dilrCorrect}
                    onChange={(e) => setDilrCorrect(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Sets Session
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "varc" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-wide font-mono">
              <BookOpen className="w-4 h-4 text-violet-400" /> VARC Progress Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">RCs Solved</span>
                <span className="text-2xl font-bold text-zinc-200 block mt-2 font-mono">{varcData.rcCount}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">VA Questions</span>
                <span className="text-2xl font-bold text-zinc-200 block mt-2 font-mono">{varcData.vaCount}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Reading Habits</span>
                <span className="text-2xl font-bold text-zinc-200 block mt-2 font-mono">{varcData.readingHabitDays} Days</span>
              </div>
            </div>
          </div>

          {/* Form to log VARC */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Log VARC Drill
            </h4>
            <form onSubmit={handleLogVarc} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">RC Passages Solved</label>
                <input
                  type="number"
                  value={varcRcs}
                  onChange={(e) => setVarcRcs(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">VA Questions Solved</label>
                <input
                  type="number"
                  value={varcVa}
                  onChange={(e) => setVarcVa(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-center"
                />
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                <input
                  type="checkbox"
                  id="read-habit"
                  checked={readingHabit}
                  onChange={(e) => setReadingHabit(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 bg-zinc-900 border-zinc-800 accent-violet-600 cursor-pointer"
                />
                <label htmlFor="read-habit" className="text-xs text-zinc-400 select-none cursor-pointer">
                  Completed 30 mins Editorial reading
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log VARC Session
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "mocks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur overflow-x-auto">
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-wide font-mono">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Past Mock Performance Records
            </h3>

            {mocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-600 font-medium">
                No mock records compiled yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3 text-center">Quant %</th>
                    <th className="pb-3 text-center">DILR %</th>
                    <th className="pb-3 text-center">VARC %</th>
                    <th className="pb-3 text-center">Overall %</th>
                    <th className="pb-3 text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {mocks.map((mock) => (
                    <tr key={mock.id} className="text-zinc-300">
                      <td className="py-3 font-semibold text-zinc-200">
                        {mock.name}
                        <span className="block text-[9px] text-zinc-500 font-normal font-mono mt-0.5">{mock.date}</span>
                      </td>
                      <td className="py-3 text-center font-mono">{mock.quant_percentile}%</td>
                      <td className="py-3 text-center font-mono">{mock.dilr_percentile}%</td>
                      <td className="py-3 text-center font-mono">{mock.varc_percentile}%</td>
                      <td className="py-3 text-center font-semibold text-violet-400 font-mono">
                        {mock.total_percentile}%
                      </td>
                      <td className="py-3 text-center font-mono">{mock.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Form to log Mock */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Record Mock Exam Results
            </h4>
            <form onSubmit={handleLogMock} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Mock Series / Name</label>
                <input
                  type="text"
                  placeholder="e.g. SIMCAT 1"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">Quant Score</label>
                  <input
                    type="number"
                    value={mockQScore}
                    onChange={(e) => setMockQScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">DILR Score</label>
                  <input
                    type="number"
                    value={mockDScore}
                    onChange={(e) => setMockDScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">VARC Score</label>
                  <input
                    type="number"
                    value={mockVScore}
                    onChange={(e) => setMockVScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">Quant %ile</label>
                  <input
                    type="number"
                    value={mockQPercent}
                    onChange={(e) => setMockQPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">DILR %ile</label>
                  <input
                    type="number"
                    value={mockDPercent}
                    onChange={(e) => setMockDPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-2 text-center">VARC %ile</label>
                  <input
                    type="number"
                    value={mockVPercent}
                    onChange={(e) => setMockVPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Mock Score
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "errors" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-wide font-mono">
              <AlertCircle className="w-4 h-4 text-violet-400" /> Error Notebook Entries
            </h3>

            {errors.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-600 font-medium">
                No errors recorded. Treat mistakes as growth milestones!
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
                {errors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-4 rounded-xl border transition-all ${
                      err.is_reviewed
                        ? "bg-zinc-900/10 border-zinc-900/60 opacity-60"
                        : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {err.subject} - {err.topic}
                        </span>
                        <span className="ml-2 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {err.error_type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleReviewError(err.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                            err.is_reviewed
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {err.is_reviewed ? "Reviewed ✓" : "Review"}
                        </button>
                        <button
                          onClick={() => deleteError(err.id)}
                          className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-xs font-semibold text-zinc-300">
                      Q: {err.question_text}
                    </div>
                    {err.solution && (
                      <div className="mt-2 text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-2 leading-relaxed">
                        Solution Notes: {err.solution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to log error */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
              Add Error Entry
            </h4>
            <form onSubmit={handleAddError} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Subject</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["quant", "dilr", "varc"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setErrorSubject(s)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                        errorSubject === s
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Topic / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Ratios, Logical Cubes"
                  value={errorTopic}
                  onChange={(e) => setErrorTopic(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Question Reference / Text</label>
                <textarea
                  placeholder="Paste question details or page numbers"
                  value={errorQuestion}
                  onChange={(e) => setErrorQuestion(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Error Type</label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                >
                  <option value="conceptual">Conceptual Ignorance</option>
                  <option value="silly_mistake">Silly Calculation Slip</option>
                  <option value="time_pressure">Time Pressure Panic</option>
                  <option value="reading_error">Incorrect Question Reading</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Corrective Solution Notes</label>
                <textarea
                  placeholder="Write step-by-step correct solution logic"
                  value={errorSolution}
                  onChange={(e) => setErrorSolution(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Log Error Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-8">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 uppercase tracking-wide font-mono">
              <TrendingUp className="w-4 h-4 text-violet-400" /> Mock Exams Percentile Trends
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Visualizes performance and consistency tracking towards CAT 2026.
            </p>
          </div>

          {mocks.length < 2 ? (
            <div className="py-16 text-center text-xs text-zinc-600 font-medium">
              Log at least 2 mock scores to generate trend analytics charts.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Premium Custom SVG Trend Graph */}
              <div className="h-64 border border-zinc-900 rounded-xl bg-zinc-900/10 p-4 relative flex items-end">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map((val) => (
                  <div
                    key={val}
                    className="absolute left-0 right-0 border-t border-zinc-900/60 text-[9px] font-mono text-zinc-600 pl-2 pt-1"
                    style={{ bottom: `${val}%` }}
                  >
                    {val}%ile
                  </div>
                ))}

                {/* Plot line */}
                <svg className="w-full h-full absolute inset-0 z-10 px-12 pb-6 pt-4 overflow-visible">
                  <polyline
                    fill="none"
                    stroke="hsl(250, 95%, 65%)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={mocks
                      .slice()
                      .reverse()
                      .map((mock, idx) => {
                        const x = (idx / (mocks.length - 1)) * 100; // percent
                        const y = 100 - mock.total_percentile; // invert for top-down origin
                        return `${x}%,${y}%`;
                      })
                      .join(" ")}
                  />
                  {mocks.slice().reverse().map((mock, idx) => {
                    const x = `${(idx / (mocks.length - 1)) * 100}%`;
                    const y = `${100 - mock.total_percentile}%`;
                    return (
                      <circle
                        key={mock.id}
                        cx={x}
                        cy={y}
                        r="5.5"
                        fill="hsl(250, 95%, 65%)"
                        stroke="black"
                        strokeWidth="2.5"
                        className="cursor-help"
                      />
                    );
                  })}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute bottom-1.5 left-12 right-12 flex justify-between text-[8px] font-mono text-zinc-500">
                  {mocks.slice().reverse().map((mock) => (
                    <span key={mock.id}>{mock.name}</span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Peak Percentile</span>
                  <span className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                    {Math.max(...mocks.map((m) => m.total_percentile))}%ile
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Mean Score</span>
                  <span className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                    {Math.round(mocks.reduce((acc, m) => acc + m.total_score, 0) / mocks.length)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Completed Mocks</span>
                  <span className="text-base font-bold text-zinc-200 font-mono mt-0.5">{mocks.length} Attempts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
