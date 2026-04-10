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
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Activity className="text-primary w-8 h-8" /> 
                F-86 Command Center
            </h1>
            <p className="text-muted-foreground mt-1">Real-time telemetry for restaurant operations and EBITDA tracking.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger className="w-[240px] bg-card border-primary/20">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent>
                  {VENUES.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 py-1.5 px-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                  Live POS Sync
              </Badge>
              <Button onClick={() => fetchRealTimeData(selectedVenueId)} disabled={isRefreshing} variant="secondary" size="sm">
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
            <Card className="h-full border-t-4 border-t-green-500 bg-gradient-to-b from-card to-card/50">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start">
                     <div className="space-y-2">
                         <p className="text-sm font-medium text-muted-foreground flex items-center uppercase tracking-wider">
                             Real-Time Revenue
                         </p>
                         <p className="text-4xl font-bold text-green-600 dark:text-green-400 font-mono tracking-tight">
                             {formatCurrency(data.revenue)}
                         </p>
                     </div>
                     <div className="p-3 bg-green-500/10 rounded-full">
                         <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
                     </div>
                 </div>
                 <div className="mt-4 flex items-center text-sm text-muted-foreground">
                     <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                     <span className="text-green-500 font-medium mr-1">+12.5%</span> from yesterday
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Labor */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardContent className="p-6">
                 <div className="space-y-2">
                     <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                         Labor Cost <Users className="w-4 h-4 text-muted-foreground" />
                     </p>
                     <p className="text-2xl font-bold font-mono text-destructive">
                         {formatCurrency(data.labor)}
                     </p>
                     <p className="text-xs text-muted-foreground">
                         {((data.labor / data.revenue) * 100).toFixed(1)}% of Revenue (Target {"<"}30%)
                     </p>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Food */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardContent className="p-6">
                 <div className="space-y-2">
                     <p className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                         Food Cost <Apple className="w-4 h-4 text-muted-foreground" />
                     </p>
                     <p className="text-2xl font-bold font-mono text-destructive">
                         {formatCurrency(data.food)}
                     </p>
                     <p className="text-xs text-muted-foreground">
                         {((data.food / data.revenue) * 100).toFixed(1)}% of Revenue (Target {"<"}28%)
                     </p>
                 </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* EBITDA Output */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <Card className="h-full border-primary/50 bg-primary/5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator className="w-24 h-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                 <div className="flex justify-between items-start">
                     <div className="space-y-2">
                         <p className="text-sm font-medium text-primary flex items-center uppercase tracking-wider">
                             Generated EBITDA
                         </p>
                         <p className="text-4xl font-bold text-primary font-mono tracking-tight">
                             {formatCurrency(data.ebitda)}
                         </p>
                     </div>
                 </div>
                 <div className="mt-4 flex items-center gap-4 text-sm">
                     <div className="flex items-center">
                         <Percent className="w-4 h-4 text-primary mr-1" />
                         <span className="font-bold text-primary mr-1">{data.margin.toFixed(1)}%</span> Margin
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
              <Card className="h-[400px] flex flex-col">
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Intraday Revenue Performance
                      </CardTitle>
                      <CardDescription>Cumulative revenue generation against labor and food burn rates.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                          <Area type="monotone" dataKey="labor" stroke="#ef4444" strokeWidth={2} fill="transparent" name="Labor Cost" />
                          <Area type="monotone" dataKey="food" stroke="#f97316" strokeWidth={2} fill="transparent" name="Food Cost" />
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
              <Card className="h-[400px] flex flex-col">
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2">
                          <Trash2 className="w-5 h-5 text-destructive" />
                          Waste Impact
                      </CardTitle>
                      <CardDescription>Tracked waste across stations today.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                     <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium">BOH Prep Station</span>
                                <span className="font-mono font-bold">{formatCurrency((data.waste * 0.45))}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-destructive w-[45%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium">Line Spoilage</span>
                                <span className="font-mono font-bold">{formatCurrency((data.waste * 0.33))}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-destructive w-[33%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium">FOH Comps/Spills</span>
                                <span className="font-mono font-bold">{formatCurrency((data.waste * 0.22))}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-destructive w-[22%]" />
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                            <h4 className="font-semibold text-destructive mb-1">AI Insight</h4>
                            <p className="text-sm text-foreground/80 text-balance">
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
