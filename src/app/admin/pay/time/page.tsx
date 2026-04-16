"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, ChevronRight, FileClock, XCircle, Save, X, Download } from "lucide-react";

// Inline demo data so the client component is self-contained
const initialTimeEntries = [
  {
    id: "TE-101",
    employeeName: "Marcus Thorne",
    role: "Sous Chef",
    date: "2026-03-15",
    clockIn: "08:00 AM",
    clockOut: "04:30 PM",
    totalHours: 8.5,
    status: "approved",
    issues: [] as string[],
  },
  {
    id: "TE-102",
    employeeName: "Julian Alvarez",
    role: "Line Cook",
    date: "2026-03-15",
    clockIn: "09:15 AM",
    clockOut: "09:45 PM",
    totalHours: 12.0,
    status: "flagged",
    issues: ["Meal penalty", "Approaching OT"],
  },
  {
    id: "TE-103",
    employeeName: "Mia Rodriguez",
    role: "Server",
    date: "2026-03-15",
    clockIn: "04:00 PM",
    clockOut: "--:--",
    totalHours: 0,
    status: "pending",
    issues: ["Missed Punch Out"],
  },
  {
    id: "TE-104",
    employeeName: "Sophia Lin",
    role: "Sommelier",
    date: "2026-03-15",
    clockIn: "03:30 PM",
    clockOut: "11:30 PM",
    totalHours: 8.0,
    status: "approved",
    issues: [] as string[],
  },
  {
    id: "TE-105",
    employeeName: "Eleanor Vance",
    role: "Executive Chef",
    date: "2026-03-15",
    clockIn: "06:00 AM",
    clockOut: "03:00 PM",
    totalHours: 9.0,
    status: "approved",
    issues: [] as string[],
  },
  {
    id: "TE-106",
    employeeName: "Liam Johnson",
    role: "Server",
    date: "2026-03-15",
    clockIn: "10:30 AM",
    clockOut: "07:15 PM",
    totalHours: 8.75,
    status: "flagged",
    issues: ["Late clock-in"],
  },
];

type TimeEntry = typeof initialTimeEntries[number];

// Helper to parse 12h time strings like "08:00 AM" into total minutes for hour calc
function parseTimeToMinutes(time: string): number | null {
  if (!time || time === "--:--") return null;
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function minutesToTimeStr(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const meridiem = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${meridiem}`;
}

function computeHours(clockIn: string, clockOut: string): number {
  const inMin = parseTimeToMinutes(clockIn);
  const outMin = parseTimeToMinutes(clockOut);
  if (inMin === null || outMin === null) return 0;
  let diff = outMin - inMin;
  if (diff < 0) diff += 24 * 60; // overnight shift
  return Math.round((diff / 60) * 100) / 100;
}

export default function TimeAndAttendancePage() {
  const [entries, setEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClockIn, setEditClockIn] = useState("");
  const [editClockOut, setEditClockOut] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  // Derived KPIs
  const clockedInNow = entries.filter(
    (e) => e.clockOut === "--:--" || e.status === "pending"
  ).length + 22; // pad to simulate rest of staff
  const flaggedCount = entries.filter((e) => e.status === "flagged").length;
  const missedPunches = entries.filter(
    (e) => e.clockOut === "--:--"
  ).length;

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
  };

  // ─── Actions ──────────────────────────────────────────────────

  const handleApproveAll = () => {
    setEntries((prev) =>
      prev.map((e) =>
        e.status !== "approved"
          ? { ...e, status: "approved", issues: [] }
          : e
      )
    );
    showToast("All timecards approved successfully.");
  };

  const handleApproveSingle = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "approved", issues: [] } : e
      )
    );
    showToast("Timecard approved.");
  };

  const handleStartEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditClockIn(entry.clockIn);
    setEditClockOut(entry.clockOut === "--:--" ? "" : entry.clockOut);
  };

  const handleSaveEdit = (id: string) => {
    const formattedOut = editClockOut.trim() || "--:--";
    const hours = computeHours(editClockIn, formattedOut);
    const issues: string[] = [];
    if (formattedOut === "--:--") issues.push("Missed Punch Out");
    if (hours > 10) issues.push("Approaching OT");

    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              clockIn: editClockIn,
              clockOut: formattedOut,
              totalHours: hours,
              issues,
              status: issues.length > 0 ? "flagged" : "approved",
            }
          : e
      )
    );
    setEditingId(null);
    showToast("Time entry updated.");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleExportTimesheets = () => {
    // Build CSV
    const headers = ["Employee", "Role", "Date", "Clock In", "Clock Out", "Hours", "Status", "Issues"];
    const rows = entries.map((e) => [
      e.employeeName,
      e.role,
      e.date,
      e.clockIn,
      e.clockOut,
      e.totalHours > 0 ? String(e.totalHours) : "--",
      e.status,
      e.issues.join("; "),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheets-${entries[0]?.date || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Timesheets exported as CSV.", "info");
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">
            Time & Attendance
          </h1>
          <p className="text-neutral-400 mt-2">
            Daily timecards, break compliance, and edit approvals.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportTimesheets}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Timesheets
          </button>
          <button
            onClick={handleApproveAll}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve All
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Clocked In Now
            </h3>
            <Clock className="text-[#10B981] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              {clockedInNow}
            </div>
            <p className="text-xs text-neutral-400">Across 3 departments</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Flagged Entries
            </h3>
            <AlertTriangle className="text-[#F59E0B] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              {flaggedCount}
            </div>
            <p className="text-xs text-[#F59E0B]">Requires manager review</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">
              Missed Punches
            </h3>
            <XCircle className="text-[#EF4444] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              {missedPunches}
            </div>
            <p className="text-xs text-[#EF4444]">Action required</p>
          </div>
        </div>
      </div>

      {/* Timecards Table */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden mt-6">
        <div className="p-5 border-b border-[#1F1F28] flex justify-between items-center bg-[#0D0D12]">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <FileClock className="w-5 h-5 text-neutral-400" /> Daily Timecards
          </h2>
          <div className="text-sm text-neutral-400 bg-[#1C1C24] px-3 py-1.5 rounded-md border border-[#2D2D3A]">
            Date: <strong>March 15, 2026</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0E] border-b border-[#1F1F28]">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Status / Issues
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28]">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`transition-colors group ${
                    editingId === entry.id
                      ? "bg-[#1A1A24] ring-1 ring-inset ring-white/10"
                      : "hover:bg-[#1A1A22]"
                  }`}
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {entry.employeeName}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {entry.role}
                    </div>
                  </td>

                  {/* Clock In */}
                  <td className="px-6 py-4">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editClockIn}
                        onChange={(e) => setEditClockIn(e.target.value)}
                        placeholder="08:00 AM"
                        className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-3 py-1.5 text-sm font-mono text-white w-28 focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                    ) : (
                      <div className="text-sm font-mono text-neutral-300">
                        {entry.clockIn}
                      </div>
                    )}
                  </td>

                  {/* Clock Out */}
                  <td className="px-6 py-4">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editClockOut}
                        onChange={(e) => setEditClockOut(e.target.value)}
                        placeholder="05:00 PM"
                        className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-3 py-1.5 text-sm font-mono text-white w-28 focus:outline-none focus:ring-1 focus:ring-white/30"
                      />
                    ) : (
                      <div className="text-sm font-mono text-neutral-300">
                        {entry.clockOut}
                      </div>
                    )}
                  </td>

                  {/* Hours */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-300 font-semibold">
                      {entry.totalHours > 0 ? entry.totalHours : "--"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {entry.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {entry.status === "flagged" && (
                      <div className="flex flex-col gap-1.5 items-start">
                        {entry.issues.map((issue, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                    {entry.status === "pending" && (
                      <div className="flex flex-col gap-1.5 items-start">
                        {entry.issues.map((issue, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444]"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {editingId === entry.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(entry.id)}
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
                        {entry.status !== "approved" && (
                          <button
                            onClick={() => handleApproveSingle(entry.id)}
                            title="Approve this entry"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors font-medium opacity-0 group-hover:opacity-100"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                          Edit <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
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
