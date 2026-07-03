"use client";

import React, { useState } from "react";
import { Search, Info, Dumbbell, Award, HelpCircle } from "lucide-react";

export interface ExerciseDefinition {
  name: string;
  category: "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core" | "Cardio" | "Mobility" | "Stretching";
  description: string;
  instructions: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  caloriesPerMin: number;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // Chest
  {
    name: "Push-ups",
    category: "Chest",
    description: "A classic bodyweight movement targeting the chest, shoulders, and triceps.",
    instructions: [
      "Place hands slightly wider than shoulder-width apart.",
      "Lower your body until your chest nearly touches the floor.",
      "Push back up to the starting position, keeping your core engaged."
    ],
    primaryMuscles: ["Pectorals"],
    secondaryMuscles: ["Anterior Deltoids", "Triceps"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    caloriesPerMin: 6
  },
  {
    name: "Bench Press",
    category: "Chest",
    description: "The gold standard compound movement for chest mass and upper body power.",
    instructions: [
      "Lie flat on the bench, feet firmly on the ground.",
      "Grip the bar slightly wider than shoulder width.",
      "Lower the bar slowly to your mid-chest.",
      "Push the bar explosively back up, locking out elbows."
    ],
    primaryMuscles: ["Pectorals"],
    secondaryMuscles: ["Triceps", "Front Deltoids"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    caloriesPerMin: 8
  },
  // Back
  {
    name: "Pull-ups",
    category: "Back",
    description: "An advanced upper-body pulling movement focused on building back width.",
    instructions: [
      "Hang from a bar with a wide overhand grip.",
      "Pull your chest up toward the bar, driving your elbows down.",
      "Lower yourself with control back to a dead hang."
    ],
    primaryMuscles: ["Lats (Latissimus Dorsi)"],
    secondaryMuscles: ["Biceps", "Rhomboids", "Traps"],
    equipment: "Pull-up Bar",
    difficulty: "Advanced",
    caloriesPerMin: 9
  },
  {
    name: "Barbell Rows",
    category: "Back",
    description: "A heavy compound pull that builds back thickness and grip strength.",
    instructions: [
      "Hinge at the hips, keeping your back straight and chest up.",
      "Grip the barbell with an overhand grip.",
      "Pull the bar toward your lower chest, squeezing your shoulder blades."
    ],
    primaryMuscles: ["Rhomboids", "Lats"],
    secondaryMuscles: ["Biceps", "Posterior Deltoids"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    caloriesPerMin: 8
  },
  // Shoulders
  {
    name: "Overhead Press",
    category: "Shoulders",
    description: "Vertical pressing movement targeting overall shoulder volume and core stability.",
    instructions: [
      "Stand tall, grip the bar at shoulder height.",
      "Press the weight straight overhead, moving your head slightly forward at lockout.",
      "Lower the bar back to your chest with control."
    ],
    primaryMuscles: ["Deltoids"],
    secondaryMuscles: ["Triceps", "Upper Pectorals", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    caloriesPerMin: 7
  },
  {
    name: "Lateral Raises",
    category: "Shoulders",
    description: "Isolation movement targeting the lateral deltoid to build shoulder width.",
    instructions: [
      "Hold dumbbells at your sides, stand with feet hip-width.",
      "Raise arms out to the sides with a slight bend in elbows.",
      "Pause when arms are parallel to the floor, then lower slowly."
    ],
    primaryMuscles: ["Lateral Deltoids"],
    secondaryMuscles: ["Trapezius"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    caloriesPerMin: 4
  },
  // Arms
  {
    name: "Dumbbell Bicep Curls",
    category: "Arms",
    description: "Classic isolation movement to build biceps peak and forearm strength.",
    instructions: [
      "Stand straight, dumbbells in hands, palms facing forward.",
      "Curl weights upward while keeping elbows pinned to your waist.",
      "Lower weights slowly back to full elbow extension."
    ],
    primaryMuscles: ["Biceps Brachii"],
    secondaryMuscles: ["Forearms"],
    equipment: "Dumbbells",
    difficulty: "Beginner",
    caloriesPerMin: 4
  },
  {
    name: "Tricep Overhead Extension",
    category: "Arms",
    description: "Overhead extension targeting the long head of the triceps.",
    instructions: [
      "Hold a dumbbell overhead with both hands.",
      "Lower the weight behind your head by bending only at the elbows.",
      "Extend your arms back to overhead lockout."
    ],
    primaryMuscles: ["Triceps"],
    secondaryMuscles: ["Rear Deltoids"],
    equipment: "Dumbbell",
    difficulty: "Beginner",
    caloriesPerMin: 4
  },
  // Legs
  {
    name: "Barbell Squats",
    category: "Legs",
    description: "The king of lower body movements, targeting quadriceps, glutes, and hamstrings.",
    instructions: [
      "Rest the bar on your upper traps, chest up.",
      "Hinge at the hips and lower down until thighs are parallel to floor or lower.",
      "Drive back up, pushing through your heels."
    ],
    primaryMuscles: ["Quadriceps", "Glutes"],
    secondaryMuscles: ["Hamstrings", "Calves", "Core"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    caloriesPerMin: 10
  },
  {
    name: "Romanian Deadlifts",
    category: "Legs",
    description: "A hip hinge movement focusing heavily on glute and hamstring development.",
    instructions: [
      "Hold bar at hip height. Keep knees slightly bent.",
      "Push hips backward, lowering the bar down your shins.",
      "Squeeze glutes and return to standing once you feel a hamstring stretch."
    ],
    primaryMuscles: ["Hamstrings", "Glutes"],
    secondaryMuscles: ["Lower Back", "Forearms"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    caloriesPerMin: 9
  },
  // Core
  {
    name: "Plank",
    category: "Core",
    description: "Static hold that builds core stability, transverse abdominis strength, and shoulder endurance.",
    instructions: [
      "Rest forearms on the floor, elbows aligned under shoulders.",
      "Keep body in a straight line from head to heels.",
      "Hold this position while breathing deeply, squeezing your abs."
    ],
    primaryMuscles: ["Core (Transverse Abdominis)"],
    secondaryMuscles: ["Shoulders", "Glutes"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    caloriesPerMin: 5
  },
  {
    name: "Hanging Leg Raises",
    category: "Core",
    description: "Advanced abdominal movement targeting lower abs and hip flexors.",
    instructions: [
      "Hang from a bar, arms straight.",
      "Raise your legs to a 90-degree angle, keeping them straight.",
      "Lower legs slowly back to starting hang position."
    ],
    primaryMuscles: ["Lower Abs"],
    secondaryMuscles: ["Hip Flexors", "Grip Strength"],
    equipment: "Pull-up Bar",
    difficulty: "Advanced",
    caloriesPerMin: 6
  },
  // Cardio
  {
    name: "Burpees",
    category: "Cardio",
    description: "High-intensity full body calisthenic movement maximizing metabolic conditioning.",
    instructions: [
      "Stand straight, drop into squat placing hands on floor.",
      "Kick feet back into pushup plank, drop chest to floor.",
      "Push up, return feet to squat, and jump up explosively."
    ],
    primaryMuscles: ["Cardiovascular System"],
    secondaryMuscles: ["Pectorals", "Quadriceps", "Core"],
    equipment: "Bodyweight",
    difficulty: "Advanced",
    caloriesPerMin: 12
  },
  // Mobility & Stretching
  {
    name: "Deep Squat Hold",
    category: "Mobility",
    description: "Static hold improving ankle, hip, and thoracic spine flexibility.",
    instructions: [
      "Stand with feet shoulder-width, toes turned out.",
      "Lower into a deep squat, resting elbows inside knees.",
      "Keep chest tall and heels flat. Hold 60s."
    ],
    primaryMuscles: ["Hips", "Ankles"],
    secondaryMuscles: ["Lower Back"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    caloriesPerMin: 3
  },
  {
    name: "Cobra Stretch",
    category: "Stretching",
    description: "Excellent abdominal and hip-flexor stretch that improves lumbar mobility.",
    instructions: [
      "Lie face down on the floor, hands under shoulders.",
      "Press your chest up, arching your lower back while keeping hips flat.",
      "Hold for 30 seconds."
    ],
    primaryMuscles: ["Abdominals", "Hip Flexors"],
    secondaryMuscles: ["Shoulders"],
    equipment: "Bodyweight",
    difficulty: "Beginner",
    caloriesPerMin: 2
  }
];

export default function ExerciseDatabaseView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);

  const categories = ["All", "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio", "Mobility", "Stretching"];

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSVGMove = (category: string) => {
    // Return custom minimal vector trajectory overlays
    if (category === "Chest" || category === "Shoulders") {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
          <line x1="20" y1="80" x2="80" y2="80" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="4" />
          <line x1="20" y1="80" x2="20" y2="30" stroke="hsl(250, 95%, 65%)" strokeWidth="2.5" />
          <line x1="80" y1="80" x2="80" y2="30" stroke="hsl(250, 95%, 65%)" strokeWidth="2.5" />
          <path d="M 15 30 L 85 30" stroke="hsl(32, 95%, 60%)" strokeWidth="3" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.5" strokeDasharray="3" />
        </svg>
      );
    }
    if (category === "Legs") {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
          <path d="M 30,20 L 50,45 L 30,70 L 70,70" fill="none" stroke="hsl(250, 95%, 65%)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="70" cy="70" r="4" fill="hsl(32, 95%, 60%)" />
          <path d="M 50,45 L 80,45" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="2" />
        </svg>
      );
    }
    // Pull / Back / Arms
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full bg-zinc-900/50">
        <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <path d="M 20,40 Q 50,75 80,40" fill="none" stroke="hsl(250, 95%, 65%)" strokeWidth="3" />
        <circle cx="50" cy="20" r="6" fill="hsl(32, 95%, 60%)" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left side list & filter */}
      <div className="lg:col-span-2 space-y-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
        
        {/* Search header */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-zinc-900 pb-4">
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Exercise Registry
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search exercise database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none text-zinc-200"
            />
          </div>
        </div>

        {/* Filter categories tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-900">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                selectedCategory === cat
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Database List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
          {filteredExercises.map((ex) => (
            <div
              key={ex.name}
              onClick={() => setSelectedExercise(ex)}
              className={`p-4 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                selectedExercise?.name === ex.name
                  ? "bg-zinc-900/50 border-violet-500/40"
                  : "bg-zinc-900/10 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div>
                <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded uppercase">
                  {ex.category}
                </span>
                <h4 className="text-xs font-bold text-zinc-200 mt-2">{ex.name}</h4>
                <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                  Burn rate: ~{ex.caloriesPerMin} kcal/min
                </span>
              </div>
              <Info className="w-4 h-4 text-zinc-600 hover:text-zinc-300 transition-colors" />
            </div>
          ))}
        </div>

      </div>

      {/* Right side detail card */}
      <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur h-fit">
        {selectedExercise ? (
          <div className="space-y-4">
            
            {/* Visual preview */}
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-900 relative">
              {renderSVGMove(selectedExercise.category)}
              <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded uppercase">
                {selectedExercise.equipment}
              </span>
            </div>

            {/* Title & Info */}
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-zinc-100">{selectedExercise.name}</h4>
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold">
                  {selectedExercise.difficulty}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                {selectedExercise.description}
              </p>
            </div>

            {/* Muscles mapping */}
            <div className="grid grid-cols-2 gap-4 border-y border-zinc-900 py-3.5 text-[10px]">
              <div>
                <span className="text-zinc-500 font-mono block mb-1">Primary Muscles:</span>
                {selectedExercise.primaryMuscles.map(m => (
                  <span key={m} className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded inline-block mr-1 mt-1 font-bold">{m}</span>
                ))}
              </div>
              <div>
                <span className="text-zinc-500 font-mono block mb-1">Secondary Muscles:</span>
                {selectedExercise.secondaryMuscles.map(m => (
                  <span key={m} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded inline-block mr-1 mt-1 font-medium">{m}</span>
                ))}
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide block">
                Execution Instructions
              </span>
              <ol className="space-y-2 text-xs text-zinc-400 pl-4 list-decimal leading-relaxed">
                {selectedExercise.instructions.map((step, idx) => (
                  <li key={idx} className="marker:text-violet-500">{step}</li>
                ))}
              </ol>
            </div>

          </div>
        ) : (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 mx-auto">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wide font-mono">
              Selection Required
            </h5>
            <p className="text-[10px] text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
              Select any exercise from the database to view instructions, targeted muscles, and dynamic trajectories.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
