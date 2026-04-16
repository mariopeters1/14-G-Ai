"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Download,
  Calculator,
  Settings2,
  Edit3,
  Save,
  X,
  Trash2,
  Plus,
  RefreshCw,
  Users,
  Clock,
  Percent,
  ArrowRight,
  Zap,
  PieChart,
  FileSpreadsheet,
  Timer,
  UserCheck,
  UserMinus,
  Receipt,
  BadgeDollarSign,
  CircleDot,
  Printer,
  AlertTriangle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

type PoolStatus = "calculated" | "pending_review" | "finalized";

interface Allocation {
  employeeName: string;
  role: string;
  hours: number;
  points: number;
  amount: number;
}

interface TipPool {
  id: string;
  date: string;
  poolName: string;
  totalAmount: number;
  totalHours: number;
  status: PoolStatus;
  allocations: Allocation[];
}

// ─── Tip Splitter Types ─────────────────────────────────────────

interface ShiftEntry {
  id: string;
  shiftName: string;
  totalTips: number;
}

interface EmployeeShiftHours {
  [shiftId: string]: number;
}

interface SplitterEmployee {
  id: string;
  name: string;
  role: string;
  shiftHours: EmployeeShiftHours;
  scheduledIn?: string;
  scheduledOut?: string;
  actualOut?: string;
  note?: string;
}

interface SplitterResult {
  employeeName: string;
  role: string;
  shiftBreakdown: { shiftName: string; hours: number; share: number }[];
  totalHours: number;
  totalShare: number;
}

// ─── Temp Worker Instant Payout Types ───────────────────────────

interface HourlyTipEntry {
  id: string;
  hour: string;        // display label, e.g. "5:00 PM"
  hourIndex: number;   // 0-based index for ordering
  amount: number;
}

type TempWorkerStatus = "working" | "clocked-out" | "paid";

interface TempWorker {
  id: string;
  name: string;
  role: string;
  clockIn: string;     // hour label, e.g. "3:00 PM"
  clockInIdx: number;  // index into hourly entries
  clockOut: string | null;
  clockOutIdx: number | null;
  status: TempWorkerStatus;
  paidAt?: string;
}

interface TempPayoutResult {
  workerId: string;
  workerName: string;
  role: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  hourlyBreakdown: { hour: string; tipsDuringHour: number; workersPresent: number; share: number }[];
  totalPayout: number;
}

// ─── Initial Data ───────────────────────────────────────────────

const initialPools: TipPool[] = [
  {
    id: "TP-001",
    date: "2026-03-15",
    poolName: "AM Bar Tip Pool",
    totalAmount: 450.0,
    totalHours: 24,
    status: "calculated",
    allocations: [
      { employeeName: "Sophia Lin", role: "Sommelier", hours: 8, points: 1.0, amount: 150.0 },
      { employeeName: "Oliver Chen", role: "Bartender", hours: 8, points: 1.0, amount: 150.0 },
      { employeeName: "Emma Davis", role: "Barback", hours: 8, points: 1.0, amount: 150.0 },
    ],
  },
  {
    id: "TP-002",
    date: "2026-03-15",
    poolName: "PM Dining Room Pool",
    totalAmount: 2150.75,
    totalHours: 55,
    status: "pending_review",
    allocations: [
      { employeeName: "Mia Rodriguez", role: "Server", hours: 8, points: 2.0, amount: 469.25 },
      { employeeName: "Liam Johnson", role: "Server", hours: 8, points: 2.0, amount: 469.25 },
      { employeeName: "Noah Williams", role: "Food Runner", hours: 8, points: 1.0, amount: 234.62 },
      { employeeName: "Ava Brown", role: "Busser", hours: 8, points: 1.0, amount: 234.63 },
      { employeeName: "James Garcia", role: "Host", hours: 6, points: 0.5, amount: 88.0 },
    ],
  },
  {
    id: "TP-003",
    date: "2026-03-15",
    poolName: "Brunch Service Charge",
    totalAmount: 680.0,
    totalHours: 32,
    status: "finalized",
    allocations: [
      { employeeName: "Mia Rodriguez", role: "Server", hours: 8, points: 2.0, amount: 226.67 },
      { employeeName: "Noah Williams", role: "Food Runner", hours: 8, points: 1.0, amount: 113.33 },
      { employeeName: "Ava Brown", role: "Busser", hours: 8, points: 1.0, amount: 113.33 },
      { employeeName: "James Garcia", role: "Host", hours: 8, points: 1.0, amount: 113.33 },
      { employeeName: "Emma Davis", role: "Barback", hours: 0, points: 0.5, amount: 113.34 },
    ],
  },
];

// ─── Tip Splitter Initial Data ──────────────────────────────────
// SCENARIO: Saturday dinner service at a high-volume restaurant.
// 4 bartenders/servers with staggered start times.
// Two are CUT EARLY before the dinner rush peaks, two stay through close.
// The shifts reflect when tips are actually earned — dinner rush is the
// biggest window. This demonstrates why hours-based proportional sharing
// is the fairest method.

const initialShifts: ShiftEntry[] = [
  { id: "shift-1", shiftName: "Lunch Tail (11AM–3PM)",  totalTips: 210.00 },
  { id: "shift-2", shiftName: "Happy Hour (3PM–6PM)",   totalTips: 385.00 },
  { id: "shift-3", shiftName: "Dinner Rush (6PM–10PM)", totalTips: 1475.00 },
  { id: "shift-4", shiftName: "Late Night (10PM–1AM)",  totalTips: 430.00 },
];

const initialSplitterEmployees: SplitterEmployee[] = [
  // Sofia: Full closer — opened at 11AM, stays until 1AM close.
  // Works every shift. Earns the most because she was present for all tip windows.
  {
    id: "se-1", name: "Sofia Reyes", role: "Bartender",
    shiftHours: { "shift-1": 4, "shift-2": 3, "shift-3": 4, "shift-4": 3 },
    scheduledIn: "11:00 AM", scheduledOut: "1:00 AM", actualOut: "1:00 AM",
    note: "Full closer — 14 hours",
  },
  // Marcus: Scheduled 3PM–close but CUT EARLY at 8:30PM.
  // Misses the biggest part of dinner rush and all of late night.
  {
    id: "se-2", name: "Marcus Webb", role: "Server",
    shiftHours: { "shift-1": 0, "shift-2": 3, "shift-3": 2.5, "shift-4": 0 },
    scheduledIn: "3:00 PM", scheduledOut: "1:00 AM", actualOut: "8:30 PM",
    note: "Cut early — slow section",
  },
  // Priya: Scheduled 5PM–close but CUT at 9PM.
  // Gets only 3 hours of the dinner rush, misses the late night entirely.
  {
    id: "se-3", name: "Priya Naidu", role: "Bartender",
    shiftHours: { "shift-1": 0, "shift-2": 1, "shift-3": 3, "shift-4": 0 },
    scheduledIn: "5:00 PM", scheduledOut: "1:00 AM", actualOut: "9:00 PM",
    note: "Cut early — overstaffed bar",
  },
  // Diego: Evening closer — comes in at 5PM, stays until 1AM close.
  // Catches the full dinner rush and all of late night.
  {
    id: "se-4", name: "Diego Fuentes", role: "Server",
    shiftHours: { "shift-1": 0, "shift-2": 1, "shift-3": 4, "shift-4": 3 },
    scheduledIn: "5:00 PM", scheduledOut: "1:00 AM", actualOut: "1:00 AM",
    note: "Evening closer — 8 hours",
  },
];

// ─── Temp Worker Instant Payout Initial Data ────────────────────
// SCENARIO: Saturday night service. Tips are logged hour-by-hour.
// 4 temp workers with staggered clock-in/out times.
// Two temps are cut early — their payout is calculated precisely
// based on which hours they were present and the tips earned.

const SERVICE_HOURS = [
  "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM",
];

const initialHourlyTips: HourlyTipEntry[] = [
  { id: "h-0",  hour: "11:00 AM", hourIndex: 0,  amount: 35 },
  { id: "h-1",  hour: "12:00 PM", hourIndex: 1,  amount: 78 },
  { id: "h-2",  hour: "1:00 PM",  hourIndex: 2,  amount: 92 },
  { id: "h-3",  hour: "2:00 PM",  hourIndex: 3,  amount: 45 },
  { id: "h-4",  hour: "3:00 PM",  hourIndex: 4,  amount: 62 },
  { id: "h-5",  hour: "4:00 PM",  hourIndex: 5,  amount: 88 },
  { id: "h-6",  hour: "5:00 PM",  hourIndex: 6,  amount: 145 },
  { id: "h-7",  hour: "6:00 PM",  hourIndex: 7,  amount: 210 },
  { id: "h-8",  hour: "7:00 PM",  hourIndex: 8,  amount: 285 },
  { id: "h-9",  hour: "8:00 PM",  hourIndex: 9,  amount: 320 },
  { id: "h-10", hour: "9:00 PM",  hourIndex: 10, amount: 245 },
  { id: "h-11", hour: "10:00 PM", hourIndex: 11, amount: 175 },
  { id: "h-12", hour: "11:00 PM", hourIndex: 12, amount: 130 },
  { id: "h-13", hour: "12:00 AM", hourIndex: 13, amount: 90 },
];

const initialTempWorkers: TempWorker[] = [
  // Ella: Full day temp, 11AM – 12AM (all hours)
  {
    id: "tw-1", name: "Ella Martínez", role: "Server",
    clockIn: "11:00 AM", clockInIdx: 0,
    clockOut: "12:00 AM", clockOutIdx: 13,
    status: "clocked-out",
  },
  // Jamal: Came in for dinner, 4PM – cut at 9PM
  {
    id: "tw-2", name: "Jamal Carter", role: "Bartender",
    clockIn: "4:00 PM", clockInIdx: 5,
    clockOut: "9:00 PM", clockOutIdx: 9,
    status: "clocked-out",
  },
  // Rina: Evening shift, 6PM – cut at 10PM
  {
    id: "tw-3", name: "Rina Patel", role: "Server",
    clockIn: "6:00 PM", clockInIdx: 7,
    clockOut: "10:00 PM", clockOutIdx: 11,
    status: "clocked-out",
  },
  // Tyler: Late closer, 8PM – 12AM close
  {
    id: "tw-4", name: "Tyler Kim", role: "Bartender",
    clockIn: "8:00 PM", clockInIdx: 9,
    clockOut: "12:00 AM", clockOutIdx: 13,
    status: "clocked-out",
  },
];

// ─── Component ──────────────────────────────────────────────────

export default function TipsPage() {
  const [pools, setPools] = useState<TipPool[]>(initialPools);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["TP-001"]));
  const [editingAlloc, setEditingAlloc] = useState<{ poolId: string; idx: number } | null>(null);
  const [editPoints, setEditPoints] = useState("");
  const [editHours, setEditHours] = useState("");
  const [filterStatus, setFilterStatus] = useState<PoolStatus | "all">("all");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");
  const [calculating, setCalculating] = useState(false);

  // ─── Tip Splitter State ──────────────────────────────────────

  const [splitterOpen, setSplitterOpen] = useState(false);
  const [shifts, setShifts] = useState<ShiftEntry[]>(initialShifts);
  const [splitterEmployees, setSplitterEmployees] = useState<SplitterEmployee[]>(initialSplitterEmployees);
  const [splitterResults, setSplitterResults] = useState<SplitterResult[] | null>(null);
  const [splitterCalculated, setSplitterCalculated] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");

  // ─── Temp Worker Instant Payout State ────────────────────────

  const [tempPayoutOpen, setTempPayoutOpen] = useState(false);
  const [hourlyTips, setHourlyTips] = useState<HourlyTipEntry[]>(initialHourlyTips);
  const [tempWorkers, setTempWorkers] = useState<TempWorker[]>(initialTempWorkers);
  const [tempPayoutResults, setTempPayoutResults] = useState<TempPayoutResult[] | null>(null);
  const [tempCalculated, setTempCalculated] = useState(false);
  const [newTempName, setNewTempName] = useState("");
  const [newTempRole, setNewTempRole] = useState("");
  const [newTempClockIn, setNewTempClockIn] = useState("11:00 AM");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // ─── Derived KPIs ─────────────────────────────────────────────

  const pendingPools = pools.filter((p) => p.status === "pending_review");
  const unallocatedTips = pendingPools.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalServiceCharge = pools.reduce((sum, p) => sum + p.totalAmount, 0);
  const poolsFinalized = pools.filter((p) => p.status === "finalized").length;
  const totalEmployees = new Set(pools.flatMap((p) => p.allocations.map((a) => a.employeeName))).size;
  const totalDistributed = pools
    .filter((p) => p.status === "finalized" || p.status === "calculated")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Pool Actions ────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const recalculatePool = (poolId: string) => {
    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id !== poolId) return pool;
        const totalPoints = pool.allocations.reduce((s, a) => s + a.points * a.hours, 0);
        if (totalPoints === 0) return pool;
        const newAllocations = pool.allocations.map((a) => ({
          ...a,
          amount: Math.round(((a.points * a.hours) / totalPoints) * pool.totalAmount * 100) / 100,
        }));
        return { ...pool, allocations: newAllocations, status: "calculated" as PoolStatus };
      })
    );
  };

  const handleCalculatePayouts = () => {
    setCalculating(true);
    setTimeout(() => {
      pools.forEach((pool) => {
        if (pool.status === "pending_review") {
          recalculatePool(pool.id);
        }
      });
      // Force a state update after all recalculations
      setPools((prev) =>
        prev.map((pool) => {
          if (pool.status !== "pending_review") return pool;
          const totalPoints = pool.allocations.reduce((s, a) => s + a.points * a.hours, 0);
          if (totalPoints === 0) return pool;
          const newAllocations = pool.allocations.map((a) => ({
            ...a,
            amount: Math.round(((a.points * a.hours) / totalPoints) * pool.totalAmount * 100) / 100,
          }));
          return { ...pool, allocations: newAllocations, status: "calculated" as PoolStatus };
        })
      );
      setCalculating(false);
      showToast("All pending pools calculated successfully.");
    }, 1200);
  };

  const handleFinalizePool = (poolId: string) => {
    setPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, status: "finalized" as PoolStatus } : p))
    );
    showToast("Pool finalized and locked.");
  };

  const handleReopenPool = (poolId: string) => {
    setPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, status: "pending_review" as PoolStatus } : p))
    );
    showToast("Pool reopened for review.", "info");
  };

  const handleStartEditAlloc = (poolId: string, idx: number) => {
    const pool = pools.find((p) => p.id === poolId);
    if (!pool) return;
    const alloc = pool.allocations[idx];
    setEditingAlloc({ poolId, idx });
    setEditPoints(String(alloc.points));
    setEditHours(String(alloc.hours));
  };

  const handleSaveAlloc = () => {
    if (!editingAlloc) return;
    const { poolId, idx } = editingAlloc;
    const newPoints = parseFloat(editPoints) || 0;
    const newHours = parseFloat(editHours) || 0;

    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id !== poolId) return pool;
        const updated = [...pool.allocations];
        updated[idx] = { ...updated[idx], points: newPoints, hours: newHours };
        // Recalculate all amounts
        const totalWeighted = updated.reduce((s, a) => s + a.points * a.hours, 0);
        if (totalWeighted > 0) {
          updated.forEach((a, i) => {
            updated[i] = {
              ...a,
              amount: Math.round(((a.points * a.hours) / totalWeighted) * pool.totalAmount * 100) / 100,
            };
          });
        }
        return { ...pool, allocations: updated, status: "calculated" as PoolStatus };
      })
    );
    setEditingAlloc(null);
    showToast("Allocation updated and recalculated.");
  };

  const handleRemoveAlloc = (poolId: string, idx: number) => {
    setPools((prev) =>
      prev.map((pool) => {
        if (pool.id !== poolId) return pool;
        const updated = pool.allocations.filter((_, i) => i !== idx);
        // Recalculate
        const totalWeighted = updated.reduce((s, a) => s + a.points * a.hours, 0);
        if (totalWeighted > 0) {
          updated.forEach((a, i) => {
            updated[i] = {
              ...a,
              amount: Math.round(((a.points * a.hours) / totalWeighted) * pool.totalAmount * 100) / 100,
            };
          });
        }
        return { ...pool, allocations: updated, totalHours: updated.reduce((s, a) => s + a.hours, 0) };
      })
    );
    showToast("Employee removed from pool.", "info");
  };

  const handleExport = () => {
    const headers = ["Pool", "Employee", "Role", "Hours", "Points", "Amount", "Pool Status"];
    const rows = pools.flatMap((p) =>
      p.allocations.map((a) => [
        p.poolName, a.employeeName, a.role,
        String(a.hours), String(a.points),
        `$${a.amount.toFixed(2)}`, p.status,
      ])
    );
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tip-allocations.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Tip allocations exported as CSV.", "info");
  };

  // ─── Tip Splitter Logic ───────────────────────────────────────

  const handleAddShift = () => {
    const newId = `shift-${Date.now()}`;
    setShifts((prev) => [...prev, { id: newId, shiftName: `Shift ${prev.length + 1}`, totalTips: 0 }]);
    // Add the shift to all existing employees
    setSplitterEmployees((prev) =>
      prev.map((emp) => ({
        ...emp,
        shiftHours: { ...emp.shiftHours, [newId]: 0 },
      }))
    );
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const handleRemoveShift = (shiftId: string) => {
    if (shifts.length <= 1) return;
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    setSplitterEmployees((prev) =>
      prev.map((emp) => {
        const { [shiftId]: _, ...rest } = emp.shiftHours;
        return { ...emp, shiftHours: rest };
      })
    );
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const handleUpdateShift = (shiftId: string, field: "shiftName" | "totalTips", value: string) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? { ...s, [field]: field === "totalTips" ? parseFloat(value) || 0 : value }
          : s
      )
    );
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const handleAddSplitterEmployee = () => {
    if (!newEmpName.trim()) return;
    const newId = `se-${Date.now()}`;
    const shiftHours: EmployeeShiftHours = {};
    shifts.forEach((s) => {
      shiftHours[s.id] = 0;
    });
    setSplitterEmployees((prev) => [
      ...prev,
      { id: newId, name: newEmpName.trim(), role: newEmpRole.trim() || "Staff", shiftHours },
    ]);
    setNewEmpName("");
    setNewEmpRole("");
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const handleRemoveSplitterEmployee = (empId: string) => {
    setSplitterEmployees((prev) => prev.filter((e) => e.id !== empId));
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const handleUpdateEmployeeHours = (empId: string, shiftId: string, value: string) => {
    const hours = parseFloat(value) || 0;
    setSplitterEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? { ...emp, shiftHours: { ...emp.shiftHours, [shiftId]: hours } }
          : emp
      )
    );
    setSplitterCalculated(false);
    setSplitterResults(null);
  };

  const calculateTipSplit = useCallback(() => {
    const results: SplitterResult[] = splitterEmployees.map((emp) => {
      const shiftBreakdown = shifts.map((shift) => {
        const empHours = emp.shiftHours[shift.id] || 0;
        // Total hours across all employees for this shift
        const totalShiftHours = splitterEmployees.reduce(
          (sum, e) => sum + (e.shiftHours[shift.id] || 0),
          0
        );
        const share =
          totalShiftHours > 0
            ? Math.round(((empHours / totalShiftHours) * shift.totalTips) * 100) / 100
            : 0;
        return { shiftName: shift.shiftName, hours: empHours, share };
      });

      const totalHours = shiftBreakdown.reduce((s, sb) => s + sb.hours, 0);
      const totalShare = shiftBreakdown.reduce((s, sb) => s + sb.share, 0);

      return {
        employeeName: emp.name,
        role: emp.role,
        shiftBreakdown,
        totalHours,
        totalShare,
      };
    });

    setSplitterResults(results);
    setSplitterCalculated(true);
  }, [shifts, splitterEmployees]);

  const handleExportSplitterCSV = () => {
    if (!splitterResults) return;
    const headers = ["Employee", "Role", ...shifts.map((s) => `${s.shiftName} (Hours)`), ...shifts.map((s) => `${s.shiftName} (Share)`), "Total Hours", "Total Share"];
    const rows = splitterResults.map((r) => [
      r.employeeName,
      r.role,
      ...r.shiftBreakdown.map((sb) => String(sb.hours)),
      ...r.shiftBreakdown.map((sb) => `$${sb.share.toFixed(2)}`),
      String(r.totalHours),
      `$${r.totalShare.toFixed(2)}`,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tip-split-results.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Tip split results exported as CSV.", "info");
  };

  // Splitter derived values
  const splitterTotalTips = shifts.reduce((s, sh) => s + sh.totalTips, 0);
  const splitterTotalHours = splitterEmployees.reduce(
    (sum, emp) => sum + Object.values(emp.shiftHours).reduce((s, h) => s + h, 0),
    0
  );

  // ─── Temp Worker Instant Payout Logic ─────────────────────────

  const tempTotalTips = hourlyTips.reduce((s, h) => s + h.amount, 0);
  const tempWorkersActive = tempWorkers.filter(w => w.status === "working").length;
  const tempWorkersReady = tempWorkers.filter(w => w.status === "clocked-out").length;
  const tempWorkersPaid = tempWorkers.filter(w => w.status === "paid").length;

  const handleUpdateHourlyTip = useCallback((id: string, amount: number) => {
    setHourlyTips(prev => prev.map(h => h.id === id ? { ...h, amount } : h));
    setTempCalculated(false);
    setTempPayoutResults(null);
  }, []);

  const handleAddTempWorker = useCallback(() => {
    if (!newTempName.trim()) return;
    const clockInIdx = SERVICE_HOURS.indexOf(newTempClockIn);
    if (clockInIdx === -1) return;
    const newWorker: TempWorker = {
      id: `tw-${Date.now()}`,
      name: newTempName.trim(),
      role: newTempRole.trim() || "Server",
      clockIn: newTempClockIn,
      clockInIdx,
      clockOut: null,
      clockOutIdx: null,
      status: "working",
    };
    setTempWorkers(prev => [...prev, newWorker]);
    setNewTempName("");
    setNewTempRole("");
    setTempCalculated(false);
    setTempPayoutResults(null);
  }, [newTempName, newTempRole, newTempClockIn]);

  const handleClockOutTemp = useCallback((workerId: string, clockOutHour: string) => {
    const outIdx = SERVICE_HOURS.indexOf(clockOutHour);
    if (outIdx === -1) return;
    setTempWorkers(prev => prev.map(w =>
      w.id === workerId ? { ...w, clockOut: clockOutHour, clockOutIdx: outIdx, status: "clocked-out" as TempWorkerStatus } : w
    ));
    setTempCalculated(false);
    setTempPayoutResults(null);
  }, []);

  const handleRemoveTempWorker = useCallback((workerId: string) => {
    setTempWorkers(prev => prev.filter(w => w.id !== workerId));
    setTempCalculated(false);
    setTempPayoutResults(null);
  }, []);

  const calculateTempPayouts = useCallback(() => {
    const results: TempPayoutResult[] = tempWorkers
      .filter(w => w.clockOut !== null)
      .map(worker => {
        const startIdx = worker.clockInIdx;
        const endIdx = worker.clockOutIdx!;
        const hourlyBreakdown: TempPayoutResult["hourlyBreakdown"] = [];
        let totalPayout = 0;

        for (let i = startIdx; i <= endIdx; i++) {
          const hourEntry = hourlyTips.find(h => h.hourIndex === i);
          if (!hourEntry) continue;

          // Count how many workers were present during this hour
          const workersPresent = tempWorkers.filter(w => {
            if (w.clockOut === null && w.status === "working") {
              // Still working — present from clockIn to current max hour
              return w.clockInIdx <= i;
            }
            return w.clockInIdx <= i && (w.clockOutIdx ?? 999) >= i;
          }).length;

          const share = workersPresent > 0 ? hourEntry.amount / workersPresent : 0;
          totalPayout += share;

          hourlyBreakdown.push({
            hour: hourEntry.hour,
            tipsDuringHour: hourEntry.amount,
            workersPresent,
            share,
          });
        }

        return {
          workerId: worker.id,
          workerName: worker.name,
          role: worker.role,
          clockIn: worker.clockIn,
          clockOut: worker.clockOut!,
          hoursWorked: endIdx - startIdx + 1,
          hourlyBreakdown,
          totalPayout,
        };
      });

    setTempPayoutResults(results);
    setTempCalculated(true);
  }, [hourlyTips, tempWorkers]);

  const handleMarkAsPaid = useCallback((workerId: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setTempWorkers(prev => prev.map(w =>
      w.id === workerId ? { ...w, status: "paid" as TempWorkerStatus, paidAt: now } : w
    ));
    showToast("Worker marked as paid. Payout receipt generated.", "success");
  }, []);

  const handleExportTempCSV = useCallback(() => {
    if (!tempPayoutResults) return;
    const headers = ["Employee", "Role", "Clock In", "Clock Out", "Hours", "Total Payout"];
    const rows = tempPayoutResults.map(r => [
      r.workerName, r.role, r.clockIn, r.clockOut, String(r.hoursWorked), `$${r.totalPayout.toFixed(2)}`
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "temp-worker-payouts.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Temp worker payouts exported as CSV.", "info");
  }, [tempPayoutResults]);

  // ─── Filtering ────────────────────────────────────────────────

  const displayPools = filterStatus === "all" ? pools : pools.filter((p) => p.status === filterStatus);

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Rules Configuration Modal */}
      {rulesOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setRulesOpen(false)}>
          <div
            className="bg-[#111116] border border-[#2D2D3A] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-neutral-400" /> Pool Rules Configuration
              </h2>
              <button onClick={() => setRulesOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="p-4 bg-[#0D0D12] rounded-xl border border-[#1F1F28]">
                <label className="text-sm text-neutral-400 font-medium block mb-2">Default Point System</label>
                <div className="space-y-2 text-sm text-neutral-300">
                  <div className="flex justify-between"><span>Server</span><span className="font-mono text-white">2.0 pts</span></div>
                  <div className="flex justify-between"><span>Bartender</span><span className="font-mono text-white">1.5 pts</span></div>
                  <div className="flex justify-between"><span>Food Runner</span><span className="font-mono text-white">1.0 pts</span></div>
                  <div className="flex justify-between"><span>Busser</span><span className="font-mono text-white">1.0 pts</span></div>
                  <div className="flex justify-between"><span>Barback</span><span className="font-mono text-white">0.5 pts</span></div>
                  <div className="flex justify-between"><span>Host</span><span className="font-mono text-white">0.5 pts</span></div>
                </div>
              </div>
              <div className="p-4 bg-[#0D0D12] rounded-xl border border-[#1F1F28]">
                <label className="text-sm text-neutral-400 font-medium block mb-2">Service Charge Split</label>
                <div className="text-sm text-neutral-300 space-y-2">
                  <div className="flex justify-between"><span>FOH Pool</span><span className="font-mono text-white">70%</span></div>
                  <div className="flex justify-between"><span>BOH Pool</span><span className="font-mono text-white">20%</span></div>
                  <div className="flex justify-between"><span>Management</span><span className="font-mono text-white">10%</span></div>
                </div>
              </div>
              <div className="p-4 bg-[#0D0D12] rounded-xl border border-[#1F1F28]">
                <label className="text-sm text-neutral-400 font-medium block mb-2">Distribution Method</label>
                <div className="text-sm text-white font-medium">Points × Hours Weighted</div>
                <div className="text-xs text-neutral-500 mt-1">Amount = (Employee Points × Hours) / Σ(All Points × Hours) × Pool Total</div>
              </div>
            </div>
            <button
              onClick={() => setRulesOpen(false)}
              className="mt-6 w-full py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TIP SPLITTER MODAL
          ═══════════════════════════════════════════════════════════ */}
      {splitterOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-start justify-center overflow-y-auto py-8" onClick={() => setSplitterOpen(false)}>
          <div
            className="bg-[#0D0D12] border border-[#2D2D3A] rounded-2xl w-full max-w-6xl mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Splitter Header */}
            <div className="p-6 border-b border-[#1F1F28] bg-gradient-to-r from-[#111116] to-[#0D0D12]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">Shift-Based Tip Splitter</h2>
                    <p className="text-sm text-neutral-400 mt-0.5">Divide tips proportionally by hours worked across multiple shifts</p>
                  </div>
                </div>
                <button onClick={() => setSplitterOpen(false)} className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scenario Narrative */}
              <div className="mt-5 p-4 bg-gradient-to-r from-[#8B5CF6]/5 to-[#6D28D9]/5 border border-[#8B5CF6]/15 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#A78BFA] mb-1">Saturday Dinner Service — Real-World Scenario</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      4 staff with different start times. <span className="text-[#F59E0B]">Marcus was cut at 8:30 PM</span> (slow section) and{" "}
                      <span className="text-[#F59E0B]">Priya was cut at 9:00 PM</span> (overstaffed bar) — both{" "}
                      <span className="text-white">miss the peak dinner rush tips ($1,475)</span> and late-night earnings.
                      Sofia (full closer, 14 hrs) and Diego (evening closer, 8 hrs) stay through close and earn proportionally more
                      because they were working when the biggest tips were earned.
                    </p>
                  </div>
                </div>
              </div>

              {/* Splitter KPIs */}
              <div className="grid grid-cols-4 gap-4 mt-5">
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total Tips</span>
                  </div>
                  <div className="text-2xl font-light text-white">
                    ${splitterTotalTips.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total Hours</span>
                  </div>
                  <div className="text-2xl font-light text-white">{splitterTotalHours.toFixed(1)}</div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Staff × Shifts</span>
                  </div>
                  <div className="text-2xl font-light text-white">
                    {splitterEmployees.length} × {shifts.length}
                  </div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Cut Early</span>
                  </div>
                  <div className="text-2xl font-light text-[#F59E0B]">
                    {splitterEmployees.filter(e => e.note?.toLowerCase().includes("cut")).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Splitter Body */}
            <div className="p-6 space-y-6">
              {/* ── Step 1: Shifts Configuration ──────────────── */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold">1</span>
                    Define Shifts &amp; Enter Total Tips
                  </h3>
                  <button
                    onClick={handleAddShift}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors font-medium border border-[#8B5CF6]/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Shift
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="bg-[#111116] border border-[#1F1F28] rounded-xl p-4 group relative">
                      {shifts.length > 1 && (
                        <button
                          onClick={() => handleRemoveShift(shift.id)}
                          className="absolute top-2 right-2 p-1 rounded-md text-neutral-600 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input
                        type="text"
                        value={shift.shiftName}
                        onChange={(e) => handleUpdateShift(shift.id, "shiftName", e.target.value)}
                        className="w-full bg-transparent text-white text-sm font-medium mb-3 border-b border-[#2D2D3A] pb-2 focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
                        placeholder="Shift name..."
                      />
                      <label className="text-xs text-neutral-500 block mb-1.5">Total Tips ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shift.totalTips || ""}
                        onChange={(e) => handleUpdateShift(shift.id, "totalTips", e.target.value)}
                        className="w-full bg-[#0A0A0E] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm font-mono text-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6]/40 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step 2: Employees & Hours Matrix ─────────── */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-bold">2</span>
                    Enter Employee Hours Per Shift
                  </h3>
                </div>

                {/* Hours Matrix Table */}
                <div className="bg-[#111116] border border-[#1F1F28] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-[#2D2D3A] bg-[#0A0A0E]">
                          <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider w-40">Employee</th>
                          <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider w-28">Role</th>
                          {shifts.map((s) => (
                            <th key={s.id} className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center min-w-[100px]">
                              <div className="truncate">{s.shiftName}</div>
                              <div className="text-[10px] text-[#10B981] font-mono mt-0.5">${s.totalTips.toFixed(2)}</div>
                            </th>
                          ))}
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-400 tracking-wider text-center">Total Hrs</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-right w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F28]/50">
                        {splitterEmployees.map((emp) => {
                          const empTotalHours = Object.values(emp.shiftHours).reduce((s, h) => s + h, 0);
                          return (
                            <tr key={emp.id} className="group hover:bg-[#1A1A22]/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="text-sm text-white font-medium">{emp.name}</div>
                                {emp.scheduledIn && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] text-neutral-600 font-mono">{emp.scheduledIn}–{emp.actualOut || emp.scheduledOut}</span>
                                    {emp.note?.toLowerCase().includes("cut") && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/20">Cut Early</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-400">{emp.role}</td>
                              {shifts.map((shift) => (
                                <td key={shift.id} className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={emp.shiftHours[shift.id] || ""}
                                    onChange={(e) => handleUpdateEmployeeHours(emp.id, shift.id, e.target.value)}
                                    className="w-16 mx-auto bg-[#0A0A0E] border border-[#2D2D3A] rounded-md px-2 py-1.5 text-sm font-mono text-white text-center focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6]/40 transition-all"
                                    placeholder="0"
                                  />
                                </td>
                              ))}
                              <td className="py-3 px-3 text-center">
                                <span className={`text-sm font-mono font-medium ${empTotalHours > 0 ? "text-white" : "text-neutral-600"}`}>
                                  {empTotalHours.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleRemoveSplitterEmployee(emp.id)}
                                  className="p-1 rounded-md text-neutral-600 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove employee"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Shift Totals Row */}
                      <tfoot>
                        <tr className="border-t border-[#2D2D3A] bg-[#0A0A0E]">
                          <td className="py-3 px-4 text-xs font-semibold text-neutral-400 uppercase" colSpan={2}>
                            Shift Totals
                          </td>
                          {shifts.map((shift) => {
                            const shiftTotal = splitterEmployees.reduce((s, e) => s + (e.shiftHours[shift.id] || 0), 0);
                            return (
                              <td key={shift.id} className="py-3 px-3 text-center text-sm font-mono text-neutral-300 font-medium">
                                {shiftTotal.toFixed(1)} hrs
                              </td>
                            );
                          })}
                          <td className="py-3 px-3 text-center text-sm font-mono text-white font-bold">
                            {splitterTotalHours.toFixed(1)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Add Employee Row */}
                  <div className="border-t border-[#1F1F28] p-4 bg-[#0A0A0E] flex gap-3 items-center">
                    <input
                      type="text"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      placeholder="Employee name"
                      className="flex-1 bg-[#111116] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40"
                      onKeyDown={(e) => e.key === "Enter" && handleAddSplitterEmployee()}
                    />
                    <input
                      type="text"
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      placeholder="Role (optional)"
                      className="w-36 bg-[#111116] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40"
                      onKeyDown={(e) => e.key === "Enter" && handleAddSplitterEmployee()}
                    />
                    <button
                      onClick={handleAddSplitterEmployee}
                      disabled={!newEmpName.trim()}
                      className="inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors font-medium border border-[#3B82F6]/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Step 3: Calculate Button ─────────────────── */}
              <div className="flex justify-center py-2">
                <button
                  onClick={calculateTipSplit}
                  disabled={splitterEmployees.length === 0 || splitterTotalTips === 0}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white hover:from-[#7C3AED] hover:to-[#5B21B6] transition-all text-sm font-semibold shadow-lg shadow-[#8B5CF6]/25 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Zap className="w-4 h-4" />
                  Calculate Proportional Split
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* ── Step 3: Results ──────────────────────────── */}
              {splitterCalculated && splitterResults && (
                <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-bold">3</span>
                      Results — Each Employee&apos;s Share
                    </h3>
                    <button
                      onClick={handleExportSplitterCSV}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors font-medium border border-[#2D2D3A]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  <div className="bg-[#111116] border border-[#1F1F28] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-[#2D2D3A] bg-[#0A0A0E]">
                            <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider">Employee</th>
                            <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider">Role</th>
                            {shifts.map((s) => (
                              <th key={s.id} className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center">
                                {s.shiftName}
                              </th>
                            ))}
                            <th className="py-3 px-3 text-xs font-semibold text-neutral-400 tracking-wider text-center">Total Hrs</th>
                            <th className="py-3 px-3 text-xs font-semibold text-[#10B981] tracking-wider text-right">Daily Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F28]/50">
                          {splitterResults.map((result, idx) => (
                            <tr key={idx} className="hover:bg-[#1A1A22]/50 transition-colors">
                              <td className="py-3.5 px-4 text-sm text-white font-medium">{result.employeeName}</td>
                              <td className="py-3.5 px-4 text-sm text-neutral-400">{result.role}</td>
                              {result.shiftBreakdown.map((sb, i) => (
                                <td key={i} className="py-3.5 px-3 text-center">
                                  <div className="text-xs text-neutral-500">{sb.hours > 0 ? `${sb.hours}h` : "—"}</div>
                                  <div className={`text-sm font-mono font-medium ${sb.share > 0 ? "text-[#10B981]" : "text-neutral-700"}`}>
                                    {sb.share > 0 ? `$${sb.share.toFixed(2)}` : "—"}
                                  </div>
                                </td>
                              ))}
                              <td className="py-3.5 px-3 text-center text-sm font-mono text-neutral-300">
                                {result.totalHours.toFixed(1)}
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <span className="text-base font-semibold text-[#10B981] font-mono">
                                  ${result.totalShare.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-[#2D2D3A] bg-[#0A0A0E]">
                            <td className="py-3.5 px-4 text-sm font-semibold text-neutral-300" colSpan={2}>TOTAL</td>
                            {shifts.map((s) => {
                              const shiftTotal = splitterResults.reduce((sum, r) => sum + (r.shiftBreakdown.find((sb) => sb.shiftName === s.shiftName)?.share || 0), 0);
                              return (
                                <td key={s.id} className="py-3.5 px-3 text-center text-sm font-mono text-white font-bold">
                                  ${shiftTotal.toFixed(2)}
                                </td>
                              );
                            })}
                            <td className="py-3.5 px-3 text-center text-sm font-mono text-white font-bold">
                              {splitterResults.reduce((s, r) => s + r.totalHours, 0).toFixed(1)}
                            </td>
                            <td className="py-3.5 px-3 text-right text-base font-bold text-[#10B981] font-mono">
                              ${splitterResults.reduce((s, r) => s + r.totalShare, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>
                      Verified: Total distributed (${splitterResults.reduce((s, r) => s + r.totalShare, 0).toFixed(2)})
                      matches total tips (${splitterTotalTips.toFixed(2)})
                      {Math.abs(splitterResults.reduce((s, r) => s + r.totalShare, 0) - splitterTotalTips) < 0.02
                        ? " ✓"
                        : ` — rounding difference: $${Math.abs(splitterResults.reduce((s, r) => s + r.totalShare, 0) - splitterTotalTips).toFixed(2)}`}
                    </span>
                  </div>

                  {/* ── Insight Panel ───────────────────────────── */}
                  {(() => {
                    const sorted = [...splitterResults].sort((a, b) => b.totalShare - a.totalShare);
                    const highest = sorted[0];
                    const lowest = sorted[sorted.length - 1];
                    const cutEmployees = splitterEmployees.filter(e => e.note?.toLowerCase().includes("cut"));
                    const avgPerHour = splitterTotalTips / splitterTotalHours;
                    return (
                      <div className="mt-6 p-5 bg-gradient-to-r from-[#111116] to-[#0D0D12] border border-[#1F1F28] rounded-xl">
                        <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#8B5CF6]" />
                          Fairness Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Highest Earner */}
                          <div className="p-4 bg-[#10B981]/5 border border-[#10B981]/15 rounded-lg">
                            <div className="text-xs text-[#10B981] font-medium uppercase tracking-wider mb-2">Highest Earner</div>
                            <div className="text-lg text-white font-medium">{highest.employeeName}</div>
                            <div className="text-sm text-[#10B981] font-mono font-semibold">${highest.totalShare.toFixed(2)}</div>
                            <div className="text-xs text-neutral-500 mt-1">{highest.totalHours} hours • ${(highest.totalShare / highest.totalHours).toFixed(2)}/hr effective rate</div>
                          </div>
                          {/* Impact of Early Cuts */}
                          {cutEmployees.length > 0 && (
                            <div className="p-4 bg-[#F59E0B]/5 border border-[#F59E0B]/15 rounded-lg">
                              <div className="text-xs text-[#F59E0B] font-medium uppercase tracking-wider mb-2">Impact of Early Cuts</div>
                              {cutEmployees.map((ce) => {
                                const result = splitterResults.find(r => r.employeeName === ce.name);
                                if (!result) return null;
                                return (
                                  <div key={ce.id} className="mb-2 last:mb-0">
                                    <div className="text-sm text-white">{ce.name} <span className="text-neutral-500">({ce.note})</span></div>
                                    <div className="text-xs text-neutral-400">
                                      Earned <span className="text-[#F59E0B] font-mono font-medium">${result.totalShare.toFixed(2)}</span> for {result.totalHours}h
                                      {" "}• Would have earned ~<span className="text-neutral-300 font-mono">${(avgPerHour * (ce.scheduledOut === "1:00 AM" ? (parseInt(ce.scheduledIn?.split(":")[0] || "17") >= 12 ? 25 - parseInt(ce.scheduledIn?.split(":")[0] || "17") : 13 - parseInt(ce.scheduledIn?.split(":")[0] || "11")) : result.totalHours)).toFixed(2)}</span> if stayed
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {/* Average $/hour */}
                          <div className="p-4 bg-[#3B82F6]/5 border border-[#3B82F6]/15 rounded-lg">
                            <div className="text-xs text-[#3B82F6] font-medium uppercase tracking-wider mb-2">Avg Rate Across All Staff</div>
                            <div className="text-lg text-white font-mono font-semibold">${avgPerHour.toFixed(2)}<span className="text-sm text-neutral-400 font-sans">/hr</span></div>
                            <div className="text-xs text-neutral-500 mt-1">${splitterTotalTips.toFixed(2)} ÷ {splitterTotalHours} total hours</div>
                          </div>
                          {/* Why it's fair */}
                          <div className="p-4 bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 rounded-lg">
                            <div className="text-xs text-[#8B5CF6] font-medium uppercase tracking-wider mb-2">Why This Is Fair</div>
                            <div className="text-xs text-neutral-400 leading-relaxed">
                              Staff who worked during <span className="text-white">Dinner Rush ($1,475)</span> earned more per hour than those only present for
                              slower periods. Employees cut early receive their proportional share for hours <em>actually worked</em> — not hours <em>scheduled</em>.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Splitter Footer */}
            <div className="p-4 border-t border-[#1F1F28] bg-[#0A0A0E] rounded-b-2xl flex justify-between items-center">
              <p className="text-xs text-neutral-600">
                Formula: Employee Share = (Employee Hours ÷ Total Shift Hours) × Shift Tips
              </p>
              <button
                onClick={() => setSplitterOpen(false)}
                className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TEMP WORKER INSTANT PAYOUT MODAL
         ═══════════════════════════════════════════════════════════ */}
      {tempPayoutOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-start justify-center overflow-y-auto py-8">
          <div
            className="bg-[#0D0D12] border border-[#1F1F28] rounded-2xl max-w-6xl w-full mx-4 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#1F1F28] bg-gradient-to-r from-[#111116] to-[#0D0D12] flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-lg shadow-[#F59E0B]/20">
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">Temp Worker Instant Payout</h2>
                    <p className="text-sm text-neutral-400 mt-0.5">Track tips hour-by-hour and pay temps precisely for the hours they worked</p>
                  </div>
                </div>
                <button onClick={() => setTempPayoutOpen(false)} className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scenario Card */}
              <div className="mt-5 p-4 bg-gradient-to-r from-[#F59E0B]/5 to-[#D97706]/5 border border-[#F59E0B]/15 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BadgeDollarSign className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#FBBF24] mb-1">Hour-by-Hour Tip Tracking — Instant Payout</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Every hour&apos;s tips are logged as they come in. When a temp worker clocks out, the system divides each hour&apos;s tips
                      among <span className="text-white">only the workers who were present during that hour</span>.
                      Workers present during <span className="text-[#F59E0B]">high-tip hours (7–9 PM peak)</span> earn more per hour than those
                      working slower periods. This is the fairest possible payout — down to the hour.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4 mt-5">
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total Tips</span>
                  </div>
                  <div className="text-2xl font-light text-white">${tempTotalTips.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Hours Tracked</span>
                  </div>
                  <div className="text-2xl font-light text-white">{hourlyTips.length}</div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Temp Workers</span>
                  </div>
                  <div className="text-2xl font-light text-white">{tempWorkers.length}</div>
                </div>
                <div className="bg-[#1C1C24] border border-[#2D2D3A] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Paid Out</span>
                  </div>
                  <div className="text-2xl font-light text-[#10B981]">{tempWorkersPaid} / {tempWorkers.length}</div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8">

              {/* ── Step 1: Hourly Tip Log ────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold">1</span>
                  Hourly Tip Log — Tips Received Each Hour
                </h3>
                <div className="bg-[#111116] border border-[#1F1F28] rounded-xl p-4">
                  <div className="grid grid-cols-7 gap-3">
                    {hourlyTips.map((entry) => {
                      // Determine intensity for visual heat
                      const maxTip = Math.max(...hourlyTips.map(h => h.amount));
                      const intensity = maxTip > 0 ? entry.amount / maxTip : 0;
                      const isPeak = intensity > 0.7;
                      return (
                        <div
                          key={entry.id}
                          className={`relative rounded-lg border p-3 transition-all ${
                            isPeak
                              ? "border-[#F59E0B]/40 bg-[#F59E0B]/5"
                              : "border-[#2D2D3A] bg-[#0D0D12]"
                          }`}
                        >
                          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">{entry.hour}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-neutral-600 text-xs">$</span>
                            <input
                              type="number"
                              value={entry.amount}
                              onChange={(e) => handleUpdateHourlyTip(entry.id, parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent text-white text-lg font-mono font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          {isPeak && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <span className="text-[8px] font-bold uppercase bg-[#F59E0B] text-black px-1.5 py-0.5 rounded-full">Peak</span>
                            </div>
                          )}
                          {/* Heat bar */}
                          <div className="mt-2 h-1 rounded-full bg-[#1F1F28] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${intensity * 100}%`,
                                backgroundColor: isPeak ? "#F59E0B" : "#3B82F6",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Step 2: Temp Workers ──────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold">2</span>
                  Temp Workers — Clock In / Clock Out
                </h3>

                <div className="bg-[#111116] border border-[#1F1F28] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#2D2D3A] bg-[#0A0A0E]">
                          <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider">Employee</th>
                          <th className="py-3 px-4 text-xs font-semibold text-neutral-500 tracking-wider">Role</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center">Clock In</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center">Clock Out</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center">Hours</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center">Status</th>
                          <th className="py-3 px-3 text-xs font-semibold text-neutral-500 tracking-wider text-center w-20"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F28]/50">
                        {tempWorkers.map((worker) => {
                          const hours = worker.clockOutIdx !== null ? worker.clockOutIdx - worker.clockInIdx + 1 : null;
                          return (
                            <tr key={worker.id} className="group hover:bg-[#1A1A22]/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="text-sm text-white font-medium">{worker.name}</div>
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-400">{worker.role}</td>
                              <td className="py-3 px-3 text-center">
                                <span className="text-sm text-[#10B981] font-mono font-medium">{worker.clockIn}</span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {worker.clockOut ? (
                                  <span className="text-sm text-[#EF4444] font-mono font-medium">{worker.clockOut}</span>
                                ) : (
                                  <select
                                    className="bg-[#1C1C24] border border-[#2D2D3A] text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/50"
                                    onChange={(e) => handleClockOutTemp(worker.id, e.target.value)}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Clock out...</option>
                                    {SERVICE_HOURS.filter((_, i) => i > worker.clockInIdx).map(h => (
                                      <option key={h} value={h}>{h}</option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center text-sm font-mono text-neutral-300">
                                {hours !== null ? `${hours}h` : "—"}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {worker.status === "working" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full border border-[#10B981]/20">
                                    <CircleDot className="w-2.5 h-2.5 animate-pulse" /> Working
                                  </span>
                                )}
                                {worker.status === "clocked-out" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded-full border border-[#F59E0B]/20">
                                    <UserMinus className="w-2.5 h-2.5" /> Clocked Out
                                  </span>
                                )}
                                {worker.status === "paid" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-1 rounded-full border border-[#8B5CF6]/20">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Paid {worker.paidAt}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleRemoveTempWorker(worker.id)}
                                  className="text-neutral-600 hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Temp Worker */}
                  <div className="p-3 border-t border-[#1F1F28] bg-[#0A0A0E] flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Temp worker name"
                      value={newTempName}
                      onChange={(e) => setNewTempName(e.target.value)}
                      className="flex-1 bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/50"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={newTempRole}
                      onChange={(e) => setNewTempRole(e.target.value)}
                      className="w-28 bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/50"
                    />
                    <select
                      value={newTempClockIn}
                      onChange={(e) => setNewTempClockIn(e.target.value)}
                      className="bg-[#1C1C24] border border-[#2D2D3A] text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/50"
                    >
                      {SERVICE_HOURS.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddTempWorker}
                      disabled={!newTempName.trim()}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/20 transition-colors font-medium disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="flex justify-center py-2">
                <button
                  onClick={calculateTempPayouts}
                  disabled={tempWorkers.filter(w => w.clockOut !== null).length === 0 || tempTotalTips === 0}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all text-sm font-semibold shadow-lg shadow-[#F59E0B]/25 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Zap className="w-4 h-4" />
                  Calculate Instant Payouts
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* ── Step 3: Results ───────────────────────────── */}
              {tempCalculated && tempPayoutResults && (
                <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-bold">3</span>
                      Payout Results — Each Worker&apos;s Earnings
                    </h3>
                    <button
                      onClick={handleExportTempCSV}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors font-medium border border-[#2D2D3A]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tempPayoutResults.map((result) => {
                      const worker = tempWorkers.find(w => w.id === result.workerId);
                      const isPaid = worker?.status === "paid";
                      const isViewing = selectedReceipt === result.workerId;
                      const peakHour = result.hourlyBreakdown.reduce((best, h) => h.share > best.share ? h : best, result.hourlyBreakdown[0]);

                      return (
                        <div
                          key={result.workerId}
                          className={`bg-[#111116] border rounded-xl overflow-hidden transition-all ${
                            isPaid ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/[0.02]" : "border-[#1F1F28]"
                          }`}
                        >
                          {/* Worker Card Header */}
                          <div className="p-4 flex justify-between items-start">
                            <div>
                              <div className="text-base text-white font-medium">{result.workerName}</div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {result.role} • {result.clockIn} → {result.clockOut} • {result.hoursWorked}h
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-semibold text-[#10B981] font-mono">
                                ${result.totalPayout.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-neutral-600 mt-0.5">
                                ${(result.totalPayout / result.hoursWorked).toFixed(2)}/hr avg
                              </div>
                            </div>
                          </div>

                          {/* Peak Hour Callout */}
                          {peakHour && (
                            <div className="mx-4 mb-3 px-3 py-2 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-lg">
                              <div className="text-[10px] text-[#F59E0B] font-medium uppercase tracking-wider">Best Hour</div>
                              <div className="text-xs text-neutral-300">
                                <span className="text-white font-medium">{peakHour.hour}</span> — earned{" "}
                                <span className="text-[#F59E0B] font-mono font-medium">${peakHour.share.toFixed(2)}</span>
                                {" "}from ${peakHour.tipsDuringHour} tips split {peakHour.workersPresent} ways
                              </div>
                            </div>
                          )}

                          {/* Expand/Collapse Hourly Details */}
                          <button
                            onClick={() => setSelectedReceipt(isViewing ? null : result.workerId)}
                            className="w-full px-4 py-2 text-left text-xs text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02] transition-colors font-medium flex items-center gap-1 border-t border-[#1F1F28]"
                          >
                            {isViewing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isViewing ? "Hide" : "Show"} Hour-by-Hour Breakdown
                          </button>

                          {/* Hourly Detail Table */}
                          {isViewing && (
                            <div className="border-t border-[#1F1F28] bg-[#0A0A0E]">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-[#1F1F28]">
                                    <th className="py-2 px-3 text-left text-neutral-600 font-medium">Hour</th>
                                    <th className="py-2 px-3 text-center text-neutral-600 font-medium">Tips Earned</th>
                                    <th className="py-2 px-3 text-center text-neutral-600 font-medium">Staff On</th>
                                    <th className="py-2 px-3 text-right text-neutral-600 font-medium">Your Share</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1F1F28]/30">
                                  {result.hourlyBreakdown.map((hb, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                      <td className="py-1.5 px-3 text-neutral-400 font-mono">{hb.hour}</td>
                                      <td className="py-1.5 px-3 text-center text-neutral-300 font-mono">${hb.tipsDuringHour}</td>
                                      <td className="py-1.5 px-3 text-center text-neutral-500">{hb.workersPresent}</td>
                                      <td className="py-1.5 px-3 text-right text-[#10B981] font-mono font-medium">${hb.share.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="p-3 border-t border-[#1F1F28] flex justify-between items-center">
                            {isPaid ? (
                              <div className="flex items-center gap-2 text-xs text-[#8B5CF6]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="font-medium">Paid at {worker?.paidAt}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleMarkAsPaid(result.workerId)}
                                className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/20 transition-colors font-semibold"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Mark as Paid
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const receiptText = [
                                  `PAYOUT RECEIPT — ${result.workerName}`,
                                  `Role: ${result.role}`,
                                  `Shift: ${result.clockIn} → ${result.clockOut} (${result.hoursWorked}h)`,
                                  `---`,
                                  ...result.hourlyBreakdown.map(hb => `${hb.hour}: $${hb.tipsDuringHour} ÷ ${hb.workersPresent} workers = $${hb.share.toFixed(2)}`),
                                  `---`,
                                  `TOTAL PAYOUT: $${result.totalPayout.toFixed(2)}`,
                                  `Avg Rate: $${(result.totalPayout / result.hoursWorked).toFixed(2)}/hr`,
                                  `Generated: ${new Date().toLocaleString()}`,
                                ].join("\n");
                                const blob = new Blob([receiptText], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `receipt-${result.workerName.replace(/ /g, "-").toLowerCase()}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                showToast(`Receipt downloaded for ${result.workerName}`, "info");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" /> Receipt
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total Verification */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>
                      Total distributed: ${tempPayoutResults.reduce((s, r) => s + r.totalPayout, 0).toFixed(2)}
                      {" "}of ${tempTotalTips.toFixed(2)} total tips
                      {tempWorkers.some(w => w.status === "working") && (
                        <span className="text-[#F59E0B]"> — {tempWorkers.filter(w => w.status === "working").length} worker(s) still active</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#1F1F28] bg-[#0A0A0E] rounded-b-2xl flex justify-between items-center flex-shrink-0">
              <p className="text-xs text-neutral-600">
                Formula: Each hour&apos;s tips ÷ number of workers present that hour = worker&apos;s hourly share
              </p>
              <button
                onClick={() => setTempPayoutOpen(false)}
                className="px-5 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Tips & Service Charges</h1>
          <p className="text-neutral-400 mt-2">Manage pool allocations, distributions, and service charges.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSplitterOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6]/20 to-[#6D28D9]/20 hover:from-[#8B5CF6]/30 hover:to-[#6D28D9]/30 text-[#A78BFA] rounded-lg transition-all text-sm font-medium border border-[#8B5CF6]/30 flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/10"
          >
            <PieChart className="w-4 h-4" /> Tip Splitter
          </button>
          <button
            onClick={() => setTempPayoutOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 hover:from-[#F59E0B]/30 hover:to-[#D97706]/30 text-[#FBBF24] rounded-lg transition-all text-sm font-medium border border-[#F59E0B]/30 flex items-center gap-2 shadow-lg shadow-[#F59E0B]/10"
          >
            <Timer className="w-4 h-4" /> Instant Payout
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setRulesOpen(true)}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" /> Rules Configuration
          </button>
          <button
            onClick={handleCalculatePayouts}
            disabled={calculating}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {calculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {calculating ? "Calculating..." : "Calculate Payouts"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Unallocated Tips</h3>
            <DollarSign className={`w-5 h-5 ${unallocatedTips > 0 ? "text-[#F59E0B]" : "text-[#10B981]"}`} />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              ${unallocatedTips.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs ${unallocatedTips > 0 ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
              {unallocatedTips > 0 ? "Requires calculation" : "All allocated"}
            </p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Service Charge</h3>
            <DollarSign className="text-neutral-300 w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">
              ${totalServiceCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-400">Current pay period</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Pool Status Overview</h3>
            <CheckCircle2 className="text-[#10B981] w-5 h-5" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-2xl font-light text-white">
                {poolsFinalized} / {pools.length}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Pools Finalized</div>
            </div>
            <div className="flex-1 border-l border-[#2D2D3A] pl-4">
              <div className="text-2xl font-light text-white">{totalEmployees}</div>
              <div className="text-xs text-neutral-500 mt-1">Employees included</div>
            </div>
            <div className="flex-1 border-l border-[#2D2D3A] pl-4">
              <div className="text-2xl font-light text-white">
                ${totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Total distributed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pools List */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden mt-6">
        <div className="p-4 border-b border-[#1F1F28] flex justify-between items-center bg-[#0D0D12]">
          <div className="flex gap-4 items-center">
            <h2 className="text-lg font-medium text-white">Daily Tip Pools</h2>
            <span className="text-xs font-mono text-neutral-500 bg-[#1C1C24] px-2 py-1 rounded border border-[#2D2D3A]">
              March 15, 2026
            </span>
          </div>
          <div className="flex gap-2">
            {(["all", "pending_review", "calculated", "finalized"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filterStatus === status
                    ? status === "pending_review"
                      ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                      : status === "calculated"
                      ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30"
                      : status === "finalized"
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                      : "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-neutral-500 border-[#2D2D3A] hover:text-neutral-300"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status === "pending_review"
                  ? "Pending"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#1F1F28]">
          {displayPools.length === 0 && (
            <div className="p-12 text-center text-neutral-500">No pools match this filter.</div>
          )}
          {displayPools.map((pool) => (
            <div key={pool.id}>
              {/* Pool Header Row */}
              <div
                onClick={() => toggleExpand(pool.id)}
                className="flex items-center justify-between p-6 bg-[#0A0A0E] hover:bg-[#1A1A22] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-1 text-neutral-500">
                    {expandedIds.has(pool.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{pool.poolName}</h3>
                    <div className="text-sm text-neutral-500 mt-0.5 flex gap-3">
                      <span>Pool ID: {pool.id}</span>
                      <span>•</span>
                      <span>Total Hours: {pool.totalHours}</span>
                      <span>•</span>
                      <span>{pool.allocations.length} employees</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xl font-light text-white">
                      ${pool.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">Total Pool Amount</div>
                  </div>
                  <div className="w-32">
                    {pool.status === "calculated" && (
                      <span className="inline-flex items-center w-full justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                        Calculated
                      </span>
                    )}
                    {pool.status === "pending_review" && (
                      <span className="inline-flex items-center w-full justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                        Pending Review
                      </span>
                    )}
                    {pool.status === "finalized" && (
                      <span className="inline-flex items-center w-full justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                        Finalized
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Breakdown */}
              {expandedIds.has(pool.id) && (
                <div className="bg-[#0D0D12] border-t border-[#1F1F28] p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
                      Allocation Breakdown
                    </h4>
                    <div className="flex gap-2">
                      {pool.status === "calculated" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFinalizePool(pool.id); }}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 transition-colors font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Finalize
                        </button>
                      )}
                      {pool.status === "finalized" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReopenPool(pool.id); }}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reopen
                        </button>
                      )}
                      {pool.status === "pending_review" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); recalculatePool(pool.id); showToast("Pool recalculated."); }}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors font-medium"
                        >
                          <Calculator className="w-3.5 h-3.5" /> Calculate
                        </button>
                      )}
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1F1F28]">
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider">Employee</th>
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider">Role</th>
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider text-right">Hours</th>
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider text-right">Points</th>
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider text-right">Allocation</th>
                        <th className="pb-3 text-xs font-semibold text-neutral-500 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F28]/50">
                      {pool.allocations.map((alloc, idx) => {
                        const isEditing =
                          editingAlloc?.poolId === pool.id && editingAlloc?.idx === idx;
                        return (
                          <tr key={idx} className="group hover:bg-[#1A1A22]/50 transition-colors">
                            <td className="py-3 text-sm text-white">{alloc.employeeName}</td>
                            <td className="py-3 text-sm text-neutral-400">{alloc.role}</td>
                            <td className="py-3 text-sm text-neutral-400 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.5"
                                  value={editHours}
                                  onChange={(e) => setEditHours(e.target.value)}
                                  className="bg-[#0A0A0E] border border-[#2D2D3A] rounded-md px-2 py-1 text-sm font-mono text-white w-20 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
                                />
                              ) : (
                                alloc.hours.toFixed(1)
                              )}
                            </td>
                            <td className="py-3 text-sm text-neutral-400 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editPoints}
                                  onChange={(e) => setEditPoints(e.target.value)}
                                  className="bg-[#0A0A0E] border border-[#2D2D3A] rounded-md px-2 py-1 text-sm font-mono text-white w-20 text-right focus:outline-none focus:ring-1 focus:ring-white/30"
                                />
                              ) : (
                                alloc.points.toFixed(1)
                              )}
                            </td>
                            <td className="py-3 text-sm font-medium text-[#10B981] text-right">
                              ${alloc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-right">
                              {pool.status !== "finalized" && (
                                <>
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleSaveAlloc()}
                                        className="p-1.5 rounded-md bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 transition-colors"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingAlloc(null)}
                                        className="p-1.5 rounded-md bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleStartEditAlloc(pool.id, idx)}
                                        className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                                        title="Edit allocation"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveAlloc(pool.id, idx)}
                                        className="p-1.5 rounded-md text-neutral-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                                        title="Remove from pool"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* Totals Row */}
                    <tfoot>
                      <tr className="border-t border-[#2D2D3A]">
                        <td className="py-3 text-sm font-medium text-neutral-400" colSpan={2}>
                          Total
                        </td>
                        <td className="py-3 text-sm font-medium text-white text-right">
                          {pool.allocations.reduce((s, a) => s + a.hours, 0).toFixed(1)}
                        </td>
                        <td className="py-3 text-sm font-medium text-white text-right">
                          {pool.allocations.reduce((s, a) => s + a.points, 0).toFixed(1)}
                        </td>
                        <td className="py-3 text-sm font-bold text-[#10B981] text-right">
                          ${pool.allocations.reduce((s, a) => s + a.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS for animations */}
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
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
