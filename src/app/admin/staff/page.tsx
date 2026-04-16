"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarClock,
  BrainCircuit,
  UserPlus,
  Settings,
  ChefHat,
  Trash2,
  CalendarDays,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Download,
  Eye,
  Copy,
  Check,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ─── Shared Employee Roster (syncs with Gastronomic Pay) ────────

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  payRate: number;
  availability: string;
  status: "active" | "inactive";
  weeklyHours: number;
  otThreshold: number;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  day: string;
  start: string;
  end: string;
  hours: number;
  cost: number;
  isOT: boolean;
}

interface ScheduleDay {
  day: string;
  shifts: Shift[];
  totalHours: number;
  totalCost: number;
}

// Roster mirrors Gastronomic Pay employees for cross-module consistency
const sharedRoster: Employee[] = [
  { id: "EMP-001", name: "Marcus Thorne", role: "Sous Chef", department: "Back of House", payRate: 28.5, availability: "Mon-Sat 6AM-4PM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-002", name: "Julian Alvarez", role: "Line Cook", department: "Back of House", payRate: 22.0, availability: "Mon-Fri 9AM-10PM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-003", name: "Mia Rodriguez", role: "Server", department: "Front of House", payRate: 15.5, availability: "Wed-Sun 4PM-12AM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-004", name: "Sophia Lin", role: "Sommelier", department: "Front of House", payRate: 24.0, availability: "Tue-Sat 3PM-12AM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-005", name: "Eleanor Vance", role: "Executive Chef", department: "Back of House", payRate: 42.0, availability: "Mon-Fri 6AM-4PM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-006", name: "David Park", role: "Server", department: "Front of House", payRate: 15.5, availability: "Any day after 5PM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-007", name: "Charlie Nguyen", role: "Bartender", department: "Bar", payRate: 18.0, availability: "Mon, Wed-Sun 5PM-2AM", status: "active", weeklyHours: 0, otThreshold: 40 },
  { id: "EMP-008", name: "Alice Monroe", role: "Pastry Chef", department: "Back of House", payRate: 26.0, availability: "Mon-Fri 7AM-3PM", status: "active", weeklyHours: 0, otThreshold: 40 },
];

const roles = ["Executive Chef", "Sous Chef", "Line Cook", "Pastry Chef", "Server", "Bartender", "Sommelier", "Host", "Busser", "Dishwasher", "Bar Manager"];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const roleColors: Record<string, string> = {
  "Executive Chef": "#EF4444",
  "Sous Chef": "#F59E0B",
  "Line Cook": "#10B981",
  "Pastry Chef": "#F472B6",
  "Server": "#3B82F6",
  "Bartender": "#8B5CF6",
  "Sommelier": "#06B6D4",
  "Host": "#6366F1",
  "Busser": "#84CC16",
  "Dishwasher": "#78716C",
  "Bar Manager": "#A855F7",
};

// Demo generated schedule
const demoSchedule: ScheduleDay[] = [
  {
    day: "Monday", totalHours: 40, totalCost: 832.50,
    shifts: [
      { id: "S001", employeeId: "EMP-005", employeeName: "Eleanor Vance", role: "Executive Chef", day: "Monday", start: "6:00 AM", end: "3:00 PM", hours: 9, cost: 378.0, isOT: false },
      { id: "S002", employeeId: "EMP-001", employeeName: "Marcus Thorne", role: "Sous Chef", day: "Monday", start: "7:00 AM", end: "3:30 PM", hours: 8.5, cost: 242.25, isOT: false },
      { id: "S003", employeeId: "EMP-002", employeeName: "Julian Alvarez", role: "Line Cook", day: "Monday", start: "9:00 AM", end: "5:00 PM", hours: 8, cost: 176.0, isOT: false },
      { id: "S004", employeeId: "EMP-008", employeeName: "Alice Monroe", role: "Pastry Chef", day: "Monday", start: "7:00 AM", end: "3:00 PM", hours: 8, cost: 208.0, isOT: false },
    ],
  },
  {
    day: "Tuesday", totalHours: 48.5, totalCost: 1012.75,
    shifts: [
      { id: "S010", employeeId: "EMP-005", employeeName: "Eleanor Vance", role: "Executive Chef", day: "Tuesday", start: "6:00 AM", end: "3:00 PM", hours: 9, cost: 378.0, isOT: false },
      { id: "S011", employeeId: "EMP-001", employeeName: "Marcus Thorne", role: "Sous Chef", day: "Tuesday", start: "7:00 AM", end: "3:30 PM", hours: 8.5, cost: 242.25, isOT: false },
      { id: "S012", employeeId: "EMP-002", employeeName: "Julian Alvarez", role: "Line Cook", day: "Tuesday", start: "2:00 PM", end: "10:00 PM", hours: 8, cost: 176.0, isOT: false },
      { id: "S013", employeeId: "EMP-004", employeeName: "Sophia Lin", role: "Sommelier", day: "Tuesday", start: "3:30 PM", end: "11:30 PM", hours: 8, cost: 192.0, isOT: false },
      { id: "S014", employeeId: "EMP-007", employeeName: "Charlie Nguyen", role: "Bartender", day: "Tuesday", start: "5:00 PM", end: "2:00 AM", hours: 9, cost: 162.0, isOT: false },
      { id: "S015", employeeId: "EMP-006", employeeName: "David Park", role: "Server", day: "Tuesday", start: "5:00 PM", end: "11:00 PM", hours: 6, cost: 93.0, isOT: false },
    ],
  },
  {
    day: "Friday", totalHours: 62, totalCost: 1389.0,
    shifts: [
      { id: "S030", employeeId: "EMP-005", employeeName: "Eleanor Vance", role: "Executive Chef", day: "Friday", start: "6:00 AM", end: "4:00 PM", hours: 10, cost: 420.0, isOT: false },
      { id: "S031", employeeId: "EMP-001", employeeName: "Marcus Thorne", role: "Sous Chef", day: "Friday", start: "7:00 AM", end: "4:00 PM", hours: 9, cost: 256.5, isOT: false },
      { id: "S032", employeeId: "EMP-002", employeeName: "Julian Alvarez", role: "Line Cook", day: "Friday", start: "9:00 AM", end: "5:00 PM", hours: 8, cost: 176.0, isOT: false },
      { id: "S033", employeeId: "EMP-008", employeeName: "Alice Monroe", role: "Pastry Chef", day: "Friday", start: "7:00 AM", end: "3:00 PM", hours: 8, cost: 208.0, isOT: false },
      { id: "S034", employeeId: "EMP-003", employeeName: "Mia Rodriguez", role: "Server", day: "Friday", start: "4:00 PM", end: "12:00 AM", hours: 8, cost: 124.0, isOT: false },
      { id: "S035", employeeId: "EMP-006", employeeName: "David Park", role: "Server", day: "Friday", start: "5:00 PM", end: "11:00 PM", hours: 6, cost: 93.0, isOT: false },
      { id: "S036", employeeId: "EMP-004", employeeName: "Sophia Lin", role: "Sommelier", day: "Friday", start: "3:30 PM", end: "11:30 PM", hours: 8, cost: 192.0, isOT: false },
      { id: "S037", employeeId: "EMP-007", employeeName: "Charlie Nguyen", role: "Bartender", day: "Friday", start: "5:00 PM", end: "2:00 AM", hours: 9, cost: 162.0, isOT: false },
    ],
  },
  {
    day: "Saturday", totalHours: 65, totalCost: 1498.0,
    shifts: [
      { id: "S040", employeeId: "EMP-001", employeeName: "Marcus Thorne", role: "Sous Chef", day: "Saturday", start: "7:00 AM", end: "4:00 PM", hours: 9, cost: 256.5, isOT: false },
      { id: "S041", employeeId: "EMP-002", employeeName: "Julian Alvarez", role: "Line Cook", day: "Saturday", start: "11:00 AM", end: "10:00 PM", hours: 11, cost: 275.0, isOT: true },
      { id: "S042", employeeId: "EMP-003", employeeName: "Mia Rodriguez", role: "Server", day: "Saturday", start: "4:00 PM", end: "12:00 AM", hours: 8, cost: 124.0, isOT: false },
      { id: "S043", employeeId: "EMP-006", employeeName: "David Park", role: "Server", day: "Saturday", start: "5:00 PM", end: "12:00 AM", hours: 7, cost: 108.5, isOT: false },
      { id: "S044", employeeId: "EMP-004", employeeName: "Sophia Lin", role: "Sommelier", day: "Saturday", start: "3:30 PM", end: "12:00 AM", hours: 8.5, cost: 204.0, isOT: false },
      { id: "S045", employeeId: "EMP-007", employeeName: "Charlie Nguyen", role: "Bartender", day: "Saturday", start: "5:00 PM", end: "2:00 AM", hours: 9, cost: 162.0, isOT: false },
      { id: "S046", employeeId: "EMP-008", employeeName: "Alice Monroe", role: "Pastry Chef", day: "Saturday", start: "7:00 AM", end: "2:00 PM", hours: 7, cost: 182.0, isOT: false },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────

export default function StaffPage() {
  const [employees, setEmployees] = useState<Employee[]>(sharedRoster);
  const [schedule, setSchedule] = useState<ScheduleDay[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"scheduler" | "roster" | "roles">("scheduler");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New hire form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newAvail, setNewAvail] = useState("");

  // Scheduler form
  const [forecast, setForecast] = useState("High traffic expected Friday and Saturday from 7-9 PM. Lunch rush is 12-2 PM daily.");
  const [events, setEvents] = useState("Private party for 30 on Saturday requires 2 extra servers and 1 bartender from 6 PM.");

  // Role management
  const [rolesList, setRolesList] = useState(roles);
  const [newRoleName, setNewRoleName] = useState("");

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

  // ─── Computed ─────────────────────────────────────────────

  const totalWeeklyCost = schedule?.reduce((s, d) => s + d.totalCost, 0) ?? 0;
  const totalWeeklyHours = schedule?.reduce((s, d) => s + d.totalHours, 0) ?? 0;
  const otShifts = schedule?.reduce((s, d) => s + d.shifts.filter((sh) => sh.isOT).length, 0) ?? 0;

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Handlers ─────────────────────────────────────────────

  const handleGenerate = () => {
    setIsGenerating(true);
    setSchedule(null);
    setTimeout(() => {
      setSchedule(demoSchedule);
      setIsGenerating(false);
      showToast(`Schedule generated — ${demoSchedule.length} days, $${demoSchedule.reduce((s, d) => s + d.totalCost, 0).toLocaleString()} labor cost.`);
    }, 2200);
  };

  const handleAddEmployee = () => {
    if (!newName.trim() || !newRole || !newRate) {
      showToast("Name, role, and pay rate are required.", "warning");
      return;
    }
    const emp: Employee = {
      id: `EMP-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      department: ["Server", "Sommelier", "Host", "Busser"].includes(newRole) ? "Front of House" : ["Bartender", "Bar Manager"].includes(newRole) ? "Bar" : "Back of House",
      payRate: parseFloat(newRate),
      availability: newAvail || "Flexible",
      status: "active",
      weeklyHours: 0,
      otThreshold: 40,
    };
    setEmployees((prev) => [...prev, emp]);
    setNewName("");
    setNewRole("");
    setNewRate("");
    setNewAvail("");
    showToast(`${emp.name} added to roster → synced with Gastronomic Pay.`);
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast("Employee removed from roster.");
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    if (rolesList.includes(newRoleName.trim())) {
      showToast("Role already exists.", "warning");
      return;
    }
    setRolesList((prev) => [...prev, newRoleName.trim()].sort());
    setNewRoleName("");
    showToast("Role added.");
  };

  const handleRemoveRole = (role: string) => {
    setRolesList((prev) => prev.filter((r) => r !== role));
  };

  const handleExport = () => {
    if (!schedule) return;
    const lines = ["Day,Employee,Role,Start,End,Hours,Cost,OT"];
    schedule.forEach((d) => {
      d.shifts.forEach((s) => {
        lines.push(`"${d.day}","${s.employeeName}","${s.role}","${s.start}","${s.end}",${s.hours},$${s.cost.toFixed(2)},${s.isOT}`);
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Schedule exported.", "info");
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
            {toastType === "info" && <Sparkles className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Staff Scheduler</h1>
          <p className="text-neutral-400 mt-2">
            AI-optimized rostering synced with{" "}
            <Link href="/admin/pay" className="text-[#F59E0B] hover:underline inline-flex items-center gap-1">
              Gastronomic Pay <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {([
          { key: "scheduler", label: "Scheduler", icon: <CalendarClock className="w-4 h-4" /> },
          { key: "roster", label: `Roster (${employees.length})`, icon: <Users className="w-4 h-4" /> },
          { key: "roles", label: "Roles", icon: <Settings className="w-4 h-4" /> },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
              activeTab === tab.key ? "bg-white text-black border-white" : "bg-[#111116] text-neutral-400 border-[#1F1F28] hover:text-white hover:bg-[#1C1C24]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: SCHEDULER                                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "scheduler" && (
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Inputs */}
          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-24 self-start">
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-neutral-400" /> Smart Scheduler
                </h2>
                <p className="text-xs text-neutral-500 mt-1">AI generates an optimized schedule from your inputs.</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Demand Forecast & Peak Hours
                  </label>
                  <textarea value={forecast} onChange={(e) => setForecast(e.target.value)} rows={3} className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Special Events
                  </label>
                  <textarea value={events} onChange={(e) => setEvents(e.target.value)} rows={2} className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500" />
                </div>

                {/* Roster Preview */}
                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Active Roster ({employees.filter((e) => e.status === "active").length} employees)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {employees.filter((e) => e.status === "active").map((e) => (
                      <span key={e.id} className="px-2.5 py-1 rounded-lg text-[10px] font-medium border" style={{ backgroundColor: `${roleColors[e.role] || "#fff"}10`, color: roleColors[e.role] || "#fff", borderColor: `${roleColors[e.role] || "#fff"}20` }}>
                        {e.name.split(" ")[0]} • {e.role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40">
              {isGenerating ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>) : (<><Sparkles className="w-4 h-4" /> Generate Smart Schedule</>)}
            </button>

            {/* Pay Integration Banner */}
            <Link href="/admin/pay/schedules" className="block bg-[#111116] border border-[#F59E0B]/15 rounded-2xl p-4 hover:bg-[#1C1C24] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Gastronomic Pay Sync</h4>
                    <p className="text-[10px] text-neutral-500">View schedule variances & labor costs →</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
            </Link>
          </div>

          {/* Right: Schedule Results */}
          <div className="lg:col-span-3">
            {/* Loading */}
            {isGenerating && (
              <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                  <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Building Optimized Schedule</h3>
                <p className="text-neutral-400 text-sm max-w-md">Matching staff availability with demand forecasts, minimizing overtime, and balancing labor costs...</p>
                <div className="w-48 h-1 bg-[#1F1F28] rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-white/30 rounded-full animate-[progress_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && !schedule && (
              <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                  <CalendarDays className="w-9 h-9 text-neutral-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Weekly Schedule</h3>
                <p className="text-neutral-400 text-sm max-w-md">Fill in your demand data and click &quot;Generate Smart Schedule&quot; to create an optimized weekly roster.</p>
              </div>
            )}

            {/* Schedule Results */}
            {!isGenerating && schedule && (
              <div className="space-y-5">
                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Weekly Labor", value: `$${totalWeeklyCost.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                    { label: "Total Hours", value: totalWeeklyHours.toString(), icon: <Clock className="w-5 h-5" />, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
                    { label: "OT Shifts", value: otShifts.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: otShifts > 0 ? "text-[#F59E0B]" : "text-[#10B981]", bg: otShifts > 0 ? "bg-[#F59E0B]/10" : "bg-[#10B981]/10" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-4">
                      <div className={`${kpi.bg} ${kpi.color} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>{kpi.icon}</div>
                      <div className="text-xl font-light text-white font-mono">{kpi.value}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{kpi.label}</div>
                    </div>
                  ))}
                </div>

                {/* Header + Export */}
                <div className="flex justify-between items-center">
                  <h3 className="text-sm text-neutral-400">{schedule.length} scheduled days</h3>
                  <button onClick={handleExport} className="px-4 py-2 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg text-xs border border-[#2D2D3A] flex items-center gap-2 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>

                {/* Day Cards */}
                {schedule.map((day) => (
                  <div key={day.day} className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
                    <button onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)} className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{day.day}</span>
                        <span className="text-xs text-neutral-500">{day.shifts.length} shifts</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-neutral-500 font-mono">{day.totalHours}h</span>
                        <span className="text-sm text-[#10B981] font-mono">${day.totalCost.toFixed(0)}</span>
                        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${expandedDay === day.day ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {expandedDay === day.day && (
                      <div className="px-6 pb-5 space-y-2 border-t border-[#1F1F28]">
                        <div className="pt-3" />
                        {day.shifts.map((shift) => (
                          <div key={shift.id} className="flex items-center justify-between px-4 py-3 bg-[#0D0D12] rounded-xl border border-[#1F1F28]">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: roleColors[shift.role] || "#fff" }} />
                              <div>
                                <span className="text-sm text-white font-medium">{shift.employeeName}</span>
                                <span className="text-xs text-neutral-500 ml-2">{shift.role}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-neutral-400 font-mono">{shift.start} – {shift.end}</span>
                              <span className="text-xs text-neutral-500 font-mono">{shift.hours}h</span>
                              {shift.isOT && <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] rounded-full border border-[#F59E0B]/20">OT</span>}
                              <span className="text-xs text-[#10B981] font-mono w-16 text-right">${shift.cost.toFixed(0)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Sync to Pay Link */}
                <Link href="/admin/pay/schedules" className="flex items-center justify-center gap-2 py-3 bg-[#F59E0B]/5 border border-[#F59E0B]/15 rounded-xl text-[#F59E0B] text-xs font-medium hover:bg-[#F59E0B]/10 transition-colors">
                  <DollarSign className="w-3.5 h-3.5" /> Sync schedule to Gastronomic Pay → View Variances
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: ROSTER                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "roster" && (
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Add Employee */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 self-start">
            <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
                <h2 className="text-lg font-medium text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-neutral-400" /> Add Employee</h2>
                <p className="text-xs text-neutral-500 mt-1">Syncs with Gastronomic Pay employee directory.</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Full Name *</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Jane Doe" className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Role *</label>
                  <div className="relative">
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer">
                      <option value="">Select a role</option>
                      {rolesList.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Hourly Rate ($) *</label>
                  <input type="number" step="0.50" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="25.00" className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Availability</label>
                  <textarea value={newAvail} onChange={(e) => setNewAvail(e.target.value)} rows={2} placeholder="e.g., Weekdays 9AM-5PM" className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500" />
                </div>
                <button onClick={handleAddEmployee} className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <UserPlus className="w-4 h-4" /> Add to Roster
                </button>
              </div>
            </div>
          </div>

          {/* Right: Employee List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search + Pay Link */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search employees..." className="w-full bg-[#111116] border border-[#1F1F28] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500" />
              </div>
              <Link href="/admin/pay/employees" className="px-4 py-2.5 bg-[#111116] border border-[#1F1F28] rounded-lg text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Pay Directory
              </Link>
            </div>

            <div className="text-xs text-neutral-500">{filteredEmployees.length} employees</div>

            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-[#111116] border border-[#1F1F28] rounded-2xl px-5 py-4 flex items-center justify-between group hover:border-[#2D2D3A] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: roleColors[emp.role] || "#666" }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{emp.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${roleColors[emp.role] || "#fff"}10`, color: roleColors[emp.role] || "#fff", borderColor: `${roleColors[emp.role] || "#fff"}20` }}>
                        {emp.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-neutral-500">{emp.department}</span>
                      <span className="text-xs text-[#10B981] font-mono">${emp.payRate.toFixed(2)}/hr</span>
                      <span className="text-xs text-neutral-600">{emp.availability}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleRemoveEmployee(emp.id)} className="p-2 hover:bg-[#EF4444]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4 text-neutral-500 hover:text-[#EF4444]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TAB: ROLES                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "roles" && (
        <div className="max-w-2xl">
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2"><Settings className="w-5 h-5 text-neutral-400" /> Manage Roles</h2>
              <p className="text-xs text-neutral-500 mt-1">Roles available for scheduling and payroll assignment.</p>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-5">
                <input type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="New role name..." onKeyDown={(e) => { if (e.key === "Enter") handleAddRole(); }} className="flex-1 bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500" />
                <button onClick={handleAddRole} className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors">Add</button>
              </div>
              <div className="space-y-2">
                {rolesList.map((role) => (
                  <div key={role} className="flex items-center justify-between px-4 py-3 bg-[#0D0D12] border border-[#1F1F28] rounded-xl group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roleColors[role] || "#555" }} />
                      <span className="text-sm text-white">{role}</span>
                      <span className="text-[10px] text-neutral-600">({employees.filter((e) => e.role === role).length} assigned)</span>
                    </div>
                    <button onClick={() => handleRemoveRole(role)} className="p-1.5 hover:bg-[#EF4444]/10 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5 text-neutral-500 hover:text-[#EF4444]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes progress { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
      `}</style>
    </div>
  );
}
