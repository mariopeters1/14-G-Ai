"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  TrendingUp,
  Clock,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lightbulb,
  X,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface DayData {
  date: string;
  sales: number;
  laborCost: number;
}

interface InsightData {
  id: string;
  icon: "warning" | "success" | "info" | "money";
  title: string;
  description: string;
  savingsEstimate: number;
  department: string;
  priority: "high" | "medium" | "low";
  dismissed: boolean;
  acted: boolean;
}

type TimeRange = "7d" | "14d" | "30d";

// ─── Initial Data ───────────────────────────────────────────────

const weeklyData: DayData[] = [
  { date: "Mon 4/05", sales: 8500, laborCost: 2800 },
  { date: "Tue 4/06", sales: 7200, laborCost: 2600 },
  { date: "Wed 4/07", sales: 9100, laborCost: 3100 },
  { date: "Thu 4/08", sales: 11500, laborCost: 3800 },
  { date: "Fri 4/09", sales: 18200, laborCost: 5200 },
  { date: "Sat 4/10", sales: 21000, laborCost: 5800 },
  { date: "Sun 4/11", sales: 15400, laborCost: 4600 },
];

const biweeklyData: DayData[] = [
  ...weeklyData,
  { date: "Mon 4/12", sales: 8900, laborCost: 2900 },
  { date: "Tue 4/13", sales: 7600, laborCost: 2700 },
  { date: "Wed 4/14", sales: 9400, laborCost: 3200 },
  { date: "Thu 4/15", sales: 12100, laborCost: 3900 },
  { date: "Fri 4/16", sales: 19500, laborCost: 5500 },
  { date: "Sat 4/17", sales: 22300, laborCost: 6100 },
  { date: "Sun 4/18", sales: 16100, laborCost: 4800 },
];

const monthlyData: DayData[] = [
  ...biweeklyData,
  { date: "Mon 4/19", sales: 8200, laborCost: 2750 },
  { date: "Tue 4/20", sales: 7400, laborCost: 2650 },
  { date: "Wed 4/21", sales: 9000, laborCost: 3050 },
  { date: "Thu 4/22", sales: 11800, laborCost: 3850 },
  { date: "Fri 4/23", sales: 17800, laborCost: 5100 },
  { date: "Sat 4/24", sales: 20500, laborCost: 5700 },
  { date: "Sun 4/25", sales: 14900, laborCost: 4500 },
];

const initialInsights: InsightData[] = [
  {
    id: "INS-001",
    icon: "warning",
    title: "Overtime Projection Alert",
    description: "Kitchen department is trending 15% over scheduled hours. Recommend splitting the Saturday double with a swing shift to save an estimated $280/week.",
    savingsEstimate: 280,
    department: "Kitchen",
    priority: "high",
    dismissed: false,
    acted: false,
  },
  {
    id: "INS-002",
    icon: "success",
    title: "Optimal Staffing Found",
    description: "Tuesday and Wednesday show 18% overstaffing in FOH. Reducing by 1 server per shift would save $210/week without impacting service scores.",
    savingsEstimate: 210,
    department: "FOH",
    priority: "medium",
    dismissed: false,
    acted: false,
  },
  {
    id: "INS-003",
    icon: "info",
    title: "Break Compliance Risk",
    description: "3 employees have missed meal breaks in the last 7 days. Auto-reminder system would reduce compliance penalties by an estimated 92%.",
    savingsEstimate: 150,
    department: "All",
    priority: "high",
    dismissed: false,
    acted: false,
  },
  {
    id: "INS-004",
    icon: "money",
    title: "Revenue-per-Labor-Hour",
    description: "Friday and Saturday yield $42.50/labor hour — 35% above weekday average. Consider premium shift differentials to retain top performers on peak nights.",
    savingsEstimate: 0,
    department: "All",
    priority: "low",
    dismissed: false,
    acted: false,
  },
  {
    id: "INS-005",
    icon: "warning",
    title: "Prep Cook Scheduling Gap",
    description: "Monday 6-10AM has no prep coverage. Historical data shows this causes a 22-minute service delay at lunch. Adding 1 prep shift would cost $88 but saves $320 in estimated lost revenue.",
    savingsEstimate: 232,
    department: "Kitchen",
    priority: "medium",
    dismissed: false,
    acted: false,
  },
];

// ─── Component ──────────────────────────────────────────────────

export default function LaborIntelligencePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [insights, setInsights] = useState<InsightData[]>(initialInsights);
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "ai">("success");
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("all");

  // Data based on selected range
  const chartData = timeRange === "7d" ? weeklyData : timeRange === "14d" ? biweeklyData : monthlyData;
  const maxSales = Math.max(...chartData.map((d) => d.sales));

  // Derived KPIs
  const totalSales = chartData.reduce((s, d) => s + d.sales, 0);
  const totalLabor = chartData.reduce((s, d) => s + d.laborCost, 0);
  const laborPct = ((totalLabor / totalSales) * 100).toFixed(1);
  const avgLaborPerHour = (totalSales / (chartData.length * 14)).toFixed(2); // rough 14 labor hours/day

  const activeInsights = insights.filter((i) => !i.dismissed);
  const projectedOTHours = 45.5;
  const projectedOTCost = Math.round(projectedOTHours * 30);
  const totalPotentialSavings = activeInsights.reduce((s, i) => s + i.savingsEstimate, 0);

  // Top leak department
  const deptLabor: Record<string, number> = { Kitchen: 0, FOH: 0, Bar: 0 };
  chartData.forEach((d) => {
    deptLabor["Kitchen"] += d.laborCost * 0.45;
    deptLabor["FOH"] += d.laborCost * 0.35;
    deptLabor["Bar"] += d.laborCost * 0.2;
  });
  const topLeakDept = Object.entries(deptLabor).sort((a, b) => b[1] - a[1])[0];

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" | "ai" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Actions ────────────────────────────────────────────────

  const handleRunAnalysis = useCallback(() => {
    setAnalyzing(true);
    setTimeout(() => {
      // Simulate generating a new insight
      const newInsight: InsightData = {
        id: `INS-${Date.now()}`,
        icon: "success",
        title: "Cross-Training Opportunity Detected",
        description: `Analysis of ${timeRange === "7d" ? "7-day" : timeRange === "14d" ? "14-day" : "30-day"} data reveals Sophia Lin (Sommelier) has bar-back coverage skills. Cross-deploying during Tuesday slow periods saves $95/week in redundant staffing.`,
        savingsEstimate: 95,
        department: "Bar",
        priority: "low",
        dismissed: false,
        acted: false,
      };
      setInsights((prev) => [newInsight, ...prev]);
      setAnalyzing(false);
      showToast("AI analysis complete — 1 new insight generated.", "ai");
    }, 2200);
  }, [timeRange]);

  const handleDismissInsight = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)));
    showToast("Insight dismissed.");
  };

  const handleActOnInsight = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, acted: true } : i)));
    showToast("Insight marked as actioned.", "success");
  };

  const handleRestoreInsight = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: false } : i)));
    showToast("Insight restored.", "info");
  };

  const handleExport = () => {
    const headers = ["Date", "Sales", "Labor Cost", "Labor %"];
    const rows = chartData.map((d) => [
      d.date, `$${d.sales}`, `$${d.laborCost}`,
      `${((d.laborCost / d.sales) * 100).toFixed(1)}%`,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `labor-intelligence-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported as CSV.", "info");
  };

  // Filter insights
  const departments = ["all", ...new Set(insights.map((i) => i.department))];
  const displayInsights = insights
    .filter((i) => (showDismissed ? true : !i.dismissed))
    .filter((i) => selectedDept === "all" || i.department === selectedDept);

  const iconMap = {
    warning: <AlertTriangle className="w-4 h-4" />,
    success: <TrendingUp className="w-4 h-4" />,
    info: <Clock className="w-4 h-4" />,
    money: <DollarSign className="w-4 h-4" />,
  };

  const iconBgMap = {
    warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
    success: "bg-[#10B981]/10 text-[#10B981]",
    info: "bg-[#3B82F6]/10 text-[#3B82F6]",
    money: "bg-white/10 text-white",
  };

  const priorityColors = {
    high: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    medium: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    low: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : toastType === "ai"
              ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "ai" && <Sparkles className="w-4 h-4" />}
            {toastType === "info" && <Download className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Labor Intelligence</h1>
          <p className="text-neutral-400 mt-2">AI-powered workforce analytics and cost optimization insights.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Labor %</h3>
            <TrendingUp className={`w-5 h-5 ${parseFloat(laborPct) > 28 ? "text-[#F59E0B]" : "text-[#10B981]"}`} />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">{laborPct}%</div>
            <div className="flex items-center gap-1 text-xs">
              {parseFloat(laborPct) > 28 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-[#F59E0B]" />
                  <span className="text-[#F59E0B]">Above 28% target</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[#10B981]">Within target</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Projected OT</h3>
            <Clock className="text-[#EF4444] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">{projectedOTHours}h</div>
            <p className="text-xs text-[#EF4444]">Est. ${projectedOTCost.toLocaleString()} additional cost</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Top Leak Dept</h3>
            <AlertTriangle className="text-[#F59E0B] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">{topLeakDept[0]}</div>
            <p className="text-xs text-[#F59E0B]">${Math.round(topLeakDept[1] * 0.04).toLocaleString()} over budget</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">AI Savings Found</h3>
            <DollarSign className="text-[#10B981] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-[#10B981] mb-1">${totalPotentialSavings}/wk</div>
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="w-3 h-3 text-[#10B981]" />
              <span className="text-[#10B981]">{activeInsights.length} active recommendations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-400" /> Labor Cost vs Revenue
          </h2>
          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex bg-[#0D0D12] rounded-lg border border-[#2D2D3A] p-0.5">
              {(["7d", "14d", "30d"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timeRange === range
                      ? "bg-white/10 text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white/30 inline-block"></span> Revenue
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981]/50 inline-block"></span> Labor Cost
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {chartData.map((day, i) => {
            const salesWidth = (day.sales / maxSales) * 100;
            const laborWidth = (day.laborCost / maxSales) * 100;
            const dayLaborPct = ((day.laborCost / day.sales) * 100).toFixed(1);
            return (
              <div key={i} className="group hover:bg-[#1A1A22]/50 rounded-lg px-2 py-1 -mx-2 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-500 w-20 text-right font-mono">{day.date}</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="h-4 rounded-full bg-white/10 relative overflow-hidden flex-1">
                        <div
                          className="h-full bg-white/30 rounded-full transition-all duration-500"
                          style={{ width: `${salesWidth}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono w-20 text-right">
                        ${day.sales.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 rounded-full bg-[#10B981]/10 relative overflow-hidden flex-1">
                        <div
                          className="h-full bg-[#10B981]/50 rounded-full transition-all duration-500"
                          style={{ width: `${laborWidth}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-[#10B981] font-mono w-20 text-right">
                        ${day.laborCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium w-12 text-right ${
                      parseFloat(dayLaborPct) > 30 ? "text-[#F59E0B]" : "text-[#10B981]"
                    }`}
                  >
                    {dayLaborPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Summary bar */}
        <div className="mt-6 pt-4 border-t border-[#1F1F28] flex justify-between items-center">
          <div className="text-sm text-neutral-400">
            Period Total: <span className="text-white font-medium">${totalSales.toLocaleString()} revenue</span> / <span className="text-[#10B981] font-medium">${totalLabor.toLocaleString()} labor</span>
          </div>
          <div className={`text-sm font-medium ${parseFloat(laborPct) > 28 ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
            Avg Labor: {laborPct}%
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-neutral-400" /> AI-Generated Insights
            <span className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full ml-2">
              {activeInsights.length} active
            </span>
          </h2>
          <div className="flex items-center gap-3">
            {/* Department filter */}
            <div className="flex gap-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    selectedDept === dept
                      ? "bg-white/10 text-white border-white/20"
                      : "bg-transparent text-neutral-500 border-[#2D2D3A] hover:text-neutral-300"
                  }`}
                >
                  {dept === "all" ? "All" : dept}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showDismissed
                  ? "bg-white/10 text-white border-white/20"
                  : "text-neutral-500 border-[#2D2D3A] hover:text-neutral-300"
              }`}
            >
              {showDismissed ? "Hide Dismissed" : "Show Dismissed"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayInsights.length === 0 && (
            <div className="col-span-2 text-center py-12 text-neutral-500">
              <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No insights match this filter.
            </div>
          )}
          {displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 bg-[#1C1C24] rounded-xl border border-[#2D2D3A] transition-all ${
                insight.dismissed ? "opacity-50" : ""
              } ${insight.acted ? "ring-1 ring-[#10B981]/30" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${iconBgMap[insight.icon]}`}>
                  {iconMap[insight.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">{insight.title}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${priorityColors[insight.priority]}`}>
                      {insight.priority}
                    </span>
                    {insight.acted && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                        Actioned
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-sm mt-1">{insight.description}</p>
                  {insight.savingsEstimate > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#10B981]">
                      <DollarSign className="w-3 h-3" />
                      Est. savings: ${insight.savingsEstimate}/week
                    </div>
                  )}

                  {/* Action buttons */}
                  {!insight.dismissed && (
                    <div className="mt-3 flex items-center gap-2">
                      {!insight.acted && (
                        <button
                          onClick={() => handleActOnInsight(insight.id)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors font-medium"
                        >
                          <ThumbsUp className="w-3 h-3" /> Act on this
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissInsight(insight.id)}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
                      >
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
                  )}
                  {insight.dismissed && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleRestoreInsight(insight.id)}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Restore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
