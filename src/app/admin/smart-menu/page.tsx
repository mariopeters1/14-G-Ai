"use client";

import { useState, useEffect, useCallback } from "react";
import { generateSmartMenu, type SmartMenuOutput } from "@/ai/flows/smart-menu-generation";
import {
  ChefHat,
  Salad,
  Cookie,
  Lightbulb,
  Sparkles,
  Star,
  Download,
  Save,
  Trash2,
  Clock,
  RefreshCw,
  Flame,
  Leaf,
  Wheat,
  Droplets,
  Heart,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  Zap,
  Apple,
  Tag,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface DietaryPreset {
  id: string;
  label: string;
  dietary: string;
  health: string;
  icon: React.ReactNode;
  color: string;
}

interface SavedMenu {
  id: string;
  timestamp: string;
  dietaryNeeds: string;
  courses: number;
  rating: number;
  menu: SmartMenuOutput["menu"];
}

interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
}

// ─── Presets ────────────────────────────────────────────────────

const dietaryPresets: DietaryPreset[] = [
  { id: "diabetic", label: "Diabetic", dietary: "Diabetic, low-sugar, low glycemic index", health: "Blood glucose 140 mg/dL, needs stable insulin response", icon: <Droplets className="w-3.5 h-3.5" />, color: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" },
  { id: "keto", label: "Keto", dietary: "Ketogenic, very low carb, high fat", health: "Targeting nutritional ketosis, < 20g net carbs", icon: <Flame className="w-3.5 h-3.5" />, color: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20" },
  { id: "vegan", label: "Vegan", dietary: "Vegan, no animal products", health: "Needs adequate B12, iron, and protein from plant sources", icon: <Leaf className="w-3.5 h-3.5" />, color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20" },
  { id: "glutenfree", label: "Gluten-Free", dietary: "Celiac-safe, strictly gluten-free", health: "Celiac disease — zero gluten tolerance, cross-contamination risk", icon: <Wheat className="w-3.5 h-3.5" />, color: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20" },
  { id: "heart", label: "Heart-Healthy", dietary: "Low sodium, low saturated fat, Mediterranean-style", health: "Mild hypertension, cholesterol 220 mg/dL", icon: <Heart className="w-3.5 h-3.5" />, color: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20" },
  { id: "athlete", label: "Athletic", dietary: "High protein, complex carbs, anti-inflammatory", health: "Active athlete, high caloric burn, needs recovery nutrition", icon: <Zap className="w-3.5 h-3.5" />, color: "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/20" },
];

// ─── Nutrition Estimator (mock) ─────────────────────────────────

function estimateNutrition(course: string): NutritionEstimate {
  switch (course) {
    case "Appetizer": return { calories: Math.floor(180 + Math.random() * 120), protein: Math.floor(8 + Math.random() * 10), carbs: Math.floor(12 + Math.random() * 15), fiber: Math.floor(3 + Math.random() * 5) };
    case "Main Course": return { calories: Math.floor(380 + Math.random() * 200), protein: Math.floor(28 + Math.random() * 15), carbs: Math.floor(20 + Math.random() * 25), fiber: Math.floor(5 + Math.random() * 6) };
    case "Dessert": return { calories: Math.floor(150 + Math.random() * 130), protein: Math.floor(4 + Math.random() * 6), carbs: Math.floor(18 + Math.random() * 20), fiber: Math.floor(2 + Math.random() * 4) };
    default: return { calories: 250, protein: 15, carbs: 20, fiber: 4 };
  }
}

function extractIngredients(description: string, available: string): string[] {
  const avail = available.toLowerCase().split(",").map((s) => s.trim());
  return avail.filter((ing) => description.toLowerCase().includes(ing)).slice(0, 5);
}

// ─── Component ──────────────────────────────────────────────────

export default function SmartMenuPage() {
  const [dietaryNeeds, setDietaryNeeds] = useState("Diabetic, low-sodium");
  const [healthData, setHealthData] = useState("Last reading: Glucose 140 mg/dL");
  const [availableIngredients, setAvailableIngredients] = useState(
    "Salmon, asparagus, lemon, chicken, mixed greens, quinoa, olive oil, berries, yogurt, almonds, garlic, cherry tomatoes, avocado, sweet potato, fresh herbs"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartMenuOutput | null>(null);
  const [revealedCourses, setRevealedCourses] = useState<number[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Staggered Reveal ───────────────────────────────────────

  useEffect(() => {
    if (result && result.menu.length > 0) {
      setRevealedCourses([]);
      result.menu.forEach((_, i) => {
        setTimeout(() => {
          setRevealedCourses((prev) => [...prev, i]);
        }, 400 + i * 600);
      });
    }
  }, [result]);

  // ─── Actions ────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!dietaryNeeds.trim() || !healthData.trim() || !availableIngredients.trim()) {
      showToast("Please fill all three fields.", "warning");
      return;
    }
    setLoading(true);
    setResult(null);
    setRating(0);
    setRevealedCourses([]);

    try {
      const aiResult = await generateSmartMenu({ dietaryNeeds, healthData, availableIngredients });
      setResult(aiResult);
      showToast("Menu generated successfully!", "success");
    } catch (error) {
      console.error("Smart menu error:", error);
      showToast("Failed to generate menu. Please try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: DietaryPreset) => {
    setDietaryNeeds(preset.dietary);
    setHealthData(preset.health);
    showToast(`${preset.label} profile loaded.`, "info");
  };

  const handleSaveMenu = () => {
    if (!result) return;
    const saved: SavedMenu = {
      id: `SM-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      dietaryNeeds,
      courses: result.menu.length,
      rating,
      menu: result.menu,
    };
    setSavedMenus((prev) => [saved, ...prev]);
    showToast("Menu saved to library.", "success");
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      "Course,Dish Name,Description,Chef's Reasoning",
      ...result.menu.map((d) =>
        `"${d.course}","${d.name}","${d.description}","${d.reasoning}"`
      ),
    ];
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-menu-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Menu exported as CSV.", "info");
  };

  const handleClear = () => {
    setResult(null);
    setRating(0);
    setRevealedCourses([]);
    showToast("Menu cleared.", "info");
  };

  const handleDeleteSaved = (id: string) => {
    setSavedMenus((prev) => prev.filter((m) => m.id !== id));
    showToast("Saved menu removed.", "warning");
  };

  const handleLoadSaved = (saved: SavedMenu) => {
    setResult({ menu: saved.menu });
    setRating(saved.rating);
    setDietaryNeeds(saved.dietaryNeeds);
    setShowHistory(false);
    showToast("Menu loaded from library.", "info");
  };

  // ─── Helpers ────────────────────────────────────────────────

  const getCourseIcon = (course: string) => {
    switch (course) {
      case "Appetizer": return <Salad className="w-6 h-6 text-[#10B981]" />;
      case "Main Course": return <ChefHat className="w-6 h-6 text-[#F59E0B]" />;
      case "Dessert": return <Cookie className="w-6 h-6 text-[#8B5CF6]" />;
      default: return <ChefHat className="w-6 h-6 text-white" />;
    }
  };

  const getCourseAccent = (course: string) => {
    switch (course) {
      case "Appetizer": return { border: "border-[#10B981]/20", bg: "bg-[#10B981]/5", badge: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" };
      case "Main Course": return { border: "border-[#F59E0B]/20", bg: "bg-[#F59E0B]/5", badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20" };
      case "Dessert": return { border: "border-[#8B5CF6]/20", bg: "bg-[#8B5CF6]/5", badge: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20" };
      default: return { border: "border-[#1F1F28]", bg: "bg-[#111116]", badge: "bg-white/10 text-white border-white/20" };
    }
  };

  // ─── Total Nutrition ────────────────────────────────────────

  const nutritionData = result?.menu.map((d) => ({ course: d.course, ...estimateNutrition(d.course) })) || [];
  const totalCal = nutritionData.reduce((s, n) => s + n.calories, 0);
  const totalProtein = nutritionData.reduce((s, n) => s + n.protein, 0);
  const totalCarbs = nutritionData.reduce((s, n) => s + n.carbs, 0);
  const totalFiber = nutritionData.reduce((s, n) => s + n.fiber, 0);

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
          toastType === "success" ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
            : toastType === "warning" ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
            : "bg-white/10 text-white border-white/20"
        }`}>
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastType === "info" && <Sparkles className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setShowHistory(false)}>
          <div className="bg-[#111116] border-l border-[#1F1F28] w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#1F1F28] flex justify-between items-center sticky top-0 bg-[#111116] z-10">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-400" /> Menu Library
                <span className="text-xs text-neutral-500 ml-1">{savedMenus.length} saved</span>
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {savedMenus.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  <Save className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No saved menus yet.</p>
                  <p className="text-xs mt-1">Generate and save menus to see them here.</p>
                </div>
              )}
              {savedMenus.map((saved) => (
                <div key={saved.id} className="p-4 bg-[#1C1C24] rounded-xl border border-[#2D2D3A] group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-white font-medium">{saved.dietaryNeeds.slice(0, 30)}...</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {saved.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= saved.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-neutral-600"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 mb-3">{saved.courses} courses</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLoadSaved(saved)} className="flex-1 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-[#2D2D3A]">
                      Load
                    </button>
                    <button onClick={() => handleDeleteSaved(saved.id)} className="p-1.5 text-neutral-500 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Smart Menu</h1>
          <p className="text-neutral-400 mt-2">AI-powered personalized menu generation based on guest needs, health data, and inventory.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <History className="w-4 h-4" /> Library
            {savedMenus.length > 0 && (
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{savedMenus.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* ─── Left: Input Panel ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
          {/* Input Card */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-neutral-400" /> Guest Profile
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Preset Pills */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Quick Profiles</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${preset.color}`}
                    >
                      {preset.icon} {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Needs */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Guest Dietary Needs</label>
                <textarea
                  value={dietaryNeeds}
                  onChange={(e) => setDietaryNeeds(e.target.value)}
                  placeholder="e.g., Vegetarian, Gluten-Free, Diabetic..."
                  rows={2}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors resize-none placeholder-neutral-500"
                />
              </div>

              {/* Health Data */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Wearable Health Data</label>
                <textarea
                  value={healthData}
                  onChange={(e) => setHealthData(e.target.value)}
                  placeholder="e.g., Glucose 140 mg/dL, heart rate, allergies..."
                  rows={2}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors resize-none placeholder-neutral-500"
                />
              </div>

              {/* Available Ingredients */}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Kitchen Inventory</label>
                <textarea
                  value={availableIngredients}
                  onChange={(e) => setAvailableIngredients(e.target.value)}
                  placeholder="e.g., Salmon, asparagus, lemon, chicken, olive oil..."
                  rows={3}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors resize-none placeholder-neutral-500"
                />
                {/* Ingredient count */}
                <div className="mt-1.5 text-xs text-neutral-500 flex items-center gap-1">
                  <Apple className="w-3 h-3" />
                  {availableIngredients.split(",").filter((s) => s.trim()).length} ingredients available
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Crafting Menu...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Smart Menu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right: Result Panel ───────────────────────────── */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {loading && (
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#F59E0B]/10 flex items-center justify-center animate-pulse">
                  <ChefHat className="w-10 h-10 text-[#F59E0B] animate-spin" />
                </div>
                <div className="absolute -inset-3 rounded-full border-2 border-[#F59E0B]/20 animate-ping" />
              </div>
              <h3 className="text-xl font-medium text-white mt-6">The Chef is crafting a menu...</h3>
              <p className="text-neutral-400 mt-2 max-w-sm text-sm">Analyzing guest profile and inventory to create a perfectly balanced dining experience.</p>
              <div className="flex gap-2 mt-6">
                {["Analyzing dietary needs", "Matching ingredients", "Composing courses"].map((step, i) => (
                  <span key={step} className="px-3 py-1 text-[10px] text-neutral-500 bg-[#1F1F28] rounded-full border border-[#2D2D3A] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <ChefHat className="w-10 h-10 text-neutral-500" />
              </div>
              <h3 className="text-xl font-medium text-white">Your Personalized Menu Awaits</h3>
              <p className="text-neutral-400 mt-2 max-w-sm text-sm">
                Select a dietary profile or enter custom guest data, then generate to see Gastronomic AI craft a three-course meal.
              </p>
              <div className="flex gap-2 mt-6">
                {dietaryPresets.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleApplyPreset(p);
                      setTimeout(handleGenerate, 100);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${p.color}`}
                  >
                    {p.icon} Try {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <div className="space-y-6">
              {/* Result Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-white">AI-Generated Smart Menu</h2>
                  <p className="text-neutral-400 text-sm mt-1">{result.menu.length} courses tailored to guest profile</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExport} className="px-4 py-2 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm border border-[#2D2D3A] flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <button onClick={handleSaveMenu} className="px-4 py-2 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm border border-[#2D2D3A] flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={handleClear} className="px-4 py-2 bg-[#1F1F28] hover:bg-[#2A2A36] text-neutral-400 hover:text-white rounded-lg transition-colors text-sm border border-[#2D2D3A]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nutrition Summary KPIs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total Calories", value: `${totalCal}`, unit: "kcal", icon: <Flame className="w-5 h-5" />, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                  { label: "Protein", value: `${totalProtein}`, unit: "g", icon: <Zap className="w-5 h-5" />, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
                  { label: "Carbohydrates", value: `${totalCarbs}`, unit: "g", icon: <Wheat className="w-5 h-5" />, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
                  { label: "Fiber", value: `${totalFiber}`, unit: "g", icon: <Leaf className="w-5 h-5" />, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-xl p-4 text-center">
                    <div className={`${kpi.bg} ${kpi.color} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      {kpi.icon}
                    </div>
                    <div className="text-lg font-medium text-white">{kpi.value}<span className="text-xs text-neutral-500 ml-0.5">{kpi.unit}</span></div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Course Cards */}
              {result.menu.map((dish, index) => {
                const accent = getCourseAccent(dish.course);
                const nutrition = nutritionData[index];
                const ingredients = extractIngredients(dish.description + " " + dish.name + " " + dish.reasoning, availableIngredients);
                const isRevealed = revealedCourses.includes(index);

                return (
                  <div
                    key={index}
                    className={`bg-[#111116] border rounded-2xl overflow-hidden transition-all duration-700 ${accent.border} ${
                      isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    {/* Course Header */}
                    <div className={`px-6 py-4 border-b ${accent.border} ${accent.bg} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        {getCourseIcon(dish.course)}
                        <div>
                          <h3 className="text-lg font-medium text-white">{dish.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${accent.badge}`}>
                            {dish.course}
                          </span>
                        </div>
                      </div>
                      {nutrition && (
                        <div className="flex gap-3 text-[11px] text-neutral-500">
                          <span>{nutrition.calories} cal</span>
                          <span>{nutrition.protein}g protein</span>
                        </div>
                      )}
                    </div>

                    {/* Course Body */}
                    <div className="p-6">
                      <p className="text-neutral-300 text-sm leading-relaxed mb-4">{dish.description}</p>

                      {/* Ingredient Tags */}
                      {ingredients.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Tag className="w-3 h-3 text-neutral-500" />
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Ingredients Used</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ingredients.map((ing) => (
                              <span key={ing} className="px-2 py-0.5 bg-[#1F1F28] text-neutral-300 text-[11px] rounded-md border border-[#2D2D3A] capitalize">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chef's Reasoning */}
                      <div className="flex items-start gap-3 text-sm bg-[#0D0D12] border border-[#1F1F28] rounded-xl p-4">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 text-[#F59E0B] mt-0.5" />
                        <div>
                          <span className="text-xs text-[#F59E0B] font-medium uppercase tracking-wider">Chef&apos;s Reasoning</span>
                          <p className="text-neutral-400 text-sm mt-1 leading-relaxed">{dish.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Rating */}
              <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6 text-center">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Rate This Menu</h3>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(s);
                        showToast(`Menu rated ${s}/5 stars.`, "success");
                      }}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          s <= (hoverRating || rating)
                            ? "text-[#F59E0B] fill-[#F59E0B]"
                            : "text-neutral-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    {rating >= 4 ? "Excellent choice! Saving this calibration." : rating >= 2 ? "Noted. AI will refine next time." : "We'll do better next time."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
