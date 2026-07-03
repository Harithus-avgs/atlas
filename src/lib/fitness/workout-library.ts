export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  description: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: "calisthenics" | "cardio" | "core" | "strength";
  difficulty: "easy" | "medium" | "hard";
  exercises: Exercise[];
}

export const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  {
    id: "wt-calisthenics-basic",
    name: "Calisthenics Foundation",
    description: "Build upper and lower body strength using your own body weight. Focuses on control and compound movements.",
    category: "calisthenics",
    difficulty: "medium",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 15, description: "Keep your core tight and lower chest to the floor." },
      { name: "Bodyweight Squats", sets: 3, reps: 20, description: "Lower down until thighs are parallel to ground." },
      { name: "Inverted Rows / Pull-ups", sets: 3, reps: 8, description: "Pull body upwards focusing on lats and back engagement." },
      { name: "Bench Dips", sets: 3, reps: 12, description: "Use a chair or bench to isolate triceps." },
      { name: "Plank Hold", sets: 3, reps: 60, description: "Hold straight body line for 60 seconds." }
    ]
  },
  {
    id: "wt-hiit-burner",
    name: "HIIT Cardio Burner",
    description: "High intensity interval training routine to maximize caloric expenditure and increase cardiovascular endurance.",
    category: "cardio",
    difficulty: "hard",
    exercises: [
      { name: "Jumping Jacks", sets: 3, reps: 40, description: "Fast pace, warm up movement." },
      { name: "Burpees", sets: 3, reps: 10, description: "Jump up, kick back into pushup, return and jump." },
      { name: "Mountain Climbers", sets: 3, reps: 30, description: "Drive knees toward chest rapidly in plank position." },
      { name: "High Knees", sets: 3, reps: 40, description: "Run in place lifting knees high." }
    ]
  },
  {
    id: "wt-core-warrior",
    name: "Core Strength Warrior",
    description: "Isolate and strengthen rectus abdominis, obliques, and lower back supporting functional stability.",
    category: "core",
    difficulty: "easy",
    exercises: [
      { name: "Laying Leg Raises", sets: 3, reps: 12, description: "Lower legs slowly without letting heels touch floor." },
      { name: "Russian Twists", sets: 3, reps: 20, description: "Twist trunk from side to side holding feet off floor." },
      { name: "Bicycle Crunches", sets: 3, reps: 15, description: "Bring elbow to opposite knee alternately." },
      { name: "Superman Hold", sets: 3, reps: 30, description: "Lay flat on stomach and lift chest and legs. Hold 30s." }
    ]
  },
  {
    id: "wt-strength-home",
    name: "Lower Body Toning",
    description: "Target glutes, quadriceps, and calves. Improves leg definition and explosive running power.",
    category: "strength",
    difficulty: "medium",
    exercises: [
      { name: "Walking Lunges", sets: 3, reps: 16, description: "Step forward alternating legs, 8 reps each side." },
      { name: "Glute Bridges", sets: 3, reps: 15, description: "Squeeze glutes at top, hold for 1 sec." },
      { name: "Single Leg Calf Raises", sets: 3, reps: 15, description: "Raise onto tip-toe, hold for 1 sec on edge of step." },
      { name: "Bulgarian Split Squats", sets: 3, reps: 10, description: "Rear foot elevated on chair, lower single leg." }
    ]
  }
];
