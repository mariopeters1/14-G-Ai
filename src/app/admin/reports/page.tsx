
'use client';

import { useState, useMemo } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, LineChart, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, ShoppingBag, Users, Utensils, CookingPot } from 'lucide-react';

const dailyRevenueData = [
  { date: 'Mon', revenue: 2400 },
  { date: 'Tue', revenue: 1398 },
  { date: 'Wed', revenue: 9800 },
  { date: 'Thu', revenue: 3908 },
  { date: 'Fri', revenue: 4800 },
  { date: 'Sat', revenue: 3800 },
  { date: 'Sun', revenue: 4300 },
];

const revenueVsLaborData = [
  { date: 'Mon', revenue: 2400, labor: 800 },
  { date: 'Tue', revenue: 1398, labor: 650 },
  { date: 'Wed', revenue: 9800, labor: 2200 },
  { date: 'Thu', revenue: 3908, labor: 1100 },
  { date: 'Fri', revenue: 4800, labor: 1500 },
  { date: 'Sat', revenue: 3800, labor: 1400 },
  { date: 'Sun', revenue: 4300, labor: 1300 },
];

const salesByCategoryData = [
  { name: 'Main Courses', value: 400, fill: "var(--color-mains)" },
  { name: 'Appetizers', value: 300, fill: "var(--color-appetizers)" },
  { name: 'Desserts', value: 250, fill: "var(--color-desserts)" },
  { name: 'Beverages', value: 200, fill: "var(--color-beverages)" },
];

const salesByItemData = {
  "Main Courses": [
    { name: 'Snapper', value: 250, fill: "var(--color-mains)" },
    { name: 'Skirt Steak', value: 150, fill: "var(--color-mains)" },
  ],
  "Appetizers": [
    { name: 'Gator Bites', value: 180, fill: "var(--color-appetizers)" },
    { name: 'Conch Fritters', value: 120, fill: "var(--color-appetizers)" },
  ],
  "Desserts": [
    { name: 'Key Lime Pie', value: 250, fill: "var(--color-desserts)" },
  ],
  "Beverages": [
      { name: 'Wine', value: 120, fill: "var(--color-beverages)" },
      { name: 'Cocktails', value: 80, fill: "var(--color-beverages)" },
  ]
};

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  labor: {
    label: "Labor Cost",
    color: "hsl(var(--destructive))",
  },
  mains: {
    label: "Main Courses",
    color: "hsl(var(--chart-1))",
  },
  appetizers: {
    label: "Appetizers",
    color: "hsl(var(--chart-2))",
  },
  desserts: {
    label: "Desserts",
    color: "hsl(var(--chart-3))",
  },
  beverages: {
    label: "Beverages",
    color: "hsl(var(--chart-4))",
  },
  value: {
    label: "Sales",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const itemChartData = useMemo(() => {
      if (!selectedCategory) return [];
      return salesByItemData[selectedCategory as keyof typeof salesByItemData] || [];
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-headline font-bold">Reports &amp; Analytics</h1>
            <p className="text-muted-foreground">Key performance indicators and data visualizations for your restaurant.</p>
        </div>
        <div className="w-48">
            <Select defaultValue="last_7_days">
                <SelectTrigger>
                    <SelectValue placeholder="Select a date range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$29,606.00</div>
            <p className="text-xs text-muted-foreground">+15.2% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Food Cost</CardTitle>
            <CookingPot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,141.65</div>
            <p className="text-xs text-muted-foreground">+3.1% from last week (27.5% of revenue)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+852</div>
            <p className="text-xs text-muted-foreground">+18.5% from last week</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Guests per Day</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">122</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Selling Item</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pan-Seared Snapper</div>
            <p className="text-xs text-muted-foreground">120 units sold this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={dailyRevenueData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
                {selectedCategory && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCategory(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div>
                    <CardTitle>{selectedCategory ? `Top Items in ${selectedCategory}`: "Sales by Category"}</CardTitle>
                    <CardDescription>{selectedCategory ? `Breakdown of sales for items in ${selectedCategory}` : `Click a category to drill down into items.`}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             {selectedCategory ? (
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={itemChartData} layout="vertical" margin={{left: 20, right: 20}}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                        <XAxis dataKey="value" type="number" hide />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={4}>
                             {itemChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                 </ChartContainer>
            ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <PieChart>
                     <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie 
                        data={salesByCategoryData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        onClick={(data) => setSelectedCategory(data.name)}
                        className="cursor-pointer"
                    >
                        {salesByCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
            )}
          </CardContent>
        </Card>
         <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue vs. Labor Cost</CardTitle>
            <CardDescription>Comparison over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={revenueVsLaborData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="labor" stroke="var(--color-labor)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
