"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Download,
  ArrowUpDown,
  Minus,
  Clock,
  Filter,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

type VarianceStatus = "over" | "under" | "expected";

interface ScheduleVariance {
  id: string;
  employeeName: string;
  department: string;
  role: string;
  scheduledHours: number;
  actualHours: number;
  variance: number;
  impact: string;
  status: VarianceStatus;
  acknowledged: boolean;
}

// ─── Initial Data ───────────────────────────────────────────────

const initialVariances: ScheduleVariance[] = [
  {
    id: "SV-001",
    employeeName: "Julian Alvarez",
    department: "Back of House",
    role: "Line Cook",
    scheduledHours: 40.0,
    actualHours: 48.5,
    variance: 8.5,
    impact: "+$187.00",
    status: "over",
    acknowledged: false,
  },
  {
    id: "SV-002",
    employeeName: "Mia Rodriguez",
    department: "Front of House",
    role: "Server",
    scheduledHours: 35.0,
    actualHours: 32.0,
    variance: -3.0,
    impact: "-$30.00",
    status: "under",
    acknowledged: false,
  },
  {
    id: "SV-003",
    employeeName: "Marcus Thorne",
    department: "Back of House",
    role: "Sous Chef",
    scheduledHours: 45.0,
    actualHours: 45.5,
    variance: 0.5,
    impact: "+$14.25",
    status: "expected",
    acknowledged: false,
  },
  {
    id: "SV-004",
    employeeName: "Eleanor Vance",
    department: "Back of House",
    role: "Executive Chef",
    scheduledHours: 50.0,
    actualHours: 52.0,
    variance: 2.0,
    impact: "+$0.00",
    status: "expected",
    acknowledged: true,
  },
  {
    id: "SV-005",
    employeeName: "Sophia Lin",
    department: "Front of House",
    role: "Sommelier",
    scheduledHours: 38.0,
    actualHours: 44.0,
    variance: 6.0,
    impact: "+$90.00",
    status: "over",
    acknowledged: false,
  },
  {
    id: "SV-006",
    employeeName: "Liam Johnson",
    department: "Front of House",
    role: "Server",
    scheduledHours: 30.0,
    actualHours: 25.5,
    variance: -4.5,
    impact: "-$45.00",
    status: "under",
    acknowledged: false,
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function computeImpactString(variance: number, rate: number): string {
  const impact = variance * rate;
  const sign = impact >= 0 ? "+" : "";
  return `${sign}$${Math.abs(impact).toFixed(2)}`;
}

function computeStatus(variance: number): VarianceStatus {
  if (variance > 2) return "over";
  if (variance < -2) return "under";
  return "expected";
}

// ─── Component ──────────────────────────────────────────────────

export default function SchedulesSyncPage() {
  const [variances, setVariances] = useState<ScheduleVariance[]>(initialVariances);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScheduled, setEditScheduled] = useState("");
  const [editActual, setEditActual] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("Just now");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "sync">("success");
  const [sortField, setSortField] = useState<"name" | "variance" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<VarianceStatus | "all">("all");

  // Derived KPIs
  const totalScheduled = variances.reduce((s, v) => s + v.scheduledHours, 0);
  const totalActual = variances.reduce((s, v) => s + v.actualHours, 0);
  const alertsCount = variances.filter((v) => v.status !== "expected" && !v.acknowledged).length;

  // Parse dollar impacts for forecasted cost
  const forecastedImpact = variances.reduce((sum, v) => {
    const num = parseFloat(v.impact.replace(/[+$,]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" | "sync" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Actions ────────────────────────────────────────────────

  const handleSyncFromPOS = useCallback(() => {
    setSyncing(true);
    // Simulate a POS sync with small data fluctuations
    setTimeout(() => {
      setVariances((prev) =>
        prev.map((v) => {
          const fluctuation = (Math.random() - 0.4) * 2; // slight bias toward increase
          const newActual = Math.max(0, +(v.actualHours + fluctuation).toFixed(1));
          const newVariance = +(newActual - v.scheduledHours).toFixed(1);
          const newStatus = computeStatus(newVariance);
          // Rough rate for impact: parse existing or use $22 default
          const rate = 22;
          return {
            ...v,
            actualHours: newActual,
            variance: newVariance,
            status: newStatus,
            impact: computeImpactString(newVariance, rate),
            acknowledged: newStatus === "expected" ? true : v.acknowledged,
          };
        })
      );
      setSyncing(false);
      const now = new Date();
      setLastSynced(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      showToast("POS data synced. Variances updated.", "sync");
    }, 1800);
  }, []);

  const handleAcknowledge = (id: string) => {
    setVariances((prev) =>
      prev.map((v) => (v.id === id ? { ...v, acknowledged: true } : v))
    );
    showToast("Variance acknowledged.");
  };

  const handleAcknowledgeAll = () => {
    setVariances((prev) => prev.map((v) => ({ ...v, acknowledged: true })));
    showToast("All variances acknowledged.");
  };

  const handleStartEdit = (v: ScheduleVariance) => {
    setEditingId(v.id);
    setEditScheduled(String(v.scheduledHours));
    setEditActual(String(v.actualHours));
  };

  const handleSaveEdit = (id: string) => {
    const scheduled = parseFloat(editScheduled) || 0;
    const actual = parseFloat(editActual) || 0;
    const variance = +(actual - scheduled).toFixed(1);
    const status = computeStatus(variance);
    const rate = 22;

    setVariances((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              scheduledHours: scheduled,
              actualHours: actual,
              variance,
              status,
              impact: computeImpactString(variance, rate),
              acknowledged: status === "expected",
            }
          : v
      )
    );
    setEditingId(null);
    showToast("Schedule variance updated.");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleExport = () => {
    const headers = ["Employee", "Role", "Department", "Scheduled", "Actual", "Variance", "Impact", "Status", "Acknowledged"];
    const rows = variances.map((v) => [
      v.employeeName, v.role, v.department,
      String(v.scheduledHours), String(v.actualHours),
      String(v.variance), v.impact, v.status,
      v.acknowledged ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule-variances.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Variances exported as CSV.", "info");
  };

  // ─── Sorting & Filtering ─────────────────────────────────────

  const handleSort = (field: "name" | "variance") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  let displayVariances = [...variances];
  if (filterStatus !== "all") {
    displayVariances = displayVariances.filter((v) => v.status === filterStatus);
  }
  if (sortField) {
    displayVariances.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.employeeName.localeCompare(b.employeeName);
      if (sortField === "variance") cmp = a.variance - b.variance;
      return sortAsc ? cmp : -cmp;
    });
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : toastType === "sync"
              ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "sync" && <RefreshCw className="w-4 h-4" />}
            {toastType === "info" && <Download className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">
            Schedules Sync
          </h1>
          <p className="text-neutral-400 mt-2">
            Compare scheduled shifts vs actual clock-ins.{" "}
            <span className="text-neutral-500">Last synced: {lastSynced}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleSyncFromPOS}
            disabled={syncing}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from POS"}
          </button>
          <button
            onClick={handleAcknowledgeAll}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Acknowledge All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Scheduled
            </h3>
            <CalendarDays className="text-neutral-400 w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              {totalScheduled.toFixed(1)}
            </div>
            <p className="text-xs text-neutral-400">Total Hours</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Actual
            </h3>
            <Clock className="text-[#10B981] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              {totalActual.toFixed(1)}
            </div>
            <p className="text-xs text-neutral-400">Total Hours</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Alert Count
            </h3>
            <AlertTriangle className={`w-5 h-5 ${alertsCount > 0 ? "text-[#F59E0B]" : "text-[#10B981]"}`} />
          </div>
          <div>
            <div className={`text-4xl font-light mb-1 ${alertsCount > 0 ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
              {alertsCount}
            </div>
            <p className="text-xs text-neutral-400">
              {alertsCount > 0 ? "Requires review" : "All clear"}
            </p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Forecasted Impact
            </h3>
            <AlertTriangle className={`w-5 h-5 ${forecastedImpact > 100 ? "text-[#F59E0B]" : "text-neutral-400"}`} />
          </div>
          <div>
            <div className={`text-4xl font-light mb-1 ${forecastedImpact > 100 ? "text-[#F59E0B]" : forecastedImpact < 0 ? "text-[#3B82F6]" : "text-white"}`}>
              {forecastedImpact >= 0 ? "+" : ""}${Math.abs(forecastedImpact).toFixed(2)}
            </div>
            <p className="text-xs text-neutral-400">Projected overrun cost</p>
          </div>
        </div>
      </div>

      {/* Variances Table */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Employee Variances</h2>
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            {(["all", "over", "under", "expected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  filterStatus === status
                    ? status === "over"
                      ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                      : status === "under"
                      ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30"
                      : status === "expected"
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                      : "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-neutral-500 border-[#2D2D3A] hover:text-neutral-300"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0E] border-b border-[#1F1F28]">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Employee
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  Scheduled
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  Actual
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  <button
                    onClick={() => handleSort("variance")}
                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                  >
                    Variance
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  Est. Impact
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28]">
              {displayVariances.map((v) => (
                <tr
                  key={v.id}
                  className={`transition-colors group ${
                    editingId === v.id
                      ? "bg-[#1A1A24] ring-1 ring-inset ring-white/10"
                      : "hover:bg-[#1A1A22]"
                  }`}
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {v.employeeName}
                          {v.acknowledged && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {v.role} • {v.department}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Scheduled */}
                  <td className="px-6 py-4 text-right">
                    {editingId === v.id ? (
                      <input
                        type="number"
                        step="0.5"
                        value={editScheduled}
                        onChange={(e) => setEditScheduled(e.target.value)}
                        className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-3 py-1.5 text-sm font-mono text-white w-24 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                    ) : (
                      <span className="text-neutral-300 font-mono">
                        {v.scheduledHours.toFixed(1)}
                      </span>
                    )}
                  </td>

                  {/* Actual */}
                  <td className="px-6 py-4 text-right">
                    {editingId === v.id ? (
                      <input
                        type="number"
                        step="0.5"
                        value={editActual}
                        onChange={(e) => setEditActual(e.target.value)}
                        className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-3 py-1.5 text-sm font-mono text-white w-24 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                    ) : (
                      <span className="text-white font-mono">
                        {v.actualHours.toFixed(1)}
                      </span>
                    )}
                  </td>

                  {/* Variance */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === "over" ? (
                        <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                      ) : v.status === "under" ? (
                        <TrendingDown className="w-4 h-4 text-[#3B82F6]" />
                      ) : (
                        <Minus className="w-4 h-4 text-neutral-500" />
                      )}
                      <span
                        className={`font-mono font-medium ${
                          v.variance > 0
                            ? "text-[#F59E0B]"
                            : v.variance < 0
                            ? "text-[#3B82F6]"
                            : "text-neutral-400"
                        }`}
                      >
                        {v.variance > 0 ? "+" : ""}
                        {v.variance.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Impact */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-medium ${
                        v.status === "over"
                          ? "text-[#F59E0B]"
                          : v.status === "under"
                          ? "text-[#3B82F6]"
                          : "text-neutral-400"
                      }`}
                    >
                      {v.impact}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {editingId === v.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(v.id)}
                          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 transition-colors font-medium"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors font-medium"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {!v.acknowledged && v.status !== "expected" && (
                          <button
                            onClick={() => handleAcknowledge(v.id)}
                            title="Acknowledge variance"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors font-medium opacity-0 group-hover:opacity-100"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ack
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(v)}
                          className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {displayVariances.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No variances match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS for toast animation */}
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
      `}</style>
    </div>
  );
}
