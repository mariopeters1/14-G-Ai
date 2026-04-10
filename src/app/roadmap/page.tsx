
"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Archive,
  UserCog,
  Receipt,
  CookingPot,
  MessageSquare,
  BarChart4,
  Settings,
  LogOut,
  Search,
  DollarSign,
  TrendingUp,
  Trash2,
  Mic,
  BadgePercent,
  RefreshCw
} from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/roadmap" },
  { icon: Users, label: "Reservations & Guests", href: "/admin/reservations" },
  { icon: Archive, label: "Inventory & Purchasing", href: "/admin/inventory" },
  { icon: UserCog, label: "Staff & Scheduling", href: "/admin/staff" },
  { icon: Receipt, label: "Sales & POS Integration", href: "/admin/sales" },
  { icon: CookingPot, label: "Online Ordering & Menu", href: "/admin/menu" },
  { icon: MessageSquare, label: "Customer Feedback", href: "/admin/feedback" },
  { icon: BarChart4, label: "Reports & Analytics", href: "/admin/reports" },
];

const initialKpiData = [
  {
    id: "revenue",
    title: "Total Revenue (Today)",
    value: 5000.0,
    icon: DollarSign,
    description: "From POS Integration",
    isCurrency: true,
  },
  {
    id: "labor",
    title: "Labor Cost (Today)",
    value: 1500.0,
    icon: Users,
    description: "From Staff Scheduling",
    isCurrency: true,
  },
  {
    id: "food",
    title: "Food Cost (Today)",
    value: 1400.0,
    icon: CookingPot,
    description: "From Inventory & POS",
    isCurrency: true,
  },
  {
    id: "waste",
    title: "Waste Cost (Today)",
    value: 200.0,
    icon: Trash2,
    description: "From Inventory Logs",
    isCurrency: true,
  },
  {
    id: "ebitda_calc",
    title: "Calculated EBITDA (Today)",
    value: 1900.0, // 5000 - 1500 - 1400 - 200
    icon: TrendingUp,
    description: "Revenue - (Labor + Food + Waste)",
    isCurrency: true,
  },
  {
    id: "ebitda_margin",
    title: "EBITDA Margin",
    value: 38.0, // (1900 / 5000) * 100
    icon: BadgePercent,
    description: "(EBITDA / Revenue) x 100",
    isPercentage: true,
  },
];

const VENUE_BASE_METRICS: Record<string, { revenue: number, laborPct: number, foodPct: number, wastePct: number }> = {
  "fmc-flagship": { revenue: 38565.09, laborPct: 0.26, foodPct: 0.24, wastePct: 0.02 },
  "fmc-miami": { revenue: 29577.66, laborPct: 0.28, foodPct: 0.25, wastePct: 0.03 },
  "chez-lui": { revenue: 7776.96, laborPct: 0.25, foodPct: 0.22, wastePct: 0.02 },
  "test-kitchen": { revenue: 5193.22, laborPct: 0.30, foodPct: 0.28, wastePct: 0.04 },
  "market-kiosk": { revenue: 3908.63, laborPct: 0.29, foodPct: 0.27, wastePct: 0.03 },
};

export default function DashboardPrototypePage() {
  const [selectedVenue, setSelectedVenue] = useState<string>("fmc-flagship");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [kpiData, setKpiData] = useState(initialKpiData);

  // When venue changes, instantly update the base KPI
  useEffect(() => {
    const base = VENUE_BASE_METRICS[selectedVenue] || VENUE_BASE_METRICS['fmc-flagship'];
    const laborBase = base.revenue * base.laborPct;
    const foodBase = base.revenue * base.foodPct;
    const wasteBase = base.revenue * base.wastePct;
    const ebitdaBase = base.revenue - laborBase - foodBase - wasteBase;

    setKpiData(initialKpiData.map(item => {
      switch (item.id) {
        case 'revenue': return { ...item, value: base.revenue };
        case 'labor': return { ...item, value: laborBase };
        case 'food': return { ...item, value: foodBase };
        case 'waste': return { ...item, value: wasteBase };
        case 'ebitda_calc': return { ...item, value: ebitdaBase };
        case 'ebitda_margin': return { ...item, value: (ebitdaBase / base.revenue) * 100 };
        default: return item;
      }
    }));
  }, [selectedVenue]);

  // Handle small fluctuations every 2.5s around whatever the current value is
  useEffect(() => {
    const interval = setInterval(() => {
      setKpiData((prevData) => {
        const fluctuate = (value: number) => value + (Math.random() - 0.5) * (value * 0.005);

        const newRevenue = fluctuate(prevData.find(d => d.id === 'revenue')?.value || 0);
        const newLabor = fluctuate(prevData.find(d => d.id === 'labor')?.value || 0);
        const newFoodCost = fluctuate(prevData.find(d => d.id === 'food')?.value || 0);
        const newWaste = fluctuate(prevData.find(d => d.id === 'waste')?.value || 0);

        const newEbitda = newRevenue - newLabor - newFoodCost - newWaste;
        const newMargin = newRevenue > 0 ? (newEbitda / newRevenue) * 100 : 0;

        return prevData.map(item => {
          switch (item.id) {
            case 'revenue':
              return { ...item, value: newRevenue };
            case 'labor':
              return { ...item, value: newLabor };
            case 'food':
              return { ...item, value: newFoodCost };
            case 'waste':
              return { ...item, value: newWaste };
            case 'ebitda_calc':
              return { ...item, value: newEbitda };
            case 'ebitda_margin':
              return { ...item, value: newMargin };
            default:
              return item;
          }
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6" />
            <span>Gastronomic AI</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    item.label === "Dashboard" ? "bg-muted text-primary" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4 border-t">
          <ul className="grid items-start px-0 text-sm font-medium">
            <li>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings & AI Config
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="hidden text-lg font-semibold md:block">
              F-86 Command Center
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedVenue} onValueChange={(val) => {
                  setIsRefreshing(true);
                  setSelectedVenue(val);
                  setTimeout(() => setIsRefreshing(false), 800);
              }}>
                <SelectTrigger className="w-[220px] md:w-auto bg-card border-primary/20">
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fmc-flagship">Floridian Modern Cuisine - Flagship</SelectItem>
                  <SelectItem value="fmc-miami">Floridian Modern Cuisine - Miami</SelectItem>
                  <SelectItem value="chez-lui">Chez Lui Café - Downtown</SelectItem>
                  <SelectItem value="test-kitchen">Gastronomic AI Test Kitchen</SelectItem>
                  <SelectItem value="market-kiosk">Market Square Kiosk</SelectItem>
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 py-1.5 px-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                  Live POS Sync
              </Badge>
              <Button 
                 onClick={() => {
                     setIsRefreshing(true);
                     setTimeout(() => setIsRefreshing(false), 800);
                 }} 
                 disabled={isRefreshing} 
                 variant="secondary" 
                 size="sm"
              >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Sync
              </Button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden lg:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search operations..."
                className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[320px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Mic className="h-4 w-4" />
              <span className="sr-only">Use Voice Command</span>
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="https://placehold.co/100x100.png"
                alt="@user"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>MP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kpiData.map((kpi) => {
              // Determine colorful styling based on KPI type
              let colorClasses = "border-t-primary";
              let textColors = "text-primary";
              let gradient = "bg-gradient-to-b from-card to-card/50";
              let iconTheme = "text-primary dark:text-primary";
              
              if (kpi.id === 'revenue') {
                  colorClasses = "border-t-green-500 border-t-4 shadow-lg";
                  textColors = "text-green-600 dark:text-green-400";
                  gradient = "bg-gradient-to-b from-green-500/5 to-transparent";
                  iconTheme = "text-green-600 p-2 bg-green-500/10 rounded-full";
              } else if (kpi.id === 'labor' || kpi.id === 'food' || kpi.id === 'waste') {
                  colorClasses = "border-t-destructive border-t-[3px]";
                  textColors = "text-destructive dark:text-red-400";
                  gradient = "bg-gradient-to-b from-destructive/5 to-transparent";
                  iconTheme = "text-destructive opacity-70";
              } else if (kpi.id === 'ebitda_calc') {
                  colorClasses = "border-primary/50 shadow-[0_0_20px_rgba(202,138,4,0.15)] bg-primary/5";
                  textColors = "text-primary";
                  gradient = "bg-gradient-to-br from-primary/10 to-transparent";
                  iconTheme = "text-primary opacity-80";
              } else if (kpi.id === 'ebitda_margin') {
                  colorClasses = "bg-card border-none ring-1 ring-primary/20 bg-gradient-to-br from-card to-primary/5";
                  textColors = "text-foreground font-extrabold";
                  iconTheme = "text-primary";
              }

              return (
              <Card key={kpi.id} className={`h-full ${colorClasses} ${gradient} transition-all duration-300 hover:scale-[1.02]`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-wider opacity-80">
                    {kpi.title}
                  </CardTitle>
                  <div className={iconTheme}>
                      <kpi.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold font-mono tracking-tight ${textColors}`}>
                    {kpi.isCurrency && "$"}
                    {kpi.value.toLocaleString("en-US", {
                      minimumFractionDigits: kpi.isPercentage ? 1 : 2,
                      maximumFractionDigits: kpi.isPercentage ? 1 : 2,
                    })}
                    {kpi.isPercentage && "%"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    {kpi.description}
                  </p>
                </CardContent>
              </Card>
            )})}
          </div>
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Key Functional Features
                </CardTitle>
                <CardDescription>
                  This prototype outlines the core modules of the Gastronomic AI
                  operations platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-stone dark:prose-invert max-w-none text-sm text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Real-Time Profitability:</strong> Live calculation
                      of revenue, expenses, and profit margin.
                    </li>
                    <li>
                      <strong>Reservation Management:</strong> Smart tools for
                      booking, guest tracking, and floor plan optimization.
                    </li>
                    <li>
                      <strong>Inventory Automation:</strong> Monitor inventory,
                      log waste, get AI-driven restock suggestions.
                    </li>
                    <li>
                      <strong>Staff Scheduling Optimization:</strong> AI-predicted
                      peak hours, efficient shift assignments, labor cost
                      tracking.
                    </li>
                    <li>
                      <strong>POS Integration:</strong> Plug in popular POS systems
                      for automatic sales data updates.
                    </li>
                    <li>
                      <strong>Menu & Online Ordering:</strong> Editable digital
                      menu, modifiers, and streamlined online ordering.
                    </li>
                    <li>
                      <strong>AI-Driven Customer Feedback:</strong> Automatic
                      sentiment analysis, suggestions for improvement.
                    </li>
                    <li>
                      <strong>Reporting Suite:</strong> Easy-to-read charts and
                      reports for all KPIs.
                    </li>
                    <li>
                      <strong>Predictive Insights:</strong> AI forecasts demand
                      spikes and recommends inventory/staffing adjustments.
                    </li>
                    <li>
                      <strong>Voice Command Option:</strong> Allow users to
                      operate the dashboard hands-free when enabled.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
