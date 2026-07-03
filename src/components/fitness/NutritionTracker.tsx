"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import {
  GlassWater,
  Plus,
  PlusCircle,
  Copy,
  Heart,
  History,
  Trash2,
  PieChart,
  Calendar,
  AlertTriangle,
  Award,
  BookOpen
} from "lucide-react";

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealLog {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks" | "custom";
  mealName: string;
  time: string;
  foods: FoodItem[];
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
  is_favorite: boolean;
  date: string;
}

export default function NutritionTracker() {
  const { addXP, gainStatPoints, supabaseUser } = useAuth();

  // Local storage states
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [favorites, setFavorites] = useState<MealLog[]>([]);
  const [recents, setRecents] = useState<FoodItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [nutritionView, setNutritionView] = useState<"daily" | "weekly" | "monthly">("daily");

  // Form states for loggers
  const [mealCategory, setMealCategory] = useState<MealLog["mealType"]>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState(350);
  const [protein, setProtein] = useState(25);
  const [carbs, setCarbs] = useState(40);
  const [fat, setFat] = useState(10);
  const [fiber, setFiber] = useState(5);
  const [waterMl, setWaterMl] = useState(0);
  const [logTime, setLogTime] = useState("08:30");

  // Targets constants (matching user priorities)
  const TARGET_CALORIES = 2500;
  const TARGET_PROTEIN = 120; // 120g protein priority
  const TARGET_WATER = 3500; // 3.5L water target
  const TARGET_CARBS = 280;
  const TARGET_FAT = 75;
  const TARGET_FIBER = 35;

  // Load from storage
  useEffect(() => {
    const storedMeals = localStorage.getItem("atlas.fitness.meals");
    const storedFavs = localStorage.getItem("atlas.fitness.mealFavorites");
    const storedRecents = localStorage.getItem("atlas.fitness.recentFoods");

    if (storedMeals) setMeals(JSON.parse(storedMeals));
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    if (storedRecents) setRecents(JSON.parse(storedRecents));
  }, []);

  // Sync methods
  const saveMeals = (data: MealLog[]) => {
    setMeals(data);
    localStorage.setItem("atlas.fitness.meals", JSON.stringify(data));
  };
  const saveFavorites = (data: MealLog[]) => {
    setFavorites(data);
    localStorage.setItem("atlas.fitness.mealFavorites", JSON.stringify(data));
  };
  const saveRecents = (data: FoodItem[]) => {
    setRecents(data);
    localStorage.setItem("atlas.fitness.recentFoods", JSON.stringify(data));
  };

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName) return;

    const newFood: FoodItem = {
      name: foodName,
      calories,
      protein,
      carbs,
      fat,
      fiber
    };

    const newMeal: MealLog = {
      id: `meal-${Date.now()}`,
      mealType: mealCategory,
      mealName: foodName,
      time: logTime,
      foods: [newFood],
      quantity: 1,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: fiber,
      water_ml: waterMl,
      is_favorite: false,
      date: selectedDate
    };

    const nextMeals = [newMeal, ...meals];
    saveMeals(nextMeals);

    // Save to recents (cap at 10 items)
    const filteredRecents = recents.filter((r) => r.name.toLowerCase() !== foodName.toLowerCase());
    const nextRecents = [newFood, ...filteredRecents].slice(0, 10);
    saveRecents(nextRecents);

    // RPG Progression rewards: logging meals increases health & discipline
    addXP(15, `Logged meal: ${foodName}`);
    gainStatPoints({ health: 1, discipline: 1 });

    alert(`Meal logged! +15 XP.`);
    setFoodName("");
    setWaterMl(0);
  };

  const toggleFavorite = (mealId: string) => {
    const updatedMeals = meals.map((m) => {
      if (m.id === mealId) {
        const nextState = !m.is_favorite;
        if (nextState) {
          saveFavorites([...favorites, { ...m, is_favorite: true }]);
        } else {
          saveFavorites(favorites.filter(x => x.id !== mealId));
        }
        return { ...m, is_favorite: nextState };
      }
      return m;
    });
    saveMeals(updatedMeals);
  };

  const duplicateMeal = (meal: MealLog, targetCategory: MealLog["mealType"]) => {
    const duplicated: MealLog = {
      ...meal,
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mealType: targetCategory,
      date: selectedDate,
      time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
    };
    saveMeals([duplicated, ...meals]);
    addXP(10, `Duplicated meal to ${targetCategory}`);
    alert(`Duplicated meal successfully!`);
  };

  const deleteMeal = (id: string) => {
    const next = meals.filter((m) => m.id !== id);
    saveMeals(next);
  };

  const handleAddRecent = (food: FoodItem) => {
    setFoodName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setFiber(food.fiber);
  };

  // NUTRITION ANALYTICS
  const getFilteredMeals = () => {
    if (nutritionView === "daily") {
      return meals.filter((m) => m.date === selectedDate);
    }
    // Simple filter logic for week (last 7 days) or month (last 30 days)
    const borderDate = new Date(selectedDate);
    const offset = nutritionView === "weekly" ? 7 : 30;
    borderDate.setDate(borderDate.getDate() - offset);
    return meals.filter((m) => new Date(m.date) >= borderDate && new Date(m.date) <= new Date(selectedDate));
  };

  const activeMealsList = getFilteredMeals();
  const divisor = nutritionView === "daily" ? 1 : nutritionView === "weekly" ? 7 : 30;

  const totalCalories = Math.round(activeMealsList.reduce((acc, m) => acc + m.calories, 0) / divisor);
  const totalProtein = Math.round(activeMealsList.reduce((acc, m) => acc + m.protein_g, 0) / divisor);
  const totalCarbs = Math.round(activeMealsList.reduce((acc, m) => acc + m.carbs_g, 0) / divisor);
  const totalFat = Math.round(activeMealsList.reduce((acc, m) => acc + m.fat_g, 0) / divisor);
  const totalFiber = Math.round(activeMealsList.reduce((acc, m) => acc + m.fiber_g, 0) / divisor);
  const totalWater = Math.round(activeMealsList.reduce((acc, m) => acc + m.water_ml, 0) / divisor);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Dashboard and categories list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Toggle Range Dashboard Header */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-zinc-900 pb-4 gap-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Nutrition Summary
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                Visualizing caloric and macro intake parameters.
              </p>
            </div>
            
            <div className="flex bg-zinc-900 p-1 rounded-xl gap-1">
              {(["daily", "weekly", "monthly"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setNutritionView(view)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg transition-all ${
                    nutritionView === view
                      ? "bg-violet-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker (daily mode) */}
          {nutritionView === "daily" && (
            <div className="flex justify-between items-center bg-zinc-900/30 border border-zinc-900 rounded-xl p-3">
              <span className="text-xs font-mono text-zinc-500">Log Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none"
              />
            </div>
          )}

          {/* Macro Progress Ring Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Calories</span>
              <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">{totalCalories} / {TARGET_CALORIES} kcal</span>
              <div className="w-full h-1 bg-zinc-950 rounded-full mt-2 overflow-hidden border border-zinc-900/50">
                <div
                  style={{ width: `${Math.min(100, Math.round((totalCalories / TARGET_CALORIES) * 100))}%` }}
                  className="h-full bg-violet-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Protein</span>
              <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">{totalProtein} / {TARGET_PROTEIN} g</span>
              <div className="w-full h-1 bg-zinc-950 rounded-full mt-2 overflow-hidden border border-zinc-900/50">
                <div
                  style={{ width: `${Math.min(100, Math.round((totalProtein / TARGET_PROTEIN) * 100))}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Water</span>
              <span className="text-lg font-bold text-zinc-200 block font-mono mt-1">{totalWater} / {TARGET_WATER} ml</span>
              <div className="w-full h-1 bg-zinc-950 rounded-full mt-2 overflow-hidden border border-zinc-900/50">
                <div
                  style={{ width: `${Math.min(100, Math.round((totalWater / TARGET_WATER) * 100))}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Carbs/Fat/Fiber</span>
              <span className="text-[10px] font-bold text-zinc-300 block font-mono mt-1">C:{totalCarbs}g · F:{totalFat}g · Fib:{totalFiber}g</span>
              <div className="w-full h-1 bg-zinc-950 rounded-full mt-2 overflow-hidden border border-zinc-900/50">
                <div
                  style={{ width: `${Math.min(100, Math.round((totalFiber / TARGET_FIBER) * 100))}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categorized Meal Logs lists */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Meals Diary
          </h4>

          {activeMealsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-600 font-medium">
              No meal records logged for this timeline.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {activeMealsList.map((meal) => (
                <div key={meal.id} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFavorite(meal.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        meal.is_favorite
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded uppercase">
                        {meal.mealType}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200 mt-2">{meal.mealName}</h4>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                        Time: {meal.time} · P:{meal.protein_g}g C:{meal.carbs_g}g F:{meal.fat_g}g
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Duplicate meal to another type trigger */}
                    <div className="flex gap-1.5">
                      {(["breakfast", "lunch", "dinner", "snacks"] as const).map((type) => (
                        <button
                          key={type}
                          title={`Duplicate to ${type}`}
                          onClick={() => duplicateMeal(meal, type)}
                          className="px-1.5 py-1 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 rounded text-[8px] font-mono font-bold uppercase transition-colors"
                        >
                          {type[0]}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {meal.calories} kcal
                    </span>

                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Col: Forms and helpers */}
      <div className="space-y-6">
        
        {/* Add Meal Form */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur">
          <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider mb-4">
            Log Meal / Food Item
          </h4>
          <form onSubmit={handleLogMeal} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Category</label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-400"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="custom">Custom Meal</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Food / Meal Name</label>
              <input
                type="text"
                placeholder="e.g. Oatmeal & Banana"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder:text-zinc-700 text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Calories (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-2 text-center">Carbs</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-2 text-center">Fats</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-2 text-center">Fiber</label>
                <input
                  type="number"
                  value={fiber}
                  onChange={(e) => setFiber(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Time</label>
                <input
                  type="time"
                  value={logTime}
                  onChange={(e) => setLogTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Water (ml)</label>
                <input
                  type="number"
                  value={waterMl}
                  onChange={(e) => setWaterMl(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-300 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Log Food Item
            </button>
          </form>
        </div>

        {/* Favorite & Recent Foods quick loader */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <History className="w-4 h-4 text-violet-400" /> Recent / Fav Foods
            </h4>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {recents.map((food, idx) => (
              <div
                key={idx}
                onClick={() => handleAddRecent(food)}
                className="p-3 bg-zinc-900/10 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer flex justify-between items-center transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-zinc-300 block">{food.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">
                    P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {food.calories} kcal
                </span>
              </div>
            ))}

            {recents.length === 0 && (
              <div className="py-4 text-center text-xs text-zinc-600">
                No recent meals logged yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
