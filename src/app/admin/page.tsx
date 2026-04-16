"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import {
  Mail,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Clock,
  User,
  Send,
  Eye,
  ChevronDown,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface Contact {
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: Timestamp;
}

// ─── Component ──────────────────────────────────────────────────

export default function AdminPage() {
  const firestore = useFirestore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview
  const [previewContact, setPreviewContact] = useState<Contact | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning">("success");

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Firestore CRUD ───────────────────────────────

  const fetchContacts = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "contacts"));
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Contact[];
      data.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showToast("Failed to fetch messages.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [firestore]);

  const handleSave = async () => {
    if (!firestore) return;
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      showToast("All fields are required.", "warning");
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedContact) {
        const ref = doc(firestore, "contacts", selectedContact.id);
        await updateDoc(ref, { fullName: formName, email: formEmail, message: formMessage });
        showToast("Message updated.");
      } else {
        await addDoc(collection(firestore, "contacts"), {
          fullName: formName,
          email: formEmail,
          message: formMessage,
          createdAt: serverTimestamp(),
        });
        showToast("Message created.");
      }
      fetchContacts();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      showToast("Failed to save.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "contacts", id));
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
      showToast("Message deleted.");
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Failed to delete.", "warning");
    }
  };

  // ─── Open forms ───────────────────────────────────

  const openCreate = () => {
    setSelectedContact(null);
    setFormName("");
    setFormEmail("");
    setFormMessage("");
    setIsFormOpen(true);
  };

  const openEdit = (c: Contact) => {
    setSelectedContact(c);
    setFormName(c.fullName);
    setFormEmail(c.email);
    setFormMessage(c.message);
    setIsFormOpen(true);
  };

  // ─── Filter ───────────────────────────────────────

  const filtered = contacts.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Loading ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Contact Messages</h1>
          <p className="text-neutral-400 mt-2">Manage guest inquiries from your website contact form.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Create Message
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Messages", value: contacts.length, icon: <Inbox className="w-5 h-5" />, color: "#3B82F6" },
          { label: "This Week", value: contacts.filter((c) => c.createdAt && Date.now() - c.createdAt.toMillis() < 7 * 86400000).length, icon: <Clock className="w-5 h-5" />, color: "#F59E0B" },
          { label: "Unique Contacts", value: new Set(contacts.map((c) => c.email)).size, icon: <User className="w-5 h-5" />, color: "#10B981" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="text-xl font-light text-white font-mono">{kpi.value}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-[#111116] border border-[#1F1F28] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
          />
        </div>
        <button
          onClick={fetchContacts}
          className="px-4 py-2.5 bg-[#111116] border border-[#1F1F28] rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Messages Table */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_1.5fr_3fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#1F1F28] text-[10px] text-neutral-500 uppercase tracking-wider bg-[#0D0D12]">
          <span>Name</span>
          <span>Email</span>
          <span>Message</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          filtered.map((contact) => (
            <div
              key={contact.id}
              className="grid grid-cols-[1.5fr_1.5fr_3fr_1fr_auto] gap-4 px-6 py-4 border-b border-[#1F1F28] items-center hover:bg-white/[0.02] transition-colors group"
            >
              <div className="text-sm text-white font-medium truncate">{contact.fullName}</div>
              <div className="text-sm text-neutral-400 truncate font-mono">{contact.email}</div>
              <div className="text-xs text-neutral-500 truncate">{contact.message}</div>
              <div className="text-xs text-neutral-500 font-mono">
                {contact.createdAt ? new Date(contact.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
              </div>
              <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreviewContact(contact)} className="p-1.5 hover:bg-white/5 rounded-md" title="Preview">
                  <Eye className="w-4 h-4 text-neutral-500 hover:text-white" />
                </button>
                <button onClick={() => openEdit(contact)} className="p-1.5 hover:bg-white/5 rounded-md" title="Edit">
                  <Edit className="w-4 h-4 text-neutral-500 hover:text-white" />
                </button>
                <button onClick={() => setDeleteTarget(contact)} className="p-1.5 hover:bg-[#EF4444]/10 rounded-md" title="Delete">
                  <Trash2 className="w-4 h-4 text-neutral-500 hover:text-[#EF4444]" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <Inbox className="mx-auto w-10 h-10 text-neutral-700 mb-3" />
            <p className="text-sm text-neutral-500">No messages found.</p>
          </div>
        )}
      </div>

      {/* ═══════════════ PREVIEW MODAL ═══════════════ */}
      {previewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewContact(null)}>
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl w-[480px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#1F1F28] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-white font-medium">Message Preview</h3>
              </div>
              <button onClick={() => setPreviewContact(null)} className="p-1 hover:bg-white/5 rounded-md">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-neutral-500">From</div>
                  <div className="text-white font-medium">{previewContact.fullName}</div>
                  <div className="text-xs text-neutral-400 font-mono">{previewContact.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Received</div>
                  <div className="text-xs text-neutral-400 font-mono">
                    {previewContact.createdAt
                      ? new Date(previewContact.createdAt.seconds * 1000).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#1F1F28] pt-4">
                <div className="text-xs text-neutral-500 mb-2">Message</div>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap bg-[#0D0D12] border border-[#1F1F28] rounded-xl p-4">
                  {previewContact.message}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPreviewContact(null);
                    openEdit(previewContact);
                  }}
                  className="flex-1 py-2.5 bg-[#1F1F28] text-neutral-400 hover:text-white rounded-xl text-sm border border-[#2D2D3A] flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <a
                  href={`mailto:${previewContact.email}`}
                  className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CREATE/EDIT MODAL ═══════════════ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsFormOpen(false)}>
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl w-[420px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#1F1F28] flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{selectedContact ? "Edit Message" : "Create Message"}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedContact ? "Make changes to the message." : "Add a new contact message."}
                </p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-white/5 rounded-md">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Message *</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={4}
                  placeholder="Enter message content..."
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-[#1F1F28] text-neutral-400 hover:text-white rounded-xl text-sm border border-[#2D2D3A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION ═══════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl w-[380px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <h3 className="text-white font-medium mb-1">Delete Message?</h3>
              <p className="text-xs text-neutral-500">
                This will permanently delete the message from <span className="text-white">{deleteTarget.fullName}</span>.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-[#1F1F28] text-neutral-400 hover:text-white rounded-xl text-sm border border-[#2D2D3A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 py-2.5 bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-xl text-sm font-medium transition-colors"
              >
                Delete
              </button>
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
