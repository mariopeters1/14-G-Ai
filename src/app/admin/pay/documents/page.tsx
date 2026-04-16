"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Search,
  Send,
  X,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Mail,
  Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

type DocStatus = "Completed" | "Missing" | "Expiring Soon" | "Requested";

interface Document {
  id: string;
  employeeName: string;
  type: string;
  status: DocStatus;
  dueDate: string;
  uploadedDate?: string;
  fileSize?: string;
}

// ─── Initial Data ───────────────────────────────────────────────

const initialDocuments: Document[] = [
  { id: "DOC-001", employeeName: "Eleanor Vance", type: "W-4 Federal Tax", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-20", fileSize: "124 KB" },
  { id: "DOC-002", employeeName: "Eleanor Vance", type: "I-9 Employment Eligibility", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-18", fileSize: "89 KB" },
  { id: "DOC-003", employeeName: "Marcus Thorne", type: "ServSafe Certification", status: "Expiring Soon", dueDate: "2026-04-20", uploadedDate: "2024-04-20", fileSize: "215 KB" },
  { id: "DOC-004", employeeName: "Sophia Lin", type: "Alcohol Service Permit", status: "Completed", dueDate: "2027-06-15", uploadedDate: "2025-06-15", fileSize: "178 KB" },
  { id: "DOC-005", employeeName: "Julian Alvarez", type: "Food Handler Certificate", status: "Missing", dueDate: "2026-03-15" },
  { id: "DOC-006", employeeName: "Mia Rodriguez", type: "W-4 Federal Tax", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-25", fileSize: "112 KB" },
  { id: "DOC-007", employeeName: "Mia Rodriguez", type: "Direct Deposit Authorization", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-26", fileSize: "67 KB" },
  { id: "DOC-008", employeeName: "Liam Johnson", type: "I-9 Employment Eligibility", status: "Missing", dueDate: "2026-03-10" },
  { id: "DOC-009", employeeName: "Oliver Chen", type: "TIPS Certification", status: "Expiring Soon", dueDate: "2026-05-01", uploadedDate: "2024-05-01", fileSize: "192 KB" },
  { id: "DOC-010", employeeName: "Noah Williams", type: "Employee Handbook Acknowledgment", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-28", fileSize: "45 KB" },
  { id: "DOC-011", employeeName: "Ava Brown", type: "W-4 Federal Tax", status: "Completed", dueDate: "2026-03-01", uploadedDate: "2026-02-22", fileSize: "118 KB" },
  { id: "DOC-012", employeeName: "James Garcia", type: "Food Handler Certificate", status: "Expiring Soon", dueDate: "2026-04-30", uploadedDate: "2024-04-30", fileSize: "201 KB" },
];

// ─── Component ──────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [filterStatus, setFilterStatus] = useState<DocStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"employee" | "type" | "status" | "due">("employee");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [reqEmployee, setReqEmployee] = useState("");
  const [reqDocType, setReqDocType] = useState("");
  const [reqDueDate, setReqDueDate] = useState("");

  // Derived KPIs
  const missingCount = documents.filter((d) => d.status === "Missing").length;
  const expiringCount = documents.filter((d) => d.status === "Expiring Soon").length;
  const requestedCount = documents.filter((d) => d.status === "Requested").length;
  const compliantCount = documents.filter((d) => d.status === "Completed").length;
  const complianceRate = documents.length > 0 ? Math.round((compliantCount / documents.length) * 100) : 0;

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

  // ─── Actions ────────────────────────────────────────────────

  const handleMarkComplete = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "Completed" as DocStatus, uploadedDate: new Date().toISOString().split("T")[0], fileSize: "98 KB" }
          : d
      )
    );
    showToast("Document marked as completed.");
  };

  const handleSendReminder = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    showToast(`Reminder sent to ${doc.employeeName} for ${doc.type}.`, "info");
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast("Document removed.", "warning");
  };

  const handleRequestDocument = () => {
    if (!reqEmployee || !reqDocType || !reqDueDate) return;
    const newDoc: Document = {
      id: `DOC-${Date.now()}`,
      employeeName: reqEmployee,
      type: reqDocType,
      status: "Requested",
      dueDate: reqDueDate,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setRequestModalOpen(false);
    setReqEmployee("");
    setReqDocType("");
    setReqDueDate("");
    showToast(`Document requested from ${reqEmployee}.`, "info");
  };

  const handleExport = () => {
    const headers = ["Employee", "Document Type", "Status", "Due Date", "Uploaded", "File Size"];
    const rows = documents.map((d) => [
      d.employeeName, d.type, d.status, d.dueDate, d.uploadedDate || "—", d.fileSize || "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-documents.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Compliance report exported.", "info");
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ─── Filtering & Sorting ─────────────────────────────────────

  let displayDocs = documents
    .filter((d) => filterStatus === "all" || d.status === filterStatus)
    .filter(
      (d) =>
        searchQuery === "" ||
        d.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  displayDocs.sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "employee": cmp = a.employeeName.localeCompare(b.employeeName); break;
      case "type": cmp = a.type.localeCompare(b.type); break;
      case "status": cmp = a.status.localeCompare(b.status); break;
      case "due": cmp = a.dueDate.localeCompare(b.dueDate); break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const uniqueEmployees = [...new Set(documents.map((d) => d.employeeName))].sort();

  const statusColors: Record<DocStatus, string> = {
    Completed: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    Missing: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
    "Expiring Soon": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    Requested: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
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
              ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastType === "info" && <Mail className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Request Document Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setRequestModalOpen(false)}>
          <div className="bg-[#111116] border border-[#2D2D3A] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-neutral-400" /> Request Document
              </h2>
              <button onClick={() => setRequestModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 font-medium block mb-1.5">Employee</label>
                <select
                  value={reqEmployee}
                  onChange={(e) => setReqEmployee(e.target.value)}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                >
                  <option value="">Select employee...</option>
                  {uniqueEmployees.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-400 font-medium block mb-1.5">Document Type</label>
                <select
                  value={reqDocType}
                  onChange={(e) => setReqDocType(e.target.value)}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                >
                  <option value="">Select type...</option>
                  <option value="W-4 Federal Tax">W-4 Federal Tax</option>
                  <option value="I-9 Employment Eligibility">I-9 Employment Eligibility</option>
                  <option value="Direct Deposit Authorization">Direct Deposit Authorization</option>
                  <option value="ServSafe Certification">ServSafe Certification</option>
                  <option value="Food Handler Certificate">Food Handler Certificate</option>
                  <option value="Alcohol Service Permit">Alcohol Service Permit</option>
                  <option value="TIPS Certification">TIPS Certification</option>
                  <option value="Employee Handbook Acknowledgment">Employee Handbook Acknowledgment</option>
                  <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-400 font-medium block mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRequestDocument}
                disabled={!reqEmployee || !reqDocType || !reqDueDate}
                className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Request
              </button>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setViewDoc(null)}>
          <div className="bg-[#111116] border border-[#2D2D3A] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-400" /> Document Details
              </h2>
              <button onClick={() => setViewDoc(null)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                <span className="text-sm text-neutral-400">ID</span>
                <span className="text-sm text-white font-mono">{viewDoc.id}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                <span className="text-sm text-neutral-400">Employee</span>
                <span className="text-sm text-white font-medium">{viewDoc.employeeName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                <span className="text-sm text-neutral-400">Type</span>
                <span className="text-sm text-white">{viewDoc.type}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                <span className="text-sm text-neutral-400">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[viewDoc.status]}`}>
                  {viewDoc.status}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                <span className="text-sm text-neutral-400">Due Date</span>
                <span className="text-sm text-white">{viewDoc.dueDate}</span>
              </div>
              {viewDoc.uploadedDate && (
                <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                  <span className="text-sm text-neutral-400">Uploaded</span>
                  <span className="text-sm text-white">{viewDoc.uploadedDate}</span>
                </div>
              )}
              {viewDoc.fileSize && (
                <div className="flex justify-between items-center p-3 bg-[#0D0D12] rounded-lg border border-[#1F1F28]">
                  <span className="text-sm text-neutral-400">File Size</span>
                  <span className="text-sm text-white font-mono">{viewDoc.fileSize}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setViewDoc(null)}
              className="mt-6 w-full py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Documents & Compliance</h1>
          <p className="text-neutral-400 mt-2">Manage employee forms, handbooks, and certifications.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setRequestModalOpen(true)}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Request Document
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-[#EF4444]/10 p-3 rounded-xl text-[#EF4444]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{missingCount}</div>
            <div className="text-sm text-neutral-400">Missing Documents</div>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-[#F59E0B]/10 p-3 rounded-xl text-[#F59E0B]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{expiringCount}</div>
            <div className="text-sm text-neutral-400">Expiring Certifications</div>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-[#10B981]/10 p-3 rounded-xl text-[#10B981]">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{compliantCount}</div>
            <div className="text-sm text-neutral-400">Compliant Records</div>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-[#3B82F6]/10 p-3 rounded-xl text-[#3B82F6]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-light text-white">{complianceRate}%</div>
            <div className="text-sm text-neutral-400">Compliance Rate</div>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-400" /> Compliance Tracking
            <span className="text-xs text-neutral-500 ml-2">{displayDocs.length} records</span>
          </h2>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0A0A0E] border border-[#2D2D3A] rounded-lg pl-9 pr-3 py-1.5 text-sm text-white w-48 focus:outline-none focus:ring-1 focus:ring-white/30 placeholder-neutral-500"
              />
            </div>
            {/* Status Filters */}
            {(["all", "Missing", "Expiring Soon", "Requested", "Completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filterStatus === status
                    ? status === "Missing"
                      ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                      : status === "Expiring Soon"
                      ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                      : status === "Requested"
                      ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30"
                      : status === "Completed"
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                      : "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-neutral-500 border-[#2D2D3A] hover:text-neutral-300"
                }`}
              >
                {status === "all" ? "All" : status === "Expiring Soon" ? "Expiring" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0E] border-b border-[#1F1F28]">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors" onClick={() => handleSort("employee")}>
                  <div className="flex items-center gap-1">Employee <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors" onClick={() => handleSort("type")}>
                  <div className="flex items-center gap-1">Document Type <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right cursor-pointer hover:text-neutral-200 transition-colors" onClick={() => handleSort("due")}>
                  <div className="flex items-center justify-end gap-1">Due Date <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28]">
              {displayDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No documents match this filter.</td>
                </tr>
              )}
              {displayDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#1A1A22] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{doc.employeeName}</div>
                    <div className="text-xs text-neutral-500 mt-0.5 font-mono">{doc.id}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-300 text-sm">{doc.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-neutral-400 text-sm">{doc.dueDate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewDoc(doc)}
                        className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {(doc.status === "Missing" || doc.status === "Requested") && (
                        <>
                          <button
                            onClick={() => handleSendReminder(doc.id)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
                            title="Send reminder"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMarkComplete(doc.id)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {doc.status === "Expiring Soon" && (
                        <button
                          onClick={() => handleSendReminder(doc.id)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                          title="Send renewal reminder"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 rounded-md text-neutral-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        title="Remove record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
