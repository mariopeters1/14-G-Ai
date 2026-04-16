"use client";

import { useState, useMemo, useEffect } from "react";
import { analyzeSalesData, type SalesAnalysisOutput } from "@/ai/flows/sales-analysis-flow";
import {
  ChefHat,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  DollarSign,
  RefreshCw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  Check,
  Download,
  Zap,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────

const VENUES = [
  { id: "terra-bleu", name: "Terra Bleu", baseSales: 38565.09, topItems: "45x Waygu Burgers, 30x Truffle Fries" },
  { id: "gator-flamingo", name: "Gator & Flamingo", baseSales: 29577.66, topItems: "50x Gator Bites, 40x Flamingo Cocktails" },
  { id: "kann-rum-bar", name: "Kan'n Rum Bar & Grill", baseSales: 7776.96, topItems: "35x Jerk Chicken, 60x Rum Punch" },
  { id: "test-kitchen", name: "Gastronomic AI Test Kitchen", baseSales: 5193.22, topItems: "55x Artisan Latte, 40x Avocado Toast" },
  { id: "market-kiosk", name: "Market Square Kiosk", baseSales: 3908.63, topItems: "25x Tasting Menu A, 10x Experimental Entrees" },
];

// ─── Component ──────────────────────────────────────────────────

export default function SalesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalesAnalysisOutput | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState("terra-bleu");
  const [salesData, setSalesData] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Calculator
  const [grossSales, setGrossSales] = useState("38565.09");
  const [discounts, setDiscounts] = useState("1928.25");
  const [taxes, setTaxes] = useState("3085.21");

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

  useEffect(() => {
    const venue = VENUES.find((v) => v.id === selectedVenueId) || VENUES[0];
    setGrossSales(venue.baseSales.toFixed(2));
    setDiscounts((venue.baseSales * 0.05).toFixed(2));
    setTaxes((venue.baseSales * 0.08).toFixed(2));
  }, [selectedVenueId]);

  const { netSales, totalRevenue } = useMemo(() => {
    const gross = parseFloat(grossSales) || 0;
    const disc = parseFloat(discounts) || 0;
    const tax = parseFloat(taxes) || 0;
    return { netSales: gross - disc, totalRevenue: gross - disc + tax };
  }, [grossSales, discounts, taxes]);

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  // POS sync
  const handleSync = (pos: string) => {
    const venue = VENUES.find((v) => v.id === selectedVenueId)!;
    const payload = pos === "toast"
      ? `Toast POS Sync [2026-04-10] | ${venue.name}: Gross: $${venue.baseSales}. Top items: ${venue.topItems}. Slow lunch, heavy dinner rush. Labor ran at 22% during peak.`
      : `Square POS Sync [2026-04-10] | ${venue.name}: Gross: $${venue.baseSales}. Top items: ${venue.topItems}. High volume in morning, died off after 2PM. Waste higher than normal on pastries.`;
    setSalesData(payload);
    showToast(`${pos === "toast" ? "Toast" : "Square"} POS synced for ${venue.name}.`);
  };

  const handleAnalyze = async () => {
    if (!salesData.trim()) {
      showToast("Sync from a POS or enter data first.", "warning");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeSalesData({ salesData });
      setResult(aiResult);
      showToast("Analysis complete — insights generated.");
    } catch (error) {
      console.error("Error:", error);
      showToast("Analysis failed. Please try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // ─── Render ───────────────────────────────────────────────

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
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-white tracking-tight">Sales & POS</h1>
        <p className="text-neutral-400 mt-2">Sync POS data, calculate revenue, and get AI-powered sales insights.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* ─── Left: POS Sync + Calculator ────────────────── */}
        <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-24 self-start">
          {/* POS Sync Card */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#F59E0B]" /> POS Data Sync
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Import today&apos;s telemetry for instant analysis.</p>
              </div>
              <div className="relative">
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2 pr-8 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
                >
                  {VENUES.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* POS Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleSync("toast")} className="py-4 border border-[#2D2D3A] rounded-xl bg-[#0D0D12] hover:bg-[#1C1C24] hover:border-[#F59E0B]/30 transition-all flex flex-col items-center gap-1.5 group">
                  <span className="text-white font-bold tracking-tight text-lg group-hover:text-[#F59E0B] transition-colors">TOAST</span>
                  <span className="text-[10px] text-neutral-500">Sync Today&apos;s Data</span>
                </button>
                <button onClick={() => handleSync("square")} className="py-4 border border-[#2D2D3A] rounded-xl bg-[#0D0D12] hover:bg-[#1C1C24] hover:border-[#3B82F6]/30 transition-all flex flex-col items-center gap-1.5 group">
                  <span className="text-white font-bold tracking-tight text-lg group-hover:text-[#3B82F6] transition-colors">Square</span>
                  <span className="text-[10px] text-neutral-500">Sync Today&apos;s Data</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[#1F1F28]" />
                <span className="text-[10px] text-neutral-600 uppercase">Raw Payload</span>
                <div className="flex-1 border-t border-[#1F1F28]" />
              </div>

              {/* Data textarea */}
              <div className="relative">
                <textarea
                  value={salesData}
                  onChange={(e) => setSalesData(e.target.value)}
                  rows={4}
                  placeholder="Sync from POS to view telemetry..."
                  className="w-full bg-[#0D0D12] border border-dashed border-[#2D2D3A] rounded-lg px-4 py-3 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-600"
                />
                {!salesData && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-neutral-500 bg-[#111116] px-3 py-1.5 rounded-lg border border-[#2D2D3A]">Awaiting POS Connection</span>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !salesData}
                className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Operating Insights</>
                )}
              </button>
            </div>
          </div>

          {/* Sales Calculator */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Sales Calculator
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Gross Sales", value: grossSales, setter: setGrossSales },
                { label: "Discounts & Comps", value: discounts, setter: setDiscounts },
                { label: "Taxes", value: taxes, setter: setTaxes },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-8 pr-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-[#1F1F28] pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Net Sales</span>
                  <span className="text-sm font-mono text-white">{fmt(netSales)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Total Revenue</span>
                  <span className="text-lg font-mono text-[#10B981] font-light">{fmt(totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: AI Results ──────────────────────────── */}
        <div className="lg:col-span-3">
          {/* Loading */}
          {loading && (
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Analyzing Sales Data</h3>
              <p className="text-neutral-400 text-sm max-w-md">Identifying trends, top sellers, and creating actionable recommendations...</p>
              <div className="w-48 h-1 bg-[#1F1F28] rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-white/30 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <BarChart3 className="w-9 h-9 text-neutral-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Sales Insights</h3>
              <p className="text-neutral-400 text-sm max-w-md">Sync your POS data and click &quot;Generate Operating Insights&quot; to reveal hidden opportunities.</p>
              <div className="flex gap-3 mt-6">
                {["TOAST", "Square", "Clover", "Aloha"].map((pos) => (
                  <div key={pos} className="px-3 py-1.5 rounded-lg bg-[#1F1F28] border border-[#2D2D3A] text-[10px] text-neutral-500">{pos}</div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="space-y-5">
              {/* Executive Summary */}
              <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#3B82F6] to-transparent" />
                <div className="p-6">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#3B82F6]" /> Executive Summary
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Top Sellers + Chart */}
              {result.topItems.length > 0 && (
                <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-[#10B981] to-transparent" />
                  <div className="px-6 py-4 border-b border-[#1F1F28]">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#10B981]" /> Top Sellers
                    </h3>
                  </div>
                  {/* Horizontal bar chart */}
                  <div className="p-6 space-y-3">
                    {result.topItems.map((item, i) => {
                      const units = parseInt(item.unitsSold.match(/\d+/)?.[0] || "0", 10);
                      const maxUnits = Math.max(...result.topItems.map((t) => parseInt(t.unitsSold.match(/\d+/)?.[0] || "0", 10)));
                      const widthPct = maxUnits > 0 ? (units / maxUnits) * 100 : 0;
                      return (
                        <div key={i} className="group">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#10B981] font-mono w-6">#{i + 1}</span>
                              <span className="text-sm text-white">{item.itemName}</span>
                            </div>
                            <span className="text-xs font-mono text-[#10B981]">{item.unitsSold}</span>
                          </div>
                          <div className="w-full h-2 bg-[#1F1F28] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#10B981]/60 transition-all" style={{ width: `${widthPct}%` }} />
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.insight}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Underperformers */}
              {result.underperformingItems.length > 0 && (
                <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-[#EF4444] to-transparent" />
                  <div className="px-6 py-4 border-b border-[#1F1F28]">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#EF4444]" /> Underperforming Items
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {result.underperformingItems.map((item, i) => (
                      <div key={i} className="px-4 py-3 bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">{item.itemName}</span>
                          <span className="text-xs font-mono text-[#EF4444]">{item.unitsSold}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-1">{item.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B] to-transparent" />
                  <div className="px-6 py-4 border-b border-[#1F1F28]">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#F59E0B]" /> Actionable Recommendations
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="bg-[#0D0D12] border border-[#1F1F28] rounded-xl p-4 group hover:border-[#2D2D3A] transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium mb-1">{rec.recommendation}</p>
                            <p className="text-xs text-neutral-500 leading-relaxed">{rec.reasoning}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(`${rec.recommendation}: ${rec.reasoning}`, i)}
                            className="p-1.5 hover:bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Clipboard className="w-3.5 h-3.5 text-neutral-500" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes progress { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
      `}</style>
    </div>
  );
}
