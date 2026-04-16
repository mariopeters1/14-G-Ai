"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Link2,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Bell,
  Database,
  Save,
  Plus,
  X,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface Integration {
  name: string;
  status: "Connected" | "Disconnected" | "Syncing";
  lastSync: string;
}

interface NotificationPref {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

interface SecuritySetting {
  id: string;
  label: string;
  desc: string;
  value: string;
  editable: boolean;
}

// ─── Initial Data ───────────────────────────────────────────────

const initialIntegrations: Integration[] = [
  { name: "Toast POS", status: "Connected", lastSync: "5 min ago" },
  { name: "ADP Payroll", status: "Connected", lastSync: "1 hour ago" },
  { name: "QuickBooks", status: "Disconnected", lastSync: "Never" },
  { name: "7shifts Scheduling", status: "Connected", lastSync: "12 min ago" },
];

const initialNotifications: NotificationPref[] = [
  { id: "OT", label: "Overtime threshold alerts", desc: "Get notified when employees approach overtime limits", enabled: true },
  { id: "PR", label: "Payroll approval reminders", desc: "Reminder to approve payroll before deadline", enabled: true },
  { id: "BK", label: "Break compliance warnings", desc: "Alert when meal or rest break violations are detected", enabled: true },
  { id: "NS", label: "Shift no-show alerts", desc: "Notify when an employee misses a scheduled clock-in", enabled: false },
  { id: "TP", label: "Tip pool discrepancies", desc: "Alert when tip calculations have unresolved variances", enabled: false },
];

const initialSecurity: SecuritySetting[] = [
  { id: "2FA", label: "Two-Factor Auth", desc: "Enforced for all admin accounts", value: "Enabled", editable: true },
  { id: "SESSION", label: "Session Timeout", desc: "Auto-logout after inactivity", value: "30 min", editable: true },
  { id: "AUDIT", label: "Audit Log", desc: "Last 30 days of admin actions", value: "142 events", editable: false },
];

// ─── Component ──────────────────────────────────────────────────

export default function SettingsPage() {
  // ─── State ──────────────────────────────────────────────────
  const [companyName, setCompanyName] = useState("Gastronomic AI Restaurant Group");
  const [locations, setLocations] = useState(["Terra Bleu", "Gator & Flamingo", "Kan'n Rum Bar & Grill", "Gastronomic AI Test Kitchen"]);
  const [newLocation, setNewLocation] = useState("");
  const [addingLocation, setAddingLocation] = useState(false);

  const [payPeriod, setPayPeriod] = useState("Bi-Weekly");
  const [overtimeRule, setOvertimeRule] = useState("Over 40 hours/week");
  const [overtimeRate, setOvertimeRate] = useState("1.5x");
  const [defaultPayDay, setDefaultPayDay] = useState("Every other Friday");

  const [notifications, setNotifications] = useState<NotificationPref[]>(initialNotifications);
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [security, setSecurity] = useState<SecuritySetting[]>(initialSecurity);
  const [editingSecurity, setEditingSecurity] = useState<string | null>(null);
  const [editSecValue, setEditSecValue] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

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

  const markChanged = () => setHasChanges(true);

  // ─── Actions ────────────────────────────────────────────────

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      showToast("All settings saved successfully.");
    }, 1200);
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    setLocations((prev) => [...prev, newLocation.trim()]);
    setNewLocation("");
    setAddingLocation(false);
    markChanged();
    showToast("Location added.");
  };

  const handleRemoveLocation = (idx: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== idx));
    markChanged();
    showToast("Location removed.", "warning");
  };

  const handleToggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
    markChanged();
  };

  const handleSyncIntegration = (idx: number) => {
    setIntegrations((prev) =>
      prev.map((int, i) => (i === idx ? { ...int, status: "Syncing" as const } : int))
    );
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int, i) =>
          i === idx ? { ...int, status: "Connected" as const, lastSync: "Just now" } : int
        )
      );
      showToast(`${integrations[idx].name} synced successfully.`);
    }, 1500);
  };

  const handleDisconnectIntegration = (idx: number) => {
    const name = integrations[idx].name;
    setIntegrations((prev) =>
      prev.map((int, i) => (i === idx ? { ...int, status: "Disconnected" as const, lastSync: "—" } : int))
    );
    markChanged();
    showToast(`${name} disconnected.`, "warning");
  };

  const handleReconnectIntegration = (idx: number) => {
    const name = integrations[idx].name;
    setIntegrations((prev) =>
      prev.map((int, i) => (i === idx ? { ...int, status: "Syncing" as const } : int))
    );
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((int, i) =>
          i === idx ? { ...int, status: "Connected" as const, lastSync: "Just now" } : int
        )
      );
      showToast(`${name} reconnected.`);
    }, 1800);
  };

  const handleStartEditSecurity = (id: string) => {
    const setting = security.find((s) => s.id === id);
    if (!setting || !setting.editable) return;
    setEditingSecurity(id);
    setEditSecValue(setting.value);
  };

  const handleSaveSecurity = () => {
    if (!editingSecurity) return;
    setSecurity((prev) =>
      prev.map((s) => (s.id === editingSecurity ? { ...s, value: editSecValue } : s))
    );
    setEditingSecurity(null);
    markChanged();
    showToast("Security setting updated.");
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
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastType === "info" && <Settings className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Connect New Integration Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setConnectModalOpen(false)}>
          <div className="bg-[#111116] border border-[#2D2D3A] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-neutral-400" /> Connect Integration
              </h2>
              <button onClick={() => setConnectModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {["Square POS", "Gusto Payroll", "When I Work", "Homebase", "Deputy"].map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setIntegrations((prev) => [...prev, { name, status: "Connected", lastSync: "Just now" }]);
                    setConnectModalOpen(false);
                    markChanged();
                    showToast(`${name} connected successfully.`);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-[#1C1C24] rounded-xl border border-[#2D2D3A] hover:border-neutral-500 transition-colors"
                >
                  <span className="text-white text-sm font-medium">{name}</span>
                  <span className="text-xs text-neutral-500 hover:text-[#10B981]">Connect →</span>
                </button>
              ))}
            </div>
            <button onClick={() => setConnectModalOpen(false)} className="mt-6 w-full py-2.5 bg-[#1F1F28] text-white rounded-lg text-sm font-medium border border-[#2D2D3A] hover:bg-[#2A2A36] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Settings</h1>
          <p className="text-neutral-400 mt-2">System configuration, integrations, and payroll rules.</p>
        </div>
        <div className="flex gap-3 items-center">
          {hasChanges && (
            <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1.5 rounded-full border border-[#F59E0B]/20 animate-pulse">
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-neutral-400" /> Company Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); markChanged(); }}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Locations</label>
                <div className="space-y-2">
                  {locations.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 group">
                      <span className="text-white text-sm">{loc}</span>
                      <button
                        onClick={() => handleRemoveLocation(i)}
                        className="text-neutral-500 hover:text-[#EF4444] text-xs transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                  {addingLocation ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
                        placeholder="e.g., Catering — Queens"
                        autoFocus
                        className="flex-1 bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 placeholder-neutral-500"
                      />
                      <button onClick={handleAddLocation} className="p-2.5 bg-[#10B981]/15 text-[#10B981] rounded-lg hover:bg-[#10B981]/25 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setAddingLocation(false); setNewLocation(""); }} className="p-2.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/20 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingLocation(true)}
                      className="w-full py-2.5 border border-dashed border-[#2D2D3A] rounded-lg text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Location
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Rules */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-neutral-400" /> Payroll Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Pay Period</label>
                <select
                  value={payPeriod}
                  onChange={(e) => { setPayPeriod(e.target.value); markChanged(); }}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors appearance-none"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Semi-Monthly">Semi-Monthly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Overtime Rule</label>
                <select
                  value={overtimeRule}
                  onChange={(e) => { setOvertimeRule(e.target.value); markChanged(); }}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors appearance-none"
                >
                  <option value="Over 40 hours/week">Over 40 hours/week</option>
                  <option value="Over 8 hours/day">Over 8 hours/day (CA Style)</option>
                  <option value="None">No Overtime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Overtime Rate</label>
                <input
                  type="text"
                  value={overtimeRate}
                  onChange={(e) => { setOvertimeRate(e.target.value); markChanged(); }}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Default Pay Day</label>
                <input
                  type="text"
                  value={defaultPayDay}
                  onChange={(e) => { setDefaultPayDay(e.target.value); markChanged(); }}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-neutral-400" /> Notification Preferences
            </h2>
            <div className="space-y-1">
              {notifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-[#1F1F28] last:border-b-0">
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.id)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${item.enabled ? "bg-[#10B981]" : "bg-[#2D2D3A]"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${item.enabled ? "left-[18px]" : "left-0.5"}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Integrations */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <Link2 className="w-5 h-5 text-neutral-400" /> Integrations
            </h2>
            <div className="space-y-3">
              {integrations.map((integration, i) => (
                <div key={i} className="p-4 bg-[#1C1C24] rounded-xl border border-[#2D2D3A] group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{integration.name}</span>
                    {integration.status === "Connected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                        <Wifi className="w-3 h-3" /> Connected
                      </span>
                    )}
                    {integration.status === "Disconnected" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                        <WifiOff className="w-3 h-3" /> Disconnected
                      </span>
                    )}
                    {integration.status === "Syncing" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Clock className="w-3 h-3" />
                      Last sync: {integration.lastSync}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {integration.status === "Connected" && (
                        <>
                          <button
                            onClick={() => handleSyncIntegration(i)}
                            className="p-1 text-neutral-500 hover:text-[#3B82F6] transition-colors"
                            title="Force sync"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDisconnectIntegration(i)}
                            className="p-1 text-neutral-500 hover:text-[#EF4444] transition-colors"
                            title="Disconnect"
                          >
                            <WifiOff className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {integration.status === "Disconnected" && (
                        <button
                          onClick={() => handleReconnectIntegration(i)}
                          className="p-1 text-neutral-500 hover:text-[#10B981] transition-colors"
                          title="Reconnect"
                        >
                          <Wifi className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setConnectModalOpen(true)}
                className="w-full py-2.5 border border-dashed border-[#2D2D3A] rounded-lg text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors text-sm mt-2 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Connect New Integration
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-neutral-400" /> Security
            </h2>
            <div className="space-y-3">
              {security.map((item) => (
                <div key={item.id} className="p-4 bg-[#1C1C24] rounded-xl border border-[#2D2D3A] group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{item.label}</span>
                    {editingSecurity === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editSecValue}
                          onChange={(e) => setEditSecValue(e.target.value)}
                          className="bg-[#0D0D12] border border-[#2D2D3A] rounded-md px-2 py-0.5 text-xs text-white w-24 focus:outline-none focus:ring-1 focus:ring-white/30"
                        />
                        <button onClick={handleSaveSecurity} className="p-1 text-[#10B981] hover:bg-[#10B981]/10 rounded transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingSecurity(null)} className="p-1 text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.value === "Enabled"
                            ? "text-[#10B981] bg-[#10B981]/10"
                            : "text-neutral-400 bg-[#1F1F28]"
                        }`}>
                          {item.value}
                        </span>
                        {item.editable && (
                          <button
                            onClick={() => handleStartEditSecurity(item.id)}
                            className="p-1 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-neutral-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data & Storage */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-neutral-400" /> Data & Storage
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Database</span>
                <span className="text-white font-medium">Firebase / Firestore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Records</span>
                <span className="text-white font-medium">2,485</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Storage Used</span>
                <span className="text-white font-medium">48.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Last Backup</span>
                <span className="text-[#10B981] font-medium">2h ago</span>
              </div>
              {/* Storage bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Storage capacity</span>
                  <span>48.2 / 500 MB</span>
                </div>
                <div className="h-2 bg-[#1F1F28] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: "9.6%" }}></div>
                </div>
              </div>
            </div>
          </div>
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
