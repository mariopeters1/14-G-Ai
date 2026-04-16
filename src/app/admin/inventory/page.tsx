"use client";

import { useState, useEffect } from "react";
import {
  analyzeInventory,
  type InventoryAnalysisOutput,
} from "@/ai/flows/inventory-analysis-flow";
import {
  BrainCircuit,
  ChefHat,
  Package,
  Martini,
  Snowflake,
  Carrot,
  Milk,
  Bird,
  Beef,
  Fish as FishIcon,
  ShoppingCart,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
  Clipboard,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface FieldDef {
  name: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const inventoryFields: FieldDef[] = [
  { name: "dryStorage", label: "Dry Storage", icon: Package, color: "#F59E0B" },
  { name: "bar", label: "Bar", icon: Martini, color: "#8B5CF6" },
  { name: "freezer", label: "Freezer", icon: Snowflake, color: "#3B82F6" },
  { name: "produce", label: "Produce", icon: Carrot, color: "#10B981" },
  { name: "dairy", label: "Dairy", icon: Milk, color: "#F472B6" },
  { name: "poultry", label: "Poultry", icon: Bird, color: "#FBBF24" },
  { name: "meat", label: "Meat", icon: Beef, color: "#EF4444" },
  { name: "fish", label: "Fish", icon: FishIcon, color: "#06B6D4" },
];

const defaultValues: Record<string, string> = {
  salesForecast: "Expecting 15% growth this week.",
  upcomingEvents: "Corporate party for 50 on Friday.",
  dryStorage: "Flour: 50 lbs, Sugar: 20 lbs, Pasta: 10 lbs, Olive Oil: 5L",
  bar: "Vodka: 5 bottles, Wine: 12 bottles, Whiskey: 3 bottles",
  freezer: "Frozen Fries: 30 lbs, Ice Cream: 10L, Shrimp: 15 lbs",
  produce: "Tomatoes: 5 lbs, Lettuce: 5 heads, Onions: 10 lbs, Lemons: 20 units",
  dairy: "Milk: 8L, Cheese: 10 lbs, Butter: 5 lbs",
  poultry: "Chicken Breast: 30 lbs, Whole Chickens: 5 units",
  meat: "Beef Sirloin: 20 lbs, Ground Beef: 10 lbs",
  fish: "Salmon Fillets: 15 lbs, Tuna Steaks: 5 lbs",
};

// ─── Component ──────────────────────────────────────────────────

export default function InventoryPage() {
  const [formData, setFormData] = useState<Record<string, string>>(defaultValues);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InventoryAnalysisOutput | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

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

  // ─── Handlers ─────────────────────────────────────────────

  const toggleField = (name: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate
    const missing = ["salesForecast", "upcomingEvents", ...inventoryFields.map((f) => f.name)].filter(
      (k) => !formData[k]?.trim()
    );
    if (missing.length > 0) {
      showToast(`Please fill in all fields (${missing.length} missing).`, "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeInventory(formData as any);
      setResult(aiResult);
      showToast(`${aiResult.recommendations.length} recommendations generated.`, "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to get AI suggestions. Please try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      "Item,Category,Suggestion,Reasoning",
      ...result.recommendations.map((r) => `"${r.item}","${r.category}","${r.suggestion}","${r.reasoning}"`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-order.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Purchase order exported.", "info");
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : toastType === "warning"
              ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastType === "info" && <Sparkles className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-white tracking-tight">Smart Inventory</h1>
        <p className="text-neutral-400 mt-2">
          AI-powered purchasing recommendations based on your stock, sales forecasts, and upcoming events.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* ─── Left: Inventory Form ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start">
          {/* Context Fields */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neutral-400" /> Analysis Context
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Business context for smarter recommendations.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-400 mb-1.5 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Sales Forecast
                </label>
                <textarea
                  value={formData.salesForecast}
                  onChange={(e) => updateField("salesForecast", e.target.value)}
                  rows={2}
                  className="w-full mt-1.5 bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-400 mb-1.5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Upcoming Events
                </label>
                <textarea
                  value={formData.upcomingEvents}
                  onChange={(e) => updateField("upcomingEvents", e.target.value)}
                  rows={2}
                  className="w-full mt-1.5 bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Inventory Categories */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Package className="w-4 h-4" /> Inventory Levels
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Click a category to view/edit stock.</p>
            </div>
            <div className="divide-y divide-[#1F1F28]">
              {inventoryFields.map((field) => {
                const Icon = field.icon;
                const isExpanded = expandedFields.has(field.name);
                const hasValue = !!formData[field.name]?.trim();

                return (
                  <div key={field.name}>
                    <button
                      onClick={() => toggleField(field.name)}
                      className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${field.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: field.color }} />
                        </div>
                        <span className="text-sm text-white font-medium">{field.label}</span>
                        {hasValue && (
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Has data" />
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4">
                        <textarea
                          value={formData[field.name]}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          rows={3}
                          className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20 resize-none font-mono placeholder-neutral-500"
                          placeholder={`Enter ${field.label.toLowerCase()} inventory...`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Inventory...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Get Smart Suggestions
              </>
            )}
          </button>
        </div>

        {/* ─── Right: Results ────────────────────────────────── */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {loading && (
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Analyzing Your Inventory</h3>
              <p className="text-neutral-400 text-sm max-w-md">
                Cross-referencing stock levels with sales forecasts and upcoming events to generate smart
                recommendations...
              </p>
              {/* Progress bar animation */}
              <div className="w-48 h-1 bg-[#1F1F28] rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-white/30 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <ShoppingCart className="w-9 h-9 text-neutral-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Purchase Recommendations</h3>
              <p className="text-neutral-400 text-sm max-w-md">
                Fill in your inventory data and click &quot;Get Smart Suggestions&quot; to let the AI generate your next
                purchase order.
              </p>
              <div className="flex gap-3 mt-6">
                {inventoryFields.slice(0, 4).map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.name}
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#2D2D3A]"
                      style={{ backgroundColor: `${f.color}08` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: `${f.color}60` }} />
                    </div>
                  );
                })}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#2D2D3A] bg-white/[0.02] text-neutral-600 text-xs font-mono">
                  +4
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="space-y-5">
              {/* Results Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium text-white">AI Purchase Recommendations</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {result.recommendations.length} items flagged for ordering
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-xs font-medium border border-[#2D2D3A] flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Export PO
                </button>
              </div>

              {/* Category Summary Bar */}
              {result.recommendations.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {[...new Set(result.recommendations.map((r) => r.category))].map((cat) => {
                    const count = result.recommendations.filter((r) => r.category === cat).length;
                    const field = inventoryFields.find(
                      (f) => f.label.toLowerCase() === cat.toLowerCase() || f.name.toLowerCase() === cat.toLowerCase()
                    );
                    return (
                      <span
                        key={cat}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${field?.color || "#fff"}10`,
                          color: field?.color || "#fff",
                          borderColor: `${field?.color || "#fff"}20`,
                        }}
                      >
                        {cat} ({count})
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Recommendation Cards */}
              {result.recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.map((rec, index) => {
                    const field = inventoryFields.find(
                      (f) =>
                        f.label.toLowerCase() === rec.category.toLowerCase() ||
                        f.name.toLowerCase() === rec.category.toLowerCase()
                    );
                    const Icon = field?.icon || Package;
                    const color = field?.color || "#fff";

                    return (
                      <div
                        key={index}
                        className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden hover:border-[#2D2D3A] transition-all group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Card accent bar */}
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${color}15` }}
                              >
                                <Icon className="w-4 h-4" style={{ color }} />
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm">{rec.item}</h4>
                                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{rec.category}</span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(`${rec.item}: ${rec.suggestion} — ${rec.reasoning}`, index)
                              }
                              className="p-1.5 hover:bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedIdx === index ? (
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              ) : (
                                <Clipboard className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                            </button>
                          </div>

                          {/* Suggestion */}
                          <p className="text-sm font-medium mb-3" style={{ color }}>
                            {rec.suggestion}
                          </p>

                          {/* Reasoning */}
                          <div className="bg-[#0D0D12] border border-[#1F1F28] rounded-xl p-3 flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-neutral-400 leading-relaxed">{rec.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#111116] border border-[#10B981]/20 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
                  <h4 className="text-white font-medium text-lg mb-1">Inventory Looks Good!</h4>
                  <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                    Your stock is well-balanced for the upcoming period. No urgent purchases needed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
