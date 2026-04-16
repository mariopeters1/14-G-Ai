"use client";

import { useState } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Apple,
  Receipt,
  Users,
  Trophy,
  ChevronDown,
  Download,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Coffee,
  Cookie,
  CalendarDays,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
}

const kpis: KPI[] = [
  { label: "Total Revenue", value: "$29,606", change: "+15.2%", trend: "up", icon: <DollarSign className="w-5 h-5" />, color: "#10B981" },
  { label: "Food Cost", value: "$8,142", change: "+3.1%", trend: "up", icon: <Apple className="w-5 h-5" />, color: "#EF4444" },
  { label: "Labor Cost", value: "$6,440", change: "-2.4%", trend: "down", icon: <Users className="w-5 h-5" />, color: "#3B82F6" },
  { label: "Total Orders", value: "852", change: "+18.5%", trend: "up", icon: <Receipt className="w-5 h-5" />, color: "#F59E0B" },
  { label: "Avg. Check", value: "$34.75", change: "+4.8%", trend: "up", icon: <Sparkles className="w-5 h-5" />, color: "#8B5CF6" },
  { label: "Guests / Day", value: "122", change: "+8.0%", trend: "up", icon: <Users className="w-5 h-5" />, color: "#06B6D4" },
];

const dailyRevenue = [
  { day: "Mon", value: 3210, pct: 34 },
  { day: "Tue", value: 3580, pct: 38 },
  { day: "Wed", value: 2890, pct: 30 },
  { day: "Thu", value: 4820, pct: 51 },
  { day: "Fri", value: 6340, pct: 67 },
  { day: "Sat", value: 7010, pct: 74 },
  { day: "Sun", value: 5180, pct: 55 },
];

const laborRevenue = [
  { day: "Mon", rev: 3210, labor: 980 },
  { day: "Tue", rev: 3580, labor: 920 },
  { day: "Wed", rev: 2890, labor: 870 },
  { day: "Thu", rev: 4820, labor: 1050 },
  { day: "Fri", rev: 6340, labor: 1280 },
  { day: "Sat", rev: 7010, labor: 1420 },
  { day: "Sun", rev: 5180, labor: 1100 },
];

const categories = [
  { name: "Main Courses", pct: 45, rev: "$13,323", color: "#10B981", icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
  { name: "Beverages", pct: 25, rev: "$7,402", color: "#8B5CF6", icon: <Wine className="w-3.5 h-3.5" /> },
  { name: "Appetizers", pct: 20, rev: "$5,921", color: "#F59E0B", icon: <Coffee className="w-3.5 h-3.5" /> },
  { name: "Desserts", pct: 10, rev: "$2,960", color: "#F472B6", icon: <Cookie className="w-3.5 h-3.5" /> },
];

const topItems = [
  { rank: 1, name: "Pan-Seared Gulf Snapper", units: 120, revenue: "$4,560", margin: "72%", trend: "up" },
  { rank: 2, name: "Floridian Skirt Steak", units: 98, revenue: "$4,116", margin: "68%", trend: "up" },
  { rank: 3, name: "Gator Bites", units: 85, revenue: "$1,530", margin: "78%", trend: "up" },
  { rank: 4, name: "Key Lime Pie", units: 72, revenue: "$864", margin: "82%", trend: "neutral" },
  { rank: 5, name: "Conch Fritters", units: 64, revenue: "$1,024", margin: "75%", trend: "down" },
];

const hourlyTraffic = [
  { hour: "11a", guests: 18 }, { hour: "12p", guests: 42 }, { hour: "1p", guests: 38 },
  { hour: "2p", guests: 22 }, { hour: "3p", guests: 12 }, { hour: "4p", guests: 15 },
  { hour: "5p", guests: 28 }, { hour: "6p", guests: 52 }, { hour: "7p", guests: 68 },
  { hour: "8p", guests: 74 }, { hour: "9p", guests: 56 }, { hour: "10p", guests: 30 },
];

const peakGuests = Math.max(...hourlyTraffic.map(h => h.guests));

const weeklyMetrics = [
  { metric: "Revenue / Labor Hour", value: "$41.20", change: "+6.3%", good: true },
  { metric: "Food Cost %", value: "27.5%", change: "+1.2%", good: false },
  { metric: "Labor Cost %", value: "21.8%", change: "-2.4%", good: true },
  { metric: "Prime Cost %", value: "49.3%", change: "-1.1%", good: true },
  { metric: "Avg Ticket Time", value: "18 min", change: "-3.2%", good: true },
  { metric: "Table Turnover", value: "2.4x", change: "+0.3x", good: true },
];

// ─── Component ──────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod] = useState("7d");

  const maxRev = Math.max(...dailyRevenue.map(d => d.value));

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-neutral-400 mt-2">Key performance indicators and data visualizations.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-[#111116] border border-[#1F1F28] rounded-lg px-4 py-2.5 pr-9 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="q">This Quarter</option>
              <option value="y">This Year</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          </div>
          <button className="px-4 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg text-xs border border-[#2D2D3A] flex items-center gap-2 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-4 group hover:border-[#2D2D3A] transition-all">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
            >
              {kpi.icon}
            </div>
            <div className="text-xl font-light text-white font-mono">{kpi.value}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">{kpi.label}</div>
            <div className={`text-[11px] mt-2 flex items-center gap-1 ${kpi.trend === "up" && kpi.label !== "Food Cost" ? "text-[#10B981]" : kpi.trend === "down" && kpi.label === "Labor Cost" ? "text-[#10B981]" : kpi.trend === "up" && kpi.label === "Food Cost" ? "text-[#EF4444]" : "text-neutral-500"}`}>
              {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Revenue Bar + Category + Rev vs Labor */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Daily Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12]">
            <h3 className="text-sm font-medium text-white">Daily Revenue</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Revenue breakdown for the last 7 days</p>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between gap-3" style={{ height: "220px" }}>
              {dailyRevenue.map((d) => {
                const heightPct = (d.value / maxRev) * 100;
                const isWeekend = d.day === "Fri" || d.day === "Sat";
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar">
                    <span className="text-[10px] text-neutral-500 font-mono opacity-0 group-hover/bar:opacity-100 transition-opacity">
                      ${(d.value / 1000).toFixed(1)}k
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all group-hover/bar:opacity-100"
                      style={{
                        height: `${heightPct}%`,
                        background: isWeekend
                          ? "linear-gradient(180deg, #10B981, #10B98180)"
                          : "linear-gradient(180deg, #3B82F6, #3B82F680)",
                        opacity: 0.85,
                      }}
                    />
                    <span className={`text-xs ${isWeekend ? "text-white font-medium" : "text-neutral-500"}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 pt-4 border-t border-[#1F1F28]">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" /> Weekday
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="w-3 h-3 rounded-sm bg-[#10B981]" /> Weekend
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12]">
            <h3 className="text-sm font-medium text-white">Sales by Category</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Revenue distribution</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Donut visual */}
            <div className="flex justify-center mb-2">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {categories.reduce((acc, cat, i) => {
                    const offset = categories.slice(0, i).reduce((s, c) => s + c.pct, 0);
                    acc.push(
                      <circle
                        key={cat.name}
                        cx="18" cy="18" r="15.5"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="3"
                        strokeDasharray={`${cat.pct} ${100 - cat.pct}`}
                        strokeDashoffset={`${-offset}`}
                        strokeLinecap="round"
                        className="transition-all"
                      />
                    );
                    return acc;
                  }, [] as React.ReactNode[])}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono text-white">$29.6k</span>
                  <span className="text-[9px] text-neutral-500">TOTAL</span>
                </div>
              </div>
            </div>
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-white">
                    <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
                    <span className="text-neutral-600">({cat.pct}%)</span>
                  </span>
                  <span className="font-mono text-neutral-400">{cat.rev}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F1F28] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Rev vs Labor + Hourly Traffic + Top Items */}
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue vs Labor */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12]">
            <h3 className="text-sm font-medium text-white">Revenue vs Labor</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Weekly comparison</p>
          </div>
          <div className="p-6">
            <svg viewBox="0 0 300 120" className="w-full" style={{ overflow: "visible" }}>
              {/* Grid lines */}
              {[0, 40, 80, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#1F1F28" strokeWidth="0.5" />
              ))}
              {/* Revenue line */}
              <polyline
                points={laborRevenue.map((d, i) => `${i * 50},${120 - (d.rev / 7500) * 120}`).join(" ")}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Revenue area */}
              <polygon
                points={`0,120 ${laborRevenue.map((d, i) => `${i * 50},${120 - (d.rev / 7500) * 120}`).join(" ")} 300,120`}
                fill="url(#revGrad)"
                opacity="0.15"
              />
              {/* Labor line */}
              <polyline
                points={laborRevenue.map((d, i) => `${i * 50},${120 - (d.labor / 7500) * 120}`).join(" ")}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="6 3"
                strokeLinecap="round"
              />
              {/* Dots */}
              {laborRevenue.map((d, i) => (
                <circle key={i} cx={i * 50} cy={120 - (d.rev / 7500) * 120} r="3" fill="#10B981" />
              ))}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between mt-2">
              {laborRevenue.map((d) => (
                <span key={d.day} className="text-[10px] text-neutral-600">{d.day}</span>
              ))}
            </div>
            <div className="flex gap-4 mt-4 pt-3 border-t border-[#1F1F28]">
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <div className="w-3 h-0.5 bg-[#10B981] rounded" /> Revenue
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <div className="w-3 h-0.5 bg-[#EF4444] rounded border-dashed" style={{ borderTop: "2px dashed #EF4444", height: 0, width: 12 }} /> Labor
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Guest Traffic */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12]">
            <h3 className="text-sm font-medium text-white">Hourly Guest Traffic</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Average covers per hour</p>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-1.5" style={{ height: "140px" }}>
              {hourlyTraffic.map((h) => {
                const heightPct = (h.guests / peakGuests) * 100;
                const isPeak = h.guests >= 50;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group/h">
                    <span className="text-[9px] text-neutral-500 font-mono opacity-0 group-hover/h:opacity-100 transition-opacity">{h.guests}</span>
                    <div
                      className="w-full rounded-t transition-all group-hover/h:opacity-100"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: isPeak ? "#F59E0B" : "#1F1F28",
                        opacity: isPeak ? 0.9 : 0.6,
                      }}
                    />
                    <span className="text-[8px] text-neutral-600">{h.hour}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1F1F28] flex justify-between">
              <div className="text-xs text-neutral-500">Peak: <span className="text-[#F59E0B] font-medium">7–8 PM</span></div>
              <div className="text-xs text-neutral-500">Avg: <span className="text-white font-mono">38</span> guests/hr</div>
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Top Sellers</h3>
              <p className="text-xs text-neutral-500 mt-0.5">By units sold</p>
            </div>
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="divide-y divide-[#1F1F28]">
            {topItems.map((item) => (
              <div key={item.rank} className="px-6 py-3 flex items-center hover:bg-white/[0.02] transition-colors">
                <span className={`w-6 text-xs font-mono ${item.rank <= 3 ? "text-[#F59E0B]" : "text-neutral-600"}`}>
                  #{item.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-neutral-500">{item.units} sold</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs font-mono text-[#10B981]">{item.revenue}</p>
                  <p className="text-[10px] text-neutral-500">{item.margin} margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Key Metrics */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Key Operating Metrics</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Critical ratios and benchmarks</p>
          </div>
          <CalendarDays className="w-4 h-4 text-neutral-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-[#1F1F28]">
          {weeklyMetrics.map((m) => (
            <div key={m.metric} className="px-5 py-5 text-center">
              <div className="text-xl font-mono text-white">{m.value}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1 mb-2">{m.metric}</div>
              <div className={`text-[11px] flex items-center justify-center gap-1 ${m.good ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {m.good ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {m.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
