"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Award,
  BookOpen,
  Plus,
  CheckCircle,
  FileText,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Play
} from "lucide-react";

type TabType = "dashboard" | "projects" | "sap" | "interview";

interface CareerProject {
  id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "completed";
  createdAt: string;
}

interface WorkLog {
  id: string;
  project: string;
  minutes: number;
  notes: string;
  date: string;
}

interface SapMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface ResumeVersion {
  id: string;
  version: string;
  link: string;
  notes: string;
  date: string;
}

interface InterviewQuestion {
  id: string;
  topic: string;
  type: "technical" | "behavioral" | "sap";
  questionText: string;
  date: string;
}

const DEFAULT_SAP_MILESTONES: SapMilestone[] = [
  { id: "sap-m1", title: "Study SAP Overview & Architecture Basics", isCompleted: false },
  { id: "sap-m2", title: "Configure SAP Sandbox Local Environment", isCompleted: false },
  { id: "sap-m3", title: "Complete SAP Learning Journey Course 1", isCompleted: false },
  { id: "sap-m4", title: "Master SAP ABAP programming fundamentals", isCompleted: false },
  { id: "sap-m5", title: "Understand SAP Fiori UX design guidelines", isCompleted: false },
  { id: "sap-m6", title: "Run sandbox exercises on SAP HANA system", isCompleted: false },
  { id: "sap-m7", title: "Review SAP Certified Consultant syllabus", isCompleted: false },
  { id: "sap-m8", title: "Attempt SAP Certification Mock Exam 1", isCompleted: false },
  { id: "sap-m9", title: "Complete SAP Certification Mock Exam 2", isCompleted: false },
  { id: "sap-m10", title: "Book exam slot and run final error notebooks review", isCompleted: false }
];

export default function CareerModule() {
  const { addXP, gainStatPoints } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Local state synced with localStorage
  const [projects, setProjects] = useState<CareerProject[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [sapMilestones, setSapMilestones] = useState<SapMilestone[]>(DEFAULT_SAP_MILESTONES);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  // Daily deliverables checklists
  const [deliverables, setDeliverables] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "del-1", text: "Read 2 chapters of SAP ABAP guidelines", done: false },
    { id: "del-2", text: "Review 5 behavioral interview questions", done: false },
    { id: "del-3", text: "Update office project scrum sprint deliverables", done: false }
  ]);

  // Form states
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [logProj, setLogProj] = useState("");
  const [logMinutes, setLogMinutes] = useState(60);
  const [logNotes, setLogNotes] = useState("");
  const [resVersion, setResVersion] = useState("v1.0");
  const [resLink, setResLink] = useState("https://drive.google.com/...");
  const [resNotes, setResNotes] = useState("");
  const [qTopic, setQTopic] = useState("");
  const [qType, setQType] = useState<"technical" | "behavioral" | "sap">("sap");
  const [qText, setQText] = useState("");

  // Load from local storage
  useEffect(() => {
    const storedProj = localStorage.getItem("atlas.career.projects");
    const storedLogs = localStorage.getItem("atlas.career.logs");
    const storedMilestones = localStorage.getItem("atlas.career.sapMilestones");
    const storedRes = localStorage.getItem("atlas.career.resumes");
    const storedQ = localStorage.getItem("atlas.career.questions");

    if (storedProj) setProjects(JSON.parse(storedProj));
    if (storedLogs) setWorkLogs(JSON.parse(storedLogs));
    if (storedMilestones) setSapMilestones(JSON.parse(storedMilestones));
    if (storedRes) setResumes(JSON.parse(storedRes));
    if (storedQ) setQuestions(JSON.parse(storedQ));
  }, []);

  // Sync helpers
  const saveProjects = (data: CareerProject[]) => {
    setProjects(data);
    localStorage.setItem("atlas.career.projects", JSON.stringify(data));
  };
  const saveLogs = (data: WorkLog[]) => {
    setWorkLogs(data);
    localStorage.setItem("atlas.career.logs", JSON.stringify(data));
  };
  const saveMilestones = (data: SapMilestone[]) => {
    setSapMilestones(data);
    localStorage.setItem("atlas.career.sapMilestones", JSON.stringify(data));
  };
  const saveResumes = (data: ResumeVersion[]) => {
    setResumes(data);
    localStorage.setItem("atlas.career.resumes", JSON.stringify(data));
  };
  const saveQuestions = (data: InterviewQuestion[]) => {
    setQuestions(data);
    localStorage.setItem("atlas.career.questions", JSON.stringify(data));
  };

  // LOGGERS ACTIONS
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    const newProj: CareerProject = {
      id: `proj-${Date.now()}`,
      name: projName,
      description: projDesc,
      status: "in_progress",
      createdAt: new Date().toISOString().split("T")[0]
    };
    saveProjects([...projects, newProj]);
    setProjName("");
    setProjDesc("");
    alert("Project created!");
  };

  const handleLogWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (logMinutes <= 0) return;
    const newLog: WorkLog = {
      id: `log-${Date.now()}`,
      project: logProj || "General Office Work",
      minutes: logMinutes,
      notes: logNotes,
      date: new Date().toISOString().split("T")[0]
    };
    saveLogs([newLog, ...workLogs]);

    // RPG XP: 1 XP per minute worked (e.g. 60 mins = 60 XP)
    const xpReward = logMinutes;
    addXP(xpReward, `Logged work hours: ${logNotes}`);
    gainStatPoints({ discipline: Math.ceil(logMinutes / 60), focus: Math.ceil(logMinutes / 30) });

    alert(`Logged! Awarded +${xpReward} XP, +${Math.ceil(logMinutes / 60)} Discipline.`);
    setLogNotes("");
  };

  const handleToggleMilestone = (id: string) => {
    const updated = sapMilestones.map((m) => {
      if (m.id === id) {
        const nextState = !m.isCompleted;
        if (nextState) {
          addXP(100, `Completed SAP Milestone: ${m.title}`);
          gainStatPoints({ knowledge: 4, focus: 2, confidence: 1 });
          alert(`Milestone completed! Main Quest progress updated. +100 XP awarded.`);
        }
        return { ...m, isCompleted: nextState };
      }
      return m;
    });
    saveMilestones(updated);
  };

  const handleAddResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resVersion || !resLink) return;
    const newRes: ResumeVersion = {
      id: `res-${Date.now()}`,
      version: resVersion,
      link: resLink,
      notes: resNotes,
      date: new Date().toISOString().split("T")[0]
    };
    saveResumes([newRes, ...resumes]);
    setResVersion("");
    setResNotes("");
    alert("Resume version logged.");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText) return;
    const newQ: InterviewQuestion = {
      id: `q-${Date.now()}`,
      topic: qTopic || "General",
      type: qType,
      questionText: qText,
      date: new Date().toISOString().split("T")[0]
    };
    saveQuestions([newQ, ...questions]);

    addXP(25, "Logged mock interview preparation question");
    gainStatPoints({ wisdom: 2, confidence: 1 });

    alert("Question recorded! +25 XP, +2 Wisdom.");
    setQTopic("");
    setQText("");
  };

  // DASHBOARD CALCULATIONS
  const totalMilestones = sapMilestones.length;
  const completedMilestonesCount = sapMilestones.filter(m => m.isCompleted).length;
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestonesCount / totalMilestones) * 100) : 0;
  const totalStudyMinutes = workLogs.reduce((acc, l) => acc + l.minutes, 0);

  return (
    <div className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto gap-2.5 pb-0.5">
        {(["dashboard", "projects", "sap", "interview"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "sap" ? "SAP Quest Board" : tab === "interview" ? "Interview & Resume" : tab === "projects" ? "Projects & Work" : tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Quest board & Daily deliverables (left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Quest SAP card */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    Main Quest Active
                  </span>
                  <h3 className="text-base font-bold text-zinc-100 mt-2">
                    Become SAP Certified
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Systematic exam syllabus milestones to lock in professional career growth.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    {milestonePercent}% Ready
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1">
                    {completedMilestonesCount} / {totalMilestones} Steps
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${milestonePercent}%` }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-zinc-900/60 text-zinc-400">
                <div>
                  <span>Learning Time:</span>
                  <span className="block text-sm font-bold text-zinc-200 mt-1">{Math.round(totalStudyMinutes / 60)} hrs logged</span>
                </div>
                <div>
                  <span>Target Exam Date:</span>
                  <span className="block text-sm font-bold text-zinc-200 mt-1">Sept 30, 2026</span>
                </div>
              </div>
            </div>

            {/* Daily deliverables checklist */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Today's Core Deliverables
              </h4>

              <div className="space-y-3">
                {deliverables.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      item.done
                        ? "bg-zinc-900/10 border-zinc-900/60 opacity-60"
                        : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {
                        const updated = deliverables.map(d => {
                          if (d.id === item.id) {
                            const nextState = !d.done;
                            if (nextState) {
                              addXP(25, `Completed deliverable: ${d.text}`);
                              gainStatPoints({ discipline: 1 });
                            }
                            return { ...d, done: nextState };
                          }
                          return d;
                        });
                        setDeliverables(updated);
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-violet-600 bg-zinc-900 border-zinc-800 accent-violet-600 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold ${item.done ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick study metrics & details (right col) */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between backdrop-blur">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Career Attributes mapping
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                Atlas tracks career actions (logged study, mock interviews) and maps them to attributes.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Discipline Focus</span>
                <span className="font-bold text-zinc-200">SAP Study Logs</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Focus Rating</span>
                <span className="font-bold text-zinc-200">Scrum Deliverables</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-mono">Confidence multiplier</span>
                <span className="font-bold text-zinc-200">Mock Interviews</span>
              </div>
            </div>

            <div className="bg-violet-950/20 border border-violet-900/30 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-violet-400 uppercase">Current Tier</span>
              <span className="text-lg font-bold text-zinc-200 block mt-1 font-mono">Junior Consultant</span>
            </div>
          </div>

        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active project listing & logs */}
          <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Office Projects Portfolio
              </h3>
            </div>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-600 font-medium">
                No active projects registered. Use the sidebar/form to add.
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

            {/* Past study logs */}
            <div className="border-t border-zinc-900 pt-6 space-y-3">
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider">
                Work/Learning Logs History
              </span>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {workLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                    <div>
                      <span className="text-xs font-semibold text-zinc-200">{log.notes}</span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{log.date} · {log.project}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-400">
                      {log.minutes} mins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form to log project hours & create projects */}
          <div className="space-y-6">
            
            {/* Log minutes form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
              <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
                Log Productive Work
              </h4>
              <form onSubmit={handleLogWork} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Project Reference</label>
                  <select
                    value={logProj}
                    onChange={(e) => setLogProj(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Task Details</label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="e.g. Configured ABAP logic routines"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs placeholder:text-zinc-700 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  Save Log
                </button>
              </form>
            </div>

            {/* Create project form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
              <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
                Register New Project
              </h4>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. SAP Rollout v2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Description</label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={2}
                    placeholder="Provide scope details..."
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
        </div>
      )}

      {activeTab === "sap" && (
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              SAP Certification Quest Path
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Complete these milestones to unlock the SAP Certified Professional rank. Each milestone completed awards +100 XP.
            </p>
          </div>

          <div className="space-y-3">
            {sapMilestones.map((m) => (
              <div
                key={m.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  m.isCompleted
                    ? "bg-zinc-900/10 border-zinc-900/60 opacity-60"
                    : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="checkbox"
                    checked={m.isCompleted}
                    onChange={() => handleToggleMilestone(m.id)}
                    className="w-5 h-5 rounded text-violet-600 bg-zinc-900 border-zinc-800 accent-violet-600 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${m.isCompleted ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                    {m.title}
                  </span>
                </div>

                <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/10 flex-shrink-0">
                  +100 XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Resume drafts and interview prep history */}
          <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-6">
            
            {/* Resume versions list */}
            <div>
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                Resume Version Controller
              </span>

              {resumes.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-600 font-medium">
                  No resume versions logged yet.
                </div>
              ) : (
                <div className="space-y-2 mt-3">
                  {resumes.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-3.5">
                      <div>
                        <span className="text-xs font-bold text-zinc-200">{r.version}</span>
                        <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{r.date} · {r.notes}</span>
                      </div>
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-violet-400 hover:text-violet-300 rounded-lg flex items-center gap-1 text-[10px] font-mono font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interview questions solved list */}
            <div className="border-t border-zinc-900 pt-6">
              <span className="text-xs font-bold text-zinc-200 block font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                Interview Prep Q&A registry
              </span>
              
              {questions.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-600 font-medium">
                  No interview practice questions logged.
                </div>
              ) : (
                <div className="space-y-3 mt-3 max-h-[220px] overflow-y-auto pr-1">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {q.type} - {q.topic}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">{q.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-300">Q: {q.questionText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Forms for Resume and Interview prep */}
          <div className="space-y-6">
            
            {/* Add resume form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
              <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
                Upload Resume Link
              </h4>
              <form onSubmit={handleAddResume} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Version Code</label>
                  <input
                    type="text"
                    placeholder="e.g. v1.4 - SAP focus"
                    value={resVersion}
                    onChange={(e) => setResVersion(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Document URL</label>
                  <input
                    type="text"
                    value={resLink}
                    onChange={(e) => setResLink(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Release Notes</label>
                  <input
                    type="text"
                    placeholder="Tailored description..."
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs placeholder:text-zinc-700 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  Register Draft
                </button>
              </form>
            </div>

            {/* Add Interview prep form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
              <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
                Log Practice Question
              </h4>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Topic Area</label>
                  <input
                    type="text"
                    placeholder="e.g. System design, behavioral"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Category Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
                  >
                    <option value="sap">SAP Core Concept</option>
                    <option value="technical">Technical / Coding</option>
                    <option value="behavioral">Behavioral / Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Question Details</label>
                  <textarea
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    rows={2}
                    placeholder="Write details or summaries of the prompt..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  Log Practice Question
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
