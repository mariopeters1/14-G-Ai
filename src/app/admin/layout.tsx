"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import {
  Mail,
  MessageSquare,
  UtensilsCrossed,
  ChefHat,
  Users,
  Archive,
  UserCog,
  Receipt,
  ClipboardList,
  BarChart4,
  CreditCard,
  ArrowLeft,
  Bell,
  X,
  Package,
  CalendarCheck,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Zap,
  Search,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "info" | "order" | "alert";
  timestamp: number;
}

// ─── Nav Structure ──────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  avatar?: string;
  accent?: string;
  startsWith?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Messages", icon: Mail, exact: true },
      { href: "/admin/reservations", label: "Reservations", icon: Users },
      { href: "/admin/sales", label: "Sales & POS", icon: Receipt },
      { href: "/admin/staff", label: "Staff Scheduler", icon: UserCog },
      { href: "/admin/inventory", label: "Smart Inventory", icon: Archive },
      { href: "/admin/menu", label: "Menu Editor", icon: ClipboardList },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart4 },
      { href: "/admin/formula86", label: "Formula-86", icon: UtensilsCrossed },
      { href: "/admin/feedback", label: "Customer Feedback", icon: MessageSquare },
    ],
  },
  {
    label: "AI & Automation",
    items: [
      {
        href: "/admin/ai-chef",
        label: "Chef Mario Peters",
        icon: null,
        avatar: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842",
      },
      { href: "/admin/smart-menu", label: "Smart Menu", icon: ChefHat },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/pay", label: "Gastronomic Pay", icon: CreditCard, accent: "#10B981", startsWith: true },
    ],
  },
];

// Flatten for lookup
const allNavItems = navGroups.flatMap((g) => g.items);

// ─── Component ──────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const addNotification = useCallback((title: string, description: string, type: Notification["type"]) => {
    const notif: Notification = { id: Date.now().toString(), title, description, type, timestamp: Date.now() };
    setNotifications((prev) => [notif, ...prev].slice(0, 8));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 6000);
  }, []);

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => {
      addNotification("🔔 New VIP Reservation", "Table 4 — 'John Doe' party of 4 at 7:30 PM.", "info");
    }, 8000);
    const interval = setInterval(() => {
      const r = Math.random();
      if (r > 0.5) {
        addNotification(
          "🧾 Incoming Web Order",
          `Order #${Math.floor(1000 + Math.random() * 9000)} — $${(Math.random() * 150 + 20).toFixed(2)} received.`,
          "order"
        );
      } else if (r > 0.35) {
        addNotification("⚠️ Inventory Alert", "Wagyu Beef stock is running low. Smart reorder suggested.", "alert");
      }
    }, 25000);
    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [addNotification]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) return null;

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    if (item.startsWith) return pathname.startsWith(item.href);
    return pathname === item.href;
  };

  // Find current page label for header
  const currentPage = allNavItems.find((item) => isActive(item));

  const notifTypeColors: Record<Notification["type"], string> = {
    info: "#06B6D4",
    order: "#10B981",
    alert: "#F59E0B",
  };

  const notifTypeIcon: Record<Notification["type"], React.ReactNode> = {
    info: <CalendarCheck className="w-4 h-4" />,
    order: <Package className="w-4 h-4" />,
    alert: <Bell className="w-4 h-4" />,
  };

  // ─── Sidebar Nav Renderer ─────────────────────────────────────
  const renderSidebarContent = (collapsed: boolean, onLinkClick?: () => void) => (
    <>
      {/* Logo Section */}
      <div className="admin-sidebar-header">
        <Link href="/" className="flex items-center gap-3 group" onClick={onLinkClick}>
          <div className="admin-logo-ring">
            <Logo className="h-5 w-5" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-[13px] font-semibold text-white tracking-tight leading-none">
                Gastronomic AI
              </span>
              <span className="text-[10px] text-neutral-500 tracking-wider uppercase mt-0.5">
                Command Center
              </span>
            </motion.div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="admin-sidebar-collapse-btn hidden lg:flex"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="admin-system-status">
          <div className="flex items-center gap-2">
            <span className="admin-pulse-dot" />
            <span className="text-[10px] font-medium text-[#10B981] uppercase tracking-widest">
              All Systems Online
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Activity className="w-3 h-3 text-neutral-600" />
            <span className="text-[10px] text-neutral-600 font-mono">
              AI Engine Active • 12ms Latency
            </span>
          </div>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="admin-sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label} className="admin-nav-group">
            {!collapsed && (
              <div className="admin-nav-group-label">
                {group.label}
              </div>
            )}
            {collapsed && <div className="admin-nav-group-divider" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                const accent = item.accent || "#06B6D4";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
                    style={active ? { "--nav-accent": accent } as React.CSSProperties : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className={`admin-nav-icon-wrap ${active ? "admin-nav-icon-active" : ""}`}
                      style={active ? { borderColor: `${accent}40`, background: `${accent}12` } : undefined}
                    >
                      {item.avatar ? (
                        <Image
                          src={item.avatar}
                          alt={item.label}
                          width={18}
                          height={18}
                          className="rounded-full"
                        />
                      ) : item.icon ? (
                        <item.icon className="w-[15px] h-[15px]" style={active ? { color: accent } : undefined} />
                      ) : (
                        <Sparkles className="w-[15px] h-[15px]" style={active ? { color: accent } : undefined} />
                      )}
                    </div>
                    {!collapsed && (
                      <span className="admin-nav-label">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <motion.div
                        layoutId="sidebar-active-dot"
                        className="admin-nav-active-indicator"
                        style={{ backgroundColor: accent }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                    {active && (
                      <div className="admin-nav-glow" style={{ background: accent }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-back-link" onClick={onLinkClick}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </Link>
          <div className="admin-sidebar-version">
            <Zap className="w-3 h-3 text-[#06B6D4]" />
            <span>v2.4.0 — Gastronomic AI</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="admin-layout">
      {/* ═══════════════ DESKTOP SIDEBAR ═══════════════ */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "admin-sidebar-collapsed" : ""}`}>
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="admin-sidebar-expand-btn"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        {renderSidebarContent(sidebarCollapsed)}
      </aside>

      {/* ═══════════════ MOBILE DRAWER ═══════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-mobile-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.12, duration: 0.45 }}
              className="admin-mobile-sidebar"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="admin-mobile-close"
              >
                <X className="w-4 h-4" />
              </button>
              {renderSidebarContent(false, () => setMobileMenuOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="admin-main-wrapper">
        {/* Header Bar */}
        <header className="admin-header">
          <div className="admin-header-inner">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="admin-mobile-trigger"
              >
                <PanelLeft className="w-5 h-5" />
              </button>

              {/* Breadcrumb / Page Title */}
              <div className="admin-header-breadcrumb">
                <span className="admin-breadcrumb-prefix">Admin</span>
                <span className="admin-breadcrumb-sep">/</span>
                <span className="admin-breadcrumb-current">{currentPage?.label || "Dashboard"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Pill */}
              <button className="admin-header-search-btn">
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="admin-kbd hidden md:inline-flex">⌘K</kbd>
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={panelRef}>
                <button
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="admin-header-icon-btn"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="admin-notif-badge" />
                  )}
                </button>

                {/* Notification Panel */}
                <AnimatePresence>
                  {showNotifPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="admin-notif-panel"
                    >
                      <div className="admin-notif-panel-header">
                        <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Notifications</span>
                        <span className="admin-notif-count">{notifications.length}</span>
                      </div>
                      <div className="admin-notif-panel-body">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n.id} className="admin-notif-item">
                              <div
                                className="admin-notif-item-icon"
                                style={{
                                  backgroundColor: `${notifTypeColors[n.type]}15`,
                                  color: notifTypeColors[n.type],
                                }}
                              >
                                {notifTypeIcon[n.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] text-white font-medium leading-tight">{n.title}</div>
                                <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{n.description}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center text-xs text-neutral-600">
                            <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                            No new notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar */}
              <button className="admin-header-avatar">
                <div className="admin-header-avatar-inner">
                  <span className="text-[10px] font-bold text-white">G</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ═══════════════ FLOATING NOTIFICATIONS ═══════════════ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.slice(0, 3).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="admin-floating-notif"
              style={{ borderColor: `${notifTypeColors[n.type]}30` }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${notifTypeColors[n.type]}15`, color: notifTypeColors[n.type] }}
                >
                  {notifTypeIcon[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-white font-medium">{n.title}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{n.description}</div>
                </div>
                <button
                  onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                  className="p-0.5 text-neutral-600 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        /* ═══════════════ ADMIN DESIGN SYSTEM ═══════════════ */

        :root {
          --admin-bg: #06060A;
          --admin-surface: #0C0C12;
          --admin-surface-2: #111118;
          --admin-border: #1A1A24;
          --admin-border-subtle: #14141E;
          --admin-accent: #06B6D4;
          --admin-accent-glow: rgba(6, 182, 212, 0.08);
          --admin-sidebar-w: 260px;
          --admin-sidebar-w-collapsed: 72px;
          --admin-header-h: 56px;
        }

        /* ─── Layout ─── */

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--admin-bg);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .admin-main-wrapper {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* ─── Sidebar ─── */

        .admin-sidebar {
          display: none;
          width: var(--admin-sidebar-w);
          flex-shrink: 0;
          background: var(--admin-surface);
          border-right: 1px solid var(--admin-border);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          flex-direction: column;
          z-index: 40;
          transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (min-width: 1024px) {
          .admin-sidebar { display: flex; }
        }

        .admin-sidebar-collapsed {
          width: var(--admin-sidebar-w-collapsed);
        }

        .admin-sidebar::-webkit-scrollbar { width: 0; }

        /* sidebar glow line on left edge */
        .admin-sidebar::before {
          content: '';
          position: absolute;
          top: 60px;
          right: 0;
          bottom: 60px;
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            var(--admin-accent-glow) 20%,
            rgba(6, 182, 212, 0.15) 50%,
            var(--admin-accent-glow) 80%,
            transparent
          );
          pointer-events: none;
          z-index: 1;
        }

        .admin-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 18px 16px;
          border-bottom: 1px solid var(--admin-border-subtle);
        }

        .admin-sidebar-collapsed .admin-sidebar-header {
          padding: 20px 14px 16px;
          justify-content: center;
        }

        .admin-logo-ring {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%);
          border: 1px solid rgba(6, 182, 212, 0.2);
          flex-shrink: 0;
          position: relative;
        }

        .admin-logo-ring::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          background: conic-gradient(from 0deg, transparent 0%, rgba(6, 182, 212, 0.3) 25%, transparent 50%, rgba(16, 185, 129, 0.2) 75%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s;
          z-index: -1;
        }

        .admin-sidebar-header:hover .admin-logo-ring::after {
          opacity: 1;
        }

        .admin-sidebar-collapse-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          color: #4A4A58;
          transition: all 0.2s;
        }

        .admin-sidebar-collapse-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        .admin-sidebar-expand-btn {
          display: flex;
          width: 32px;
          height: 32px;
          margin: 12px auto 0;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          color: #4A4A58;
          transition: all 0.2s;
        }

        .admin-sidebar-expand-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        /* System Status */
        .admin-system-status {
          padding: 12px 18px;
          border-bottom: 1px solid var(--admin-border-subtle);
        }

        .admin-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
          animation: admin-pulse 2s infinite;
        }

        @keyframes admin-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
          50% { opacity: 0.6; box-shadow: 0 0 4px rgba(16, 185, 129, 0.3); }
        }

        /* Nav */
        .admin-sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
        }

        .admin-sidebar-collapsed .admin-sidebar-nav {
          padding: 12px 8px;
        }

        .admin-nav-group {
          margin-bottom: 8px;
        }

        .admin-nav-group-label {
          padding: 8px 10px 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #3A3A48;
        }

        .admin-nav-group-divider {
          height: 1px;
          background: var(--admin-border-subtle);
          margin: 6px 8px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 10px;
          font-size: 13px;
          color: #6B6B7B;
          transition: all 0.2s;
          position: relative;
          text-decoration: none;
        }

        .admin-sidebar-collapsed .admin-nav-link {
          padding: 8px;
          justify-content: center;
        }

        .admin-nav-link:hover {
          color: #B0B0C0;
          background: rgba(255,255,255,0.03);
        }

        .admin-nav-link-active {
          color: #fff !important;
          background: rgba(6, 182, 212, 0.06) !important;
        }

        .admin-nav-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid transparent;
          transition: all 0.2s;
          color: #5A5A6A;
        }

        .admin-nav-link:hover .admin-nav-icon-wrap {
          border-color: rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: #A0A0B5;
        }

        .admin-nav-icon-active {
          color: var(--admin-accent) !important;
        }

        .admin-nav-label {
          flex: 1;
          font-weight: 450;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-nav-active-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .admin-nav-glow {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          border-radius: 0 4px 4px 0;
          opacity: 0.8;
          filter: blur(0.5px);
        }

        /* Sidebar Footer */
        .admin-sidebar-footer {
          padding: 16px 18px;
          border-top: 1px solid var(--admin-border-subtle);
          margin-top: auto;
        }

        .admin-sidebar-back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 12px;
          color: #4A4A58;
          transition: color 0.2s;
          text-decoration: none;
        }

        .admin-sidebar-back-link:hover {
          color: #A0A0B5;
        }

        .admin-sidebar-version {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 10px;
          color: #2A2A38;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ─── Header ─── */

        .admin-header {
          height: var(--admin-header-h);
          border-bottom: 1px solid var(--admin-border);
          background: var(--admin-surface);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .admin-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 24px;
        }

        @media (max-width: 640px) {
          .admin-header-inner { padding: 0 16px; }
        }

        .admin-mobile-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: #4A4A58;
          transition: all 0.2s;
        }

        .admin-mobile-trigger:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        @media (min-width: 1024px) {
          .admin-mobile-trigger { display: none; }
        }

        .admin-header-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .admin-breadcrumb-prefix {
          color: #4A4A58;
          font-weight: 500;
        }

        .admin-breadcrumb-sep {
          color: #2A2A38;
        }

        .admin-breadcrumb-current {
          color: #E0E0E8;
          font-weight: 500;
        }

        .admin-header-search-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          color: #4A4A58;
          border: 1px solid var(--admin-border);
          background: var(--admin-surface-2);
          transition: all 0.2s;
          cursor: pointer;
        }

        .admin-header-search-btn:hover {
          border-color: #2A2A38;
          color: #8A8A9A;
        }

        .admin-kbd {
          font-size: 10px;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #4A4A58;
          font-family: 'JetBrains Mono', monospace;
          margin-left: 4px;
        }

        .admin-header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: #4A4A58;
          transition: all 0.2s;
          position: relative;
        }

        .admin-header-icon-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        .admin-notif-badge {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #EF4444;
          border: 2px solid var(--admin-surface);
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
        }

        .admin-header-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.2));
          transition: all 0.3s;
          cursor: pointer;
        }

        .admin-header-avatar:hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(16, 185, 129, 0.4));
        }

        .admin-header-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          background: var(--admin-surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── Notification Panel ─── */

        .admin-notif-panel {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 360px;
          border: 1px solid var(--admin-border);
          border-radius: 16px;
          background: var(--admin-surface);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 1px rgba(6, 182, 212, 0.1);
          overflow: hidden;
          z-index: 50;
        }

        .admin-notif-panel-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--admin-border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--admin-surface-2);
        }

        .admin-notif-count {
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--admin-accent);
          background: rgba(6, 182, 212, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(6, 182, 212, 0.15);
        }

        .admin-notif-panel-body {
          max-height: 340px;
          overflow-y: auto;
        }

        .admin-notif-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--admin-border-subtle);
          transition: background 0.15s;
        }

        .admin-notif-item:hover {
          background: rgba(255,255,255,0.015);
        }

        .admin-notif-item-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ─── Content Area ─── */

        .admin-content {
          flex: 1;
          min-height: 0;
        }

        /* ─── Mobile Nav ─── */

        .admin-mobile-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
        }

        @media (min-width: 1024px) {
          .admin-mobile-backdrop { display: none; }
        }

        .admin-mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          z-index: 50;
          background: var(--admin-surface);
          border-right: 1px solid var(--admin-border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 1024px) {
          .admin-mobile-sidebar { display: none; }
        }

        .admin-mobile-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A4A58;
          transition: all 0.2s;
          z-index: 10;
        }

        .admin-mobile-close:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        /* ─── Floating Notifications ─── */

        .admin-floating-notif {
          pointer-events: auto;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid;
          max-width: 340px;
          background: var(--admin-surface);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        /* ─── Scrollbar Hide ─── */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
