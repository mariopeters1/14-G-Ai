"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, Users, Apple, Trash2, Calculator, Percent, ArrowUpRight, RefreshCw, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Mock data generator for hourly trends that matches a target revenue
const generateHourlyData = (targetRevenue: number) => {
    const data = [];
    let cumulativeRevenue = 0;
    const hours = ['10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM'];
    
    const steps = 7;
    let remaining = targetRevenue;

    for (let i = 0; i < hours.length; i++) {
        if (i > 6) break; // generate data up to 4PM current simulation time
        
        let chunk = 0;
        if (i === 6) {
            chunk = remaining; 
        } else {
            chunk = (remaining / (steps - i)) * (0.8 + Math.random() * 0.4);
        }
        
        cumulativeRevenue += chunk;
        remaining -= chunk;
        
        data.push({
            time: hours[i],
            revenue: cumulativeRevenue,
            labor: cumulativeRevenue * 0.29,
            food: cumulativeRevenue * 0.34
        });
    }
    return data;
};

const VENUES = [
    { id: 'terra-bleu', name: 'Terra Bleu', baseSales: 18565.09 },
    { id: 'gator-flamingo', name: 'Gator & Flamingo', baseSales: 13908.63 },
    { id: 'kann-rum', name: "Kan'n Rum Bar & Grill", baseSales: 9577.66 },
    { id: 'downtown', name: 'Chez Lui Café - Downtown', baseSales: 7776.96 },
    { id: 'hq', name: 'Gastronomic AI Test Kitchen', baseSales: 5193.22 },
];

export default function Formula86Page() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("terra-bleu");

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const fetchRealTimeData = (venueId = selectedVenueId) => {
    setIsRefreshing(true);
    // Simulate network delay and data synthesis
    setTimeout(() => {
      const venue = VENUES.find(v => v.id === venueId) || VENUES[0];

      // Use exact targeted revenue
      const revenue = venue.baseSales;
      
      // Calculate realistic expenses based on revenue to maintain standard foodservice margins
      const labor = revenue * 0.29; // 29% Labor
      const food = revenue * 0.34;  // 34% COGS
      const waste = revenue * 0.04; // 4% Waste
      
      const ebitda = revenue - (labor + food + waste);
      const margin = (ebitda / revenue) * 100;

      setData({
        revenue,
        labor,
        food,
        waste,
        ebitda,
        margin,
        trends: generateHourlyData(revenue)
      });
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    fetchRealTimeData(selectedVenueId);
    // Simulate live POS websocket updates every 15 seconds
    const interval = setInterval(() => fetchRealTimeData(selectedVenueId), 15000);
    return () => clearInterval(interval);
  }, [selectedVenueId]);

  if (!data) {
     return <div className="min-h-[60vh] flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
             <RefreshCw className="w-8 h-8 text-primary" />
         </motion.div>
     </div>
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                <Activity className="text-primary w-8 h-8 drop-shadow-[0_0_10px_rgba(202,138,4,0.5)]" /> 
                F-86 Command Center
            </h1>
            <p className="text-white/60 mt-1 uppercase tracking-widest text-sm">Real-time telemetry for restaurant operations and EBITDA tracking.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger className="w-[240px] bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-black/60 transition-all rounded-full h-10">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                  {VENUES.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 py-1.5 px-3 rounded-full uppercase tracking-widest text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  Live Sync
              </Badge>
              <Button onClick={() => fetchRealTimeData(selectedVenueId)} disabled={isRefreshing} variant="secondary" size="sm" className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 h-10 px-4">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Sync
              </Button>
          </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
          {/* Revenue */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-emerald-400/50"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-500 pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                 <div className="flex justify-between items-start">
                     <div className="space-y-2">
                         <p className="text-xs font-semibold text-white/50 flex items-center uppercase tracking-[0.2em]">
                             Real-Time Revenue
                         </p>
                         <p className="text-4xl font-bold text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                             {formatCurrency(data.revenue)}
                         </p>
                     </div>
                     <div className="p-3 bg-green-500/10 rounded-full border border-green-500/20">
                         <TrendingUp className="w-6 h-6 text-green-400" />
                     </div>
                 </div>
                 <div className="mt-6 flex items-center text-sm">
                     <div className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                         <ArrowUpRight className="w-4 h-4 mr-1" />
                         <span className="font-medium mr-1">+12.5%</span>
                     </div>
                     <span className="text-white/40 ml-2 text-xs uppercase tracking-wider">from yesterday</span>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Labor */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                 <div className="space-y-3">
                     <p className="text-xs font-semibold text-white/50 flex items-center justify-between uppercase tracking-widest">
                         Labor Cost <Users className="w-4 h-4 text-white/30" />
                     </p>
                     <p className="text-2xl font-bold font-mono text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">
                         {formatCurrency(data.labor)}
                     </p>
                     <div className="flex items-center gap-2">
                         <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-red-500/50 rounded-full" style={{ width: `${(data.labor / data.revenue) * 100}%` }} />
                         </div>
                         <p className="text-[10px] text-white/40 uppercase tracking-wider whitespace-nowrap">
                             {((data.labor / data.revenue) * 100).toFixed(1)}% (tgt {"<"}30%)
                         </p>
                     </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Food */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                 <div className="space-y-3">
                     <p className="text-xs font-semibold text-white/50 flex items-center justify-between uppercase tracking-widest">
                         Food Cost <Apple className="w-4 h-4 text-white/30" />
                     </p>
                     <p className="text-2xl font-bold font-mono text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                         {formatCurrency(data.food)}
                     </p>
                     <div className="flex items-center gap-2">
                         <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-500/50 rounded-full" style={{ width: `${(data.food / data.revenue) * 100}%` }} />
                         </div>
                         <p className="text-[10px] text-white/40 uppercase tracking-wider whitespace-nowrap">
                             {((data.food / data.revenue) * 100).toFixed(1)}% (tgt {"<"}28%)
                         </p>
                     </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EBITDA Output */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="h-full bg-gradient-to-br from-primary/20 via-primary/5 to-black/60 backdrop-blur-2xl border-primary/30 shadow-[0_0_30px_rgba(202,138,4,0.15)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 text-primary group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
                  <Calculator className="w-24 h-24 drop-shadow-[0_0_15px_rgba(202,138,4,0.8)]" />
              </div>
              <CardContent className="p-6 relative z-10">
                 <div className="flex justify-between items-start">
                     <div className="space-y-2">
                         <p className="text-xs font-semibold text-primary/80 flex items-center uppercase tracking-[0.2em] mb-2">
                             Generated EBITDA
                         </p>
                         <p className="text-4xl font-bold text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                             {formatCurrency(data.ebitda)}
                         </p>
                     </div>
                 </div>
                 <div className="mt-6 flex items-center gap-4 text-sm">
                     <div className="flex items-center bg-black/40 border border-primary/20 px-3 py-1.5 rounded-full">
                         <Percent className="w-4 h-4 text-primary mr-2" />
                         <span className="font-bold text-white mr-1 tracking-wider">{data.margin.toFixed(1)}%</span> 
                         <span className="text-white/50 text-xs uppercase tracking-widest">Margin</span>
                     </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
              <Card className="h-[400px] flex flex-col bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2 text-white">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Intraday Revenue Performance
                      </CardTitle>
                      <CardDescription className="text-white/40">Cumulative revenue generation against labor and food burn rates.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorLab" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                            </linearGradient>
                            <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="rgba(255,255,255,0.4)" />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} fontSize={12} stroke="rgba(255,255,255,0.4)" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                          <Area type="monotone" dataKey="labor" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorLab)" name="Labor Cost" />
                          <Area type="monotone" dataKey="food" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorFood)" name="Food Cost" />
                        </AreaChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
          >
              <Card className="h-[400px] flex flex-col bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2 text-white">
                          <Trash2 className="w-5 h-5 text-red-500" />
                          Waste Impact
                      </CardTitle>
                      <CardDescription className="text-white/40">Tracked waste across stations today.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                     <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2 text-white/80">
                                <span className="text-xs uppercase tracking-widest">BOH Prep Station</span>
                                <span className="font-mono font-bold text-sm text-red-400">{formatCurrency((data.waste * 0.45))}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.8)] w-[45%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2 text-white/80">
                                <span className="text-xs uppercase tracking-widest">Line Spoilage</span>
                                <span className="font-mono font-bold text-sm text-red-400">{formatCurrency((data.waste * 0.33))}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.8)] w-[33%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2 text-white/80">
                                <span className="text-xs uppercase tracking-widest">FOH Comps/Spills</span>
                                <span className="font-mono font-bold text-sm text-red-400">{formatCurrency((data.waste * 0.22))}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.8)] w-[22%]" />
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-lg border-l-2 border-red-500/50 backdrop-blur-sm">
                            <h4 className="font-semibold text-red-400 mb-1 text-sm uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Smart Insight
                            </h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                Line spoilage has increased 12% week-over-week. Ensure proper FIFO rotation on the grill station.
                            </p>
                        </div>
                     </div>
                  </CardContent>
              </Card>
          </motion.div>
      </div>
    </div>
  );
}
