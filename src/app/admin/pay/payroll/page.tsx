"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Download,
  CheckCircle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  FileText,
  Edit3,
  Save,
  X,
  Lock,
  Unlock,
  RefreshCw,
  DollarSign,
  Users,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

type RunStatus = "Draft" | "Approved" | "Processing" | "Paid";
type EmpStatus = "Ready" | "Review Required";

interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  basePay: number;
  overtimePay: number;
  tips: number;
  grossPay: number;
  status: EmpStatus;
}

interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  type: string;
  status: RunStatus;
  metrics: {
    totalGross: number;
    totalTaxes: number;
    totalNet: number;
    totalEmployees: number;
  };
  employees: PayrollEmployee[];
}

// ─── Initial Data ───────────────────────────────────────────────

const initialRuns: PayrollRun[] = [
  {
    id: "PR-2026-03-A",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-15",
    type: "Regular",
    status: "Draft",
    metrics: {
      totalGross: 45240.5,
      totalTaxes: 8143.29,
      totalNet: 37097.21,
      totalEmployees: 24,
    },
    employees: [
      { id: "EMP-004", name: "Julian Alvarez", role: "Line Cook", basePay: 880.0, overtimePay: 280.5, tips: 0, grossPay: 1160.5, status: "Review Required" },
      { id: "EMP-005", name: "Mia Rodriguez", role: "Server", basePay: 320.0, overtimePay: 0, tips: 1240.25, grossPay: 1560.25, status: "Ready" },
      { id: "EMP-002", name: "Marcus Thorne", role: "Sous Chef", basePay: 1140.0, overtimePay: 85.5, tips: 0, grossPay: 1225.5, status: "Ready" },
      { id: "EMP-003", name: "Sophia Lin", role: "Sommelier", basePay: 600.0, overtimePay: 0, tips: 890.0, grossPay: 1490.0, status: "Ready" },
      { id: "EMP-001", name: "Eleanor Vance", role: "Executive Chef", basePay: 3653.85, overtimePay: 0, tips: 0, grossPay: 3653.85, status: "Ready" },
    ],
  },
  {
    id: "PR-2026-02-B",
    periodStart: "2026-02-16",
    periodEnd: "2026-02-28",
    type: "Regular",
    status: "Approved",
    metrics: {
      totalGross: 42100.0,
      totalTaxes: 7578.0,
      totalNet: 34522.0,
      totalEmployees: 23,
    },
    employees: [
      { id: "EMP-001", name: "Eleanor Vance", role: "Executive Chef", basePay: 3653.85, overtimePay: 0, tips: 0, grossPay: 3653.85, status: "Ready" },
      { id: "EMP-002", name: "Marcus Thorne", role: "Sous Chef", basePay: 1140.0, overtimePay: 42.75, tips: 0, grossPay: 1182.75, status: "Ready" },
    ],
  },
  {
    id: "PR-2026-02-A",
    periodStart: "2026-02-01",
    periodEnd: "2026-02-15",
    type: "Regular",
    status: "Paid",
    metrics: {
      totalGross: 41800.0,
      totalTaxes: 7524.0,
      totalNet: 34276.0,
      totalEmployees: 22,
    },
    employees: [],
  },
];

// ─── Component ──────────────────────────────────────────────────

export default function PayrollRunsPage() {
  const [runs, setRuns] = useState<PayrollRun[]>(initialRuns);
  const [expandedEmpIds, setExpandedEmpIds] = useState<Set<string>>(new Set());
  const [editingEmp, setEditingEmp] = useState<{ runId: string; empIdx: number } | null>(null);
  const [editBase, setEditBase] = useState("");
  const [editOT, setEditOT] = useState("");
  const [editTips, setEditTips] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");
  const [processing, setProcessing] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const draftRun = runs.find((r) => r.status === "Draft");
  const historicalRuns = runs.filter((r) => r.status !== "Draft");

  // Derived KPIs from draft
  const reviewCount = draftRun?.employees.filter((e) => e.status === "Review Required").length ?? 0;

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

  // ─── Recalculate run metrics from employees ───────────────────

  const recalcRunMetrics = (run: PayrollRun): PayrollRun => {
    const totalGross = run.employees.reduce((s, e) => s + e.grossPay, 0);
    const totalTaxes = Math.round(totalGross * 0.18 * 100) / 100; // ~18% effective rate
    const totalNet = Math.round((totalGross - totalTaxes) * 100) / 100;
    return {
      ...run,
      metrics: {
        ...run.metrics,
        totalGross: Math.round(totalGross * 100) / 100,
        totalTaxes,
        totalNet,
        totalEmployees: run.employees.length > 0 ? run.metrics.totalEmployees : run.metrics.totalEmployees,
      },
    };
  };

  // ─── Actions ────────────────────────────────────────────────

  const handleApproveRun = () => {
    if (!draftRun) return;
    if (reviewCount > 0) {
      showToast(`${reviewCount} employee(s) still need review before approval.`, "warning");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setRuns((prev) =>
        prev.map((r) => (r.id === draftRun.id ? { ...r, status: "Approved" as RunStatus } : r))
      );
      setProcessing(false);
      showToast("Payroll run approved and locked.");
    }, 1500);
  };

  const handleForceApprove = () => {
    if (!draftRun) return;
    setProcessing(true);
    setTimeout(() => {
      setRuns((prev) =>
        prev.map((r) =>
          r.id === draftRun.id
            ? {
                ...r,
                status: "Approved" as RunStatus,
                employees: r.employees.map((e) => ({ ...e, status: "Ready" as EmpStatus })),
              }
            : r
        )
      );
      setProcessing(false);
      showToast("All employees approved. Payroll run locked.");
    }, 1500);
  };

  const handleReopenRun = (runId: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: "Draft" as RunStatus } : r))
    );
    showToast("Payroll run reopened for editing.", "info");
  };

  const handleApproveEmployee = (empIdx: number) => {
    if (!draftRun) return;
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== draftRun.id) return r;
        const updated = [...r.employees];
        updated[empIdx] = { ...updated[empIdx], status: "Ready" };
        return { ...r, employees: updated };
      })
    );
    showToast("Employee approved for payroll.");
  };

  const handleStartEdit = (runId: string, empIdx: number) => {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    const emp = run.employees[empIdx];
    setEditingEmp({ runId, empIdx });
    setEditBase(String(emp.basePay));
    setEditOT(String(emp.overtimePay));
    setEditTips(String(emp.tips));
  };

  const handleSaveEdit = () => {
    if (!editingEmp) return;
    const { runId, empIdx } = editingEmp;
    const basePay = parseFloat(editBase) || 0;
    const overtimePay = parseFloat(editOT) || 0;
    const tips = parseFloat(editTips) || 0;
    const grossPay = Math.round((basePay + overtimePay + tips) * 100) / 100;

    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r;
        const updated = [...r.employees];
        updated[empIdx] = { ...updated[empIdx], basePay, overtimePay, tips, grossPay };
        return recalcRunMetrics({ ...r, employees: updated });
      })
    );
    setEditingEmp(null);
    showToast("Employee pay updated. Run totals recalculated.");
  };

  const handleCancelEdit = () => setEditingEmp(null);

  const toggleEmpExpand = (empId: string) => {
    setExpandedEmpIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  };

  const handleExportDraft = () => {
    if (!draftRun) return;
    const headers = ["Employee", "Role", "Base Pay", "OT Pay", "Tips", "Gross Pay", "Status"];
    const rows = draftRun.employees.map((e) => [
      e.name, e.role,
      `$${e.basePay.toFixed(2)}`, `$${e.overtimePay.toFixed(2)}`,
      `$${e.tips.toFixed(2)}`, `$${e.grossPay.toFixed(2)}`, e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-draft-${draftRun.periodStart}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Draft payroll exported as CSV.", "info");
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
              : toastType === "warning"
              ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle className="w-4 h-4" />}
            {toastType === "warning" && <AlertOctagon className="w-4 h-4" />}
            {toastType === "info" && <Download className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Payroll Runs</h1>
          <p className="text-neutral-400 mt-2">
            {draftRun ? (
              <>
                Draft Payroll Review •{" "}
                <span className="text-white font-medium">
                  {draftRun.periodStart} to {draftRun.periodEnd}
                </span>
              </>
            ) : (
              "No active draft. All runs are finalized."
            )}
          </p>
        </div>
        {draftRun && (
          <div className="flex gap-3">
            <button
              onClick={handleExportDraft}
              className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Draft
            </button>
            {reviewCount > 0 ? (
              <button
                onClick={handleForceApprove}
                disabled={processing}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
                {processing ? "Processing..." : `Force Approve (${reviewCount} issues)`}
              </button>
            ) : (
              <button
                onClick={handleApproveRun}
                disabled={processing}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {processing ? "Locking..." : "Approve & Lock Run"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards — Draft Run */}
      {draftRun && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Gross Pay</h3>
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div className="text-4xl font-light text-white">
              ${draftRun.metrics.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Est. Taxes</h3>
              <Calculator className="text-neutral-400 w-5 h-5" />
            </div>
            <div className="text-4xl font-light text-neutral-300">
              ${draftRun.metrics.totalTaxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Net Pay</h3>
              <CheckCircle className="text-[#10B981] w-5 h-5" />
            </div>
            <div className="text-4xl font-light text-[#10B981]">
              ${draftRun.metrics.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Headcount</h3>
              <Users className="text-neutral-400 w-5 h-5" />
            </div>
            <div className="text-4xl font-light text-white">{draftRun.metrics.totalEmployees}</div>
          </div>
        </div>
      )}

      {/* Active Draft — Employee Table */}
      {draftRun && draftRun.status === "Draft" && (
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden mb-8">
          <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12] flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-neutral-400" /> Earnings Preview (Per Employee)
            </h2>
            <div className="flex gap-2">
              {reviewCount > 0 && (
                <span className="flex items-center gap-2 text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full">
                  <AlertOctagon className="w-3.5 h-3.5" /> {reviewCount} Review Required
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A0A0E] border-b border-[#1F1F28]">
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Base Pay</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">OT Pay</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Tips/Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Total Gross</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F28]">
                {draftRun.employees.map((emp, i) => {
                  const isEditing = editingEmp?.runId === draftRun.id && editingEmp?.empIdx === i;
                  const isExpanded = expandedEmpIds.has(emp.id);

                  return (
                    <tr key={emp.id}>
                      <td colSpan={7} className="p-0">
                        <div className={`hover:bg-[#1A1A22] transition-colors group ${isEditing ? "bg-[#1A1A24] ring-1 ring-inset ring-white/10" : ""}`}>
                          <div className="flex items-center">
                            {/* Employee */}
                            <div className="px-6 py-4 flex-1 min-w-[180px]">
                              <div className="text-white font-medium">{emp.name}</div>
                              <div className="text-xs text-neutral-500 mt-0.5">{emp.role}</div>
                            </div>

                            {/* Base Pay */}
                            <div className="px-6 py-4 text-right min-w-[120px]">
                              {isEditing ? (
                                <input type="number" step="0.01" value={editBase} onChange={(e) => setEditBase(e.target.value)}
                                  className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-2 py-1 text-sm font-mono text-white w-28 text-right focus:outline-none focus:ring-1 focus:ring-white/30" />
                              ) : (
                                <span className="text-neutral-300 font-mono">${emp.basePay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </div>

                            {/* OT */}
                            <div className="px-6 py-4 text-right min-w-[120px]">
                              {isEditing ? (
                                <input type="number" step="0.01" value={editOT} onChange={(e) => setEditOT(e.target.value)}
                                  className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-2 py-1 text-sm font-mono text-white w-28 text-right focus:outline-none focus:ring-1 focus:ring-white/30" />
                              ) : (
                                <span className={`font-mono ${emp.overtimePay > 0 ? "text-[#F59E0B]" : "text-neutral-500"}`}>
                                  ${emp.overtimePay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>

                            {/* Tips */}
                            <div className="px-6 py-4 text-right min-w-[120px]">
                              {isEditing ? (
                                <input type="number" step="0.01" value={editTips} onChange={(e) => setEditTips(e.target.value)}
                                  className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-2 py-1 text-sm font-mono text-white w-28 text-right focus:outline-none focus:ring-1 focus:ring-white/30" />
                              ) : (
                                <span className="text-[#10B981] font-mono">${emp.tips.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </div>

                            {/* Gross */}
                            <div className="px-6 py-4 text-right min-w-[120px]">
                              <span className="text-white font-medium font-mono">${emp.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            {/* Status */}
                            <div className="px-6 py-4 min-w-[140px]">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                emp.status === "Ready"
                                  ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                                  : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                              }`}>
                                {emp.status}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 text-right min-w-[160px]">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={handleSaveEdit} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25 transition-colors font-medium">
                                    <Save className="w-3.5 h-3.5" /> Save
                                  </button>
                                  <button onClick={handleCancelEdit} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors font-medium">
                                    <X className="w-3.5 h-3.5" /> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {emp.status === "Review Required" && (
                                    <button onClick={() => handleApproveEmployee(i)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors font-medium opacity-0 group-hover:opacity-100">
                                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                  )}
                                  <button onClick={() => handleStartEdit(draftRun.id, i)} className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button onClick={() => toggleEmpExpand(emp.id)} className="p-1 text-neutral-500 hover:text-white transition-colors">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expanded Detail */}
                          {isExpanded && (
                            <div className="px-6 pb-4 pt-0 border-t border-[#1F1F28]/50">
                              <div className="grid grid-cols-4 gap-4 py-3 text-sm">
                                <div>
                                  <div className="text-neutral-500 text-xs mb-1">Employee ID</div>
                                  <div className="text-white font-mono">{emp.id}</div>
                                </div>
                                <div>
                                  <div className="text-neutral-500 text-xs mb-1">Est. Federal Tax</div>
                                  <div className="text-neutral-300 font-mono">${(emp.grossPay * 0.12).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-neutral-500 text-xs mb-1">Est. FICA</div>
                                  <div className="text-neutral-300 font-mono">${(emp.grossPay * 0.0765).toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-neutral-500 text-xs mb-1">Est. Net Pay</div>
                                  <div className="text-[#10B981] font-mono font-medium">${(emp.grossPay * 0.8035).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals */}
              <tfoot>
                <tr className="border-t-2 border-[#2D2D3A]">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-400">TOTALS</td>
                  <td className="px-6 py-4 text-right font-mono text-white font-medium">
                    ${draftRun.employees.reduce((s, e) => s + e.basePay, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[#F59E0B] font-medium">
                    ${draftRun.employees.reduce((s, e) => s + e.overtimePay, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[#10B981] font-medium">
                    ${draftRun.employees.reduce((s, e) => s + e.tips, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white font-bold">
                    ${draftRun.employees.reduce((s, e) => s + e.grossPay, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* If draft was just approved, show confirmation */}
      {draftRun && draftRun.status === "Approved" && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-8 mb-8 text-center">
          <Lock className="w-10 h-10 text-[#10B981] mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium mb-2">Payroll Run Locked</h3>
          <p className="text-neutral-400 text-sm mb-4">
            Run {draftRun.id} has been approved. No further edits are allowed.
          </p>
          <button
            onClick={() => handleReopenRun(draftRun.id)}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] inline-flex items-center gap-2"
          >
            <Unlock className="w-4 h-4" /> Reopen for Editing
          </button>
        </div>
      )}

      {/* Historical Runs */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-400" /> Historical Runs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {historicalRuns.map((run) => (
            <div key={run.id}>
              <div
                onClick={() => setExpandedHistoryId(expandedHistoryId === run.id ? null : run.id)}
                className="bg-[#111116] border border-[#1F1F28] p-5 rounded-xl hover:border-[#2D2D3A] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-neutral-400 font-mono">{run.periodStart} — {run.periodEnd}</span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${
                    run.status === "Paid"
                      ? "bg-[#10B981]/15 text-[#10B981]"
                      : "bg-white/10 text-white"
                  }`}>
                    {run.status}
                  </span>
                </div>
                <div className="text-xl text-white font-light mb-1">
                  ${run.metrics.totalGross.toLocaleString()} Gross
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-neutral-500">Run ID: {run.id}</div>
                  <div className="text-xs text-neutral-500">{run.metrics.totalEmployees} employees</div>
                </div>
              </div>

              {/* Expanded historical detail */}
              {expandedHistoryId === run.id && (
                <div className="bg-[#0D0D12] border border-t-0 border-[#1F1F28] rounded-b-xl p-4 -mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-neutral-500 text-xs">Gross</div>
                      <div className="text-white font-mono">${run.metrics.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs">Taxes</div>
                      <div className="text-neutral-300 font-mono">${run.metrics.totalTaxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-xs">Net</div>
                      <div className="text-[#10B981] font-mono">${run.metrics.totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                  {run.employees.length > 0 && (
                    <div className="border-t border-[#1F1F28] pt-3 mt-3 space-y-2">
                      {run.employees.map((emp, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-neutral-300">{emp.name} <span className="text-neutral-500">({emp.role})</span></span>
                          <span className="text-white font-mono">${emp.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
