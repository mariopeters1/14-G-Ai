"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { name: "Overview", href: "/admin/pay", icon: "📊" },
  { name: "Employees", href: "/admin/pay/employees", icon: "👥" },
  { name: "Time & Attendance", href: "/admin/pay/time", icon: "⏱️" },
  { name: "Schedules Sync", href: "/admin/pay/schedules", icon: "📅" },
  { name: "Tips & Service Charges", href: "/admin/pay/tips", icon: "💵" },
  { name: "Payroll Runs", href: "/admin/pay/payroll", icon: "📁" },
  { name: "Labor Intelligence", href: "/admin/pay/intelligence", icon: "🧠" },
  { name: "Documents", href: "/admin/pay/documents", icon: "📄" },
  { name: "Settings", href: "/admin/pay/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === '/login') {
    return null;
  }

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'DO';

  return (
    <div className="w-64 h-full bg-[#111116] border-r border-[#1F1F28] flex flex-col pt-6">
      <div className="px-6 pb-8">
        <h1 className="text-xl font-medium tracking-wide text-white uppercase opacity-90">
          Gastronomic Pay
        </h1>
        <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
          Labor Intelligence
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'text-white bg-[#1C1C24] border border-[#2D2D3A]' : 'text-neutral-300 hover:text-white hover:bg-[#1A1A22]'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#1F1F28]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1F1F28] border border-[#2D2D3A] flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate w-full">{user?.displayName || 'Administrator'}</span>
            <span className="text-xs text-neutral-500 truncate w-full">{user?.email || 'admin@gastronomic.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
