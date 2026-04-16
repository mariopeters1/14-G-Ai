"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Apple,
  Trash2,
  Calculator,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart3,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ChevronRight,
  X,
  Zap,
  Wifi,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Data Generation ────────────────────────────────────────────

const generateHourlyData = (targetRevenue: number) => {
  const data = [];
  let cumulativeRevenue = 0;
  const hours = ["10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM"];
  const steps = 7;
  let remaining = targetRevenue;
  for (let i = 0; i < hours.length; i++) {
    if (i > 6) break;
    let chunk = i === 6 ? remaining : (remaining / (steps - i)) * (0.8 + Math.random() * 0.4);
    cumulativeRevenue += chunk;
    remaining -= chunk;
    data.push({
      time: hours[i],
      revenue: Math.round(cumulativeRevenue),
      labor: Math.round(cumulativeRevenue * 0.29),
      food: Math.round(cumulativeRevenue * 0.34),
    });
  }
  return data;
};

const VENUES = [
  { id: "terra-bleu", name: "Terra Bleu", baseSales: 38565.09 },
  { id: "gator-flamingo", name: "Gator & Flamingo", baseSales: 29577.66 },
  { id: "kann-rum-bar", name: "Kan'n Rum Bar & Grill", baseSales: 7776.96 },
  { id: "test-kitchen", name: "Gastronomic AI Test Kitchen", baseSales: 5193.22 },
  { id: "market-kiosk", name: "Market Square Kiosk", baseSales: 3908.63 },
];

const overtimeAlerts = [
  { id: 1, employee: "Sarah Jenkins", reason: "Approaching 40hrs", hours: "38.5 hrs", severity: "warning" as const },
  { id: 2, employee: "Marcus Thorne", reason: "Double shift warning", hours: "32.0 hrs", severity: "info" as const },
  { id: 3, employee: "Elena Rodriguez", reason: "Missing break penalty", hours: "41.2 hrs", severity: "critical" as const },
];

const pendingApprovals = [
  { id: 1, type: "PTO", user: "David Kim", description: "Vacation prep for next week" },
  { id: 2, type: "SHIFT", user: "Amanda Cole", description: "Covering for James" },
  { id: 3, type: "PAY", user: "Thomas Wright", description: "Manual tip adjustment $45" },
];

const wasteStations = [
  { name: "BOH Prep Station", pct: 45, color: "#EF4444" },
  { name: "Line Spoilage", pct: 33, color: "#F59E0B" },
  { name: "FOH Comps/Spills", pct: 22, color: "#F97316" },
];

// ─── Component ──────────────────────────────────────────────────

export default function Formula86Page() {
  const [selectedVenueId, setSelectedVenueId] = useState("terra-bleu");
  const [activeTab, setActiveTab] = useState<"telemetry" | "payroll">("telemetry");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);

  // Payroll interactivity
  const [alerts, setAlerts] = useState(overtimeAlerts);
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

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

  // ─── Data Fetch ─────────────────────────────────────────────

  const fetchRealTimeData = useCallback(
    (venueId = selectedVenueId) => {
      setIsRefreshing(true);
      setTimeout(() => {
        const venue = VENUES.find((v) => v.id === venueId) || VENUES[0];
        const revenue = venue.baseSales;
        const labor = revenue * 0.29;
        const food = revenue * 0.34;
        const waste = revenue * 0.04;
        const ebitda = revenue - (labor + food + waste);
        const margin = (ebitda / revenue) * 100;

        setData({ revenue, labor, food, waste, ebitda, margin, trends: generateHourlyData(revenue) });
        setIsRefreshing(false);
      }, 800);
    },
    [selectedVenueId]
  );

  useEffect(() => {
    fetchRealTimeData(selectedVenueId);
    const interval = setInterval(() => fetchRealTimeData(selectedVenueId), 15000);
    return () => clearInterval(interval);
  }, [selectedVenueId, fetchRealTimeData]);

  // ─── Payroll Actions ────────────────────────────────────────

  const handleDismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast("Overtime alert dismissed.");
  };

  const handleApprove = (id: number) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(`${item?.user}'s ${item?.type} request approved.`, "success");
  };

  const handleDeny = (id: number) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(`${item?.user}'s request denied.`, "warning");
  };

  const handleExportReport = () => {
    if (!data) return;
    const lines = [
      "Metric,Value",
      `Revenue,${formatCurrency(data.revenue)}`,
      `Labor Cost,${formatCurrency(data.labor)}`,
      `Food Cost,${formatCurrency(data.food)}`,
      `Waste,${formatCurrency(data.waste)}`,
      `EBITDA,${formatCurrency(data.ebitda)}`,
      `Margin,${data.margin.toFixed(1)}%`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "f86-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported.", "info");
  };

  // ─── Loading ────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  const selectedVenue = VENUES.find((v) => v.id === selectedVenueId) || VENUES[0];

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
            {toastType === "info" && <Activity className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight flex items-center gap-3">
            <Activity className="w-7 h-7 text-neutral-400" /> F-86 Command Center
          </h1>
          <p className="text-neutral-400 mt-2">Real-time telemetry for restaurant operations and EBITDA tracking.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Venue Selector */}
          <div className="relative">
            <button
              onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
              className="px-4 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm border border-[#2D2D3A] flex items-center gap-2 min-w-[220px] justify-between"
            >
              <span className="truncate">{selectedVenue.name}</span>
              <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${venueDropdownOpen ? "rotate-90" : ""}`} />
            </button>
            {venueDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-full bg-[#111116] border border-[#2D2D3A] rounded-xl shadow-2xl z-30 overflow-hidden">
                {VENUES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVenueId(v.id); setVenueDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      v.id === selectedVenueId ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-[#1F1F28] hover:text-white"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live indicator */}
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            Live POS Sync
          </span>

          <button
            onClick={() => fetchRealTimeData(selectedVenueId)}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm border border-[#2D2D3A] flex items-center gap-2 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /> Sync
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-[#111116] border border-[#1F1F28] rounded-xl w-fit mb-8">
        {(["telemetry", "payroll"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-black"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            {tab === "telemetry" ? "Live Telemetry" : "Gastronomic Pay"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TELEMETRY TAB                                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "telemetry" && (
        <div className="space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Revenue — wide */}
            <div className="xl:col-span-2 bg-[#111116] border border-[#10B981]/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] to-[#10B981]/30" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Real-Time Revenue</p>
                  <p className="text-3xl font-light text-[#10B981] font-mono tracking-tight">{formatCurrency(data.revenue)}</p>
                </div>
                <div className="p-3 bg-[#10B981]/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-neutral-500">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981] mr-1" />
                <span className="text-[#10B981] font-medium mr-1">+12.5%</span> from yesterday
              </div>
            </div>

            {/* Labor */}
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Labor Cost</p>
                <Users className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-2xl font-light text-[#EF4444] font-mono">{formatCurrency(data.labor)}</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {((data.labor / data.revenue) * 100).toFixed(1)}% of Revenue <span className="text-neutral-600">(Target &lt;30%)</span>
              </p>
            </div>

            {/* Food */}
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Food Cost</p>
                <Apple className="w-4 h-4 text-neutral-500" />
              </div>
              <p className="text-2xl font-light text-[#F97316] font-mono">{formatCurrency(data.food)}</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {((data.food / data.revenue) * 100).toFixed(1)}% of Revenue <span className="text-neutral-600">(Target &lt;28%)</span>
              </p>
            </div>

            {/* EBITDA — wide */}
            <div className="xl:col-span-2 bg-[#111116] border border-[#F59E0B]/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/30" />
              <div className="absolute top-4 right-4 opacity-5">
                <Calculator className="w-20 h-20" />
              </div>
              <div className="relative">
                <p className="text-xs font-medium text-[#F59E0B] uppercase tracking-wider mb-2">Generated EBITDA</p>
                <p className="text-3xl font-light text-[#F59E0B] font-mono tracking-tight">{formatCurrency(data.ebitda)}</p>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="flex items-center text-[#F59E0B]">
                    <Percent className="w-3.5 h-3.5 mr-1" />
                    <span className="font-medium">{data.margin.toFixed(1)}%</span>
                  </span>
                  <span className="text-neutral-500">Operating Margin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart + Waste Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1F1F28] bg-[#0D0D12]">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neutral-400" /> Intraday Revenue Performance
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Cumulative revenue against labor and food burn rates.</p>
              </div>
              <div className="p-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F28" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tickMargin={10} fontSize={11} tick={{ fill: "#6B7280" }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} fontSize={11} tick={{ fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{ background: "#111116", border: "1px solid #2D2D3A", borderRadius: "12px", fontSize: "12px", color: "#fff" }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelStyle={{ color: "#9CA3AF" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                    <Area type="monotone" dataKey="labor" stroke="#EF4444" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" name="Labor" />
                    <Area type="monotone" dataKey="food" stroke="#F97316" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" name="Food" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Chart Legend */}
              <div className="px-6 py-3 border-t border-[#1F1F28] flex gap-6 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#10B981] rounded" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#EF4444] rounded border-dashed" /> Labor</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#F97316] rounded" /> Food</span>
              </div>
            </div>

            {/* Waste Impact */}
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1F1F28] bg-[#0D0D12]">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-[#EF4444]" /> Waste Impact
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Tracked waste across stations today.</p>
              </div>
              <div className="p-6 space-y-5">
                {wasteStations.map((station) => (
                  <div key={station.name}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-neutral-300">{station.name}</span>
                      <span className="text-sm font-mono text-white">{formatCurrency(data.waste * (station.pct / 100))}</span>
                    </div>
                    <div className="h-2 bg-[#1F1F28] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${station.pct}%`, background: station.color }} />
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 bg-[#EF4444]/5 rounded-xl border border-[#EF4444]/15">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="w-4 h-4 text-[#EF4444]" />
                    <h4 className="text-sm font-medium text-[#EF4444]">AI Insight</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Line spoilage has increased 12% week-over-week. Ensure proper FIFO rotation on the grill station.
                  </p>
                </div>

                <div className="pt-2 text-center">
                  <div className="text-xs text-neutral-600">Total Waste</div>
                  <div className="text-xl font-light text-[#EF4444] font-mono">{formatCurrency(data.waste)}</div>
                  <div className="text-[10px] text-neutral-600">{((data.waste / data.revenue) * 100).toFixed(1)}% of Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PAYROLL TAB                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "payroll" && (
        <div className="space-y-8">
          {/* Payroll Header */}
          <div className="flex justify-between items-end border-b border-[#1F1F28] pb-6">
            <div>
              <h2 className="text-2xl font-medium text-white">Labor & Payroll Deep Dive</h2>
              <p className="text-neutral-400 mt-1 text-sm">Current Pay Period: <span className="text-white">Mar 15 - Mar 31, 2026</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportReport}
                className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm border border-[#2D2D3A] flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button
                onClick={() => showToast("Draft payroll generated for review.", "info")}
                className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Run Draft Payroll
              </button>
            </div>
          </div>

          {/* Payroll KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Payroll Readiness</p>
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="text-3xl font-light text-white font-mono">94%</div>
              <p className="text-xs text-[#10B981] font-medium mt-1">Ready for submission</p>
            </div>

            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Overtime Risk</p>
                <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="text-3xl font-light text-white font-mono">{formatCurrency(1450)}</div>
              <p className="text-xs text-[#EF4444] font-medium mt-1">{alerts.length} alerts active</p>
            </div>

            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Labor vs Sales</p>
                <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="text-3xl font-light text-white font-mono">+2.4%</div>
              <p className="text-xs text-[#F59E0B] font-medium mt-1">Above ideal target</p>
            </div>

            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Projected Est.</p>
                <DollarSign className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="text-3xl font-light text-white font-mono">{formatCurrency(24500)}</div>
              <p className="text-xs text-neutral-500 font-medium mt-1">Total Employer Burden</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overtime Alerts */}
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-center">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neutral-400" /> Overtime Alerts
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-medium">
                  {alerts.length} Issues
                </span>
              </div>
              <div className="p-4 space-y-3">
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    All overtime alerts resolved.
                  </div>
                )}
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-[#0D0D12] rounded-xl border border-[#1F1F28] group">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium text-sm">{alert.employee}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{alert.reason}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-mono font-medium text-sm ${
                            alert.severity === "critical" ? "text-[#EF4444]" : alert.severity === "warning" ? "text-[#F59E0B]" : "text-neutral-400"
                          }`}>
                            {alert.hours}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                            title="Review"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="p-1.5 text-neutral-500 hover:text-[#10B981] hover:bg-[#10B981]/10 rounded-md transition-colors"
                            title="Dismiss"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {expandedAlert === alert.id && (
                      <div className="mt-3 pt-3 border-t border-[#1F1F28] text-xs text-neutral-400 space-y-1">
                        <p>• Current weekly hours: <span className="text-white">{alert.hours}</span></p>
                        <p>• Scheduled remaining: <span className="text-white">8.0 hrs</span></p>
                        <p>• Estimated OT cost: <span className="text-[#EF4444]">{formatCurrency(45 * 1.5 * 2)}</span></p>
                        <button
                          onClick={() => showToast(`Schedule adjusted for ${alert.employee}.`, "success")}
                          className="mt-2 px-3 py-1.5 bg-white/5 text-white rounded-lg border border-[#2D2D3A] hover:bg-white/10 transition-colors"
                        >
                          Adjust Schedule →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-center">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-neutral-400" /> Pending Approvals
                </h2>
                <span className="text-xs text-neutral-500">{approvals.length} pending</span>
              </div>
              <div className="p-4 space-y-3">
                {approvals.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    All approvals processed.
                  </div>
                )}
                {approvals.map((approval) => (
                  <div key={approval.id} className="p-4 bg-[#0D0D12] rounded-xl border border-[#1F1F28] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          approval.type === "PTO" ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" :
                          approval.type === "SHIFT" ? "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20" :
                          "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20"
                        }`}>
                          {approval.type}
                        </span>
                        <p className="text-white font-medium text-sm">{approval.user}</p>
                      </div>
                      <p className="text-xs text-neutral-500">{approval.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeny(approval.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/15 border border-[#EF4444]/20 transition-colors text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#10B981] bg-[#10B981]/5 hover:bg-[#10B981]/15 border border-[#10B981]/20 transition-colors text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
