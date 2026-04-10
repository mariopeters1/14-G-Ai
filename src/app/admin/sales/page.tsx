
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSalesData, type SalesAnalysisOutput } from '@/ai/flows/sales-analysis-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Lightbulb, TrendingUp, TrendingDown, BarChart, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VENUES = [
    { id: 'terra-bleu', name: 'Terra Bleu', baseSales: 18565.09, topItems: '45x Waygu Burgers, 30x Truffle Fries' },
    { id: 'gator-flamingo', name: 'Gator & Flamingo', baseSales: 13908.63, topItems: '50x Gator Bites, 40x Flamingo Cocktails' },
    { id: 'kann-rum', name: "Kan'n Rum Bar & Grill", baseSales: 9577.66, topItems: '35x Jerk Chicken, 60x Rum Punch' },
    { id: 'downtown', name: 'Chez Lui Café - Downtown', baseSales: 7776.96, topItems: '55x Artisan Latte, 40x Avocado Toast' },
    { id: 'hq', name: 'Gastronomic AI Test Kitchen', baseSales: 5193.22, topItems: '25x Tasting Menu A, 10x Experimental Entrees' },
];

const aiFormSchema = z.object({
  salesData: z.string().min(10, { message: 'Please provide more detailed sales data.' }),
});

type AiFormData = z.infer<typeof aiFormSchema>;

export default function SalesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalesAnalysisOutput | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("terra-bleu");

  const [grossSales, setGrossSales] = useState('5500.00');
  const [discounts, setDiscounts] = useState('250.00');
  const [taxes, setTaxes] = useState('420.00');

  const { netSales, totalRevenue } = useMemo(() => {
    const gross = parseFloat(grossSales) || 0;
    const disc = parseFloat(discounts) || 0;
    const tax = parseFloat(taxes) || 0;
    const net = gross - disc;
    const total = net + tax;
    return { netSales: net, totalRevenue: total };
  }, [grossSales, discounts, taxes]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  const aiForm = useForm<AiFormData>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      salesData:
        "Total Sales: $5000. Top selling items: Steak Frites (30 orders), Salmon (25 orders). Lunch was slow, dinner was busy. High number of wine pairings sold.",
    },
  });

  const onAiSubmit = async (data: AiFormData) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeSalesData(data);
      setResult(aiResult);
    } catch (error) {
      console.error('Error calling AI flow:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to get analysis. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    unitsSold: {
      label: "Units Sold",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    if (!result?.topItems) return [];
    return result.topItems.map(item => ({
      name: item.itemName,
      unitsSold: parseInt(item.unitsSold.match(/\d+/)?.[0] || '0', 10),
      fill: "var(--color-unitsSold)"
    }));
  }, [result]);

  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles className="w-32 h-32" />
                </div>
                <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <Sparkles className="text-primary" /> Sales Data Sync
                        </CardTitle>
                        <CardDescription>
                            Connect your POS to import today's telemetry for instant AI analysis.
                        </CardDescription>
                    </div>
                    <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select Venue" />
                        </SelectTrigger>
                        <SelectContent>
                            {VENUES.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="outline" 
                            className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => {
                                const venue = VENUES.find(v => v.id === selectedVenueId)!;
                                aiForm.setValue('salesData', `Toast POS Sync [2026-04-10] | ${venue.name}: Gross: $${venue.baseSales}. Top items: ${venue.topItems}. Slow lunch, heavy dinner rush. Labor ran at 22% during peak.`);
                                toast({ title: "Toast POS Synced", description: `Imported transactions securely for ${venue.name}.` });
                            }}
                        >
                            <span className="font-bold tracking-tight text-lg">TOAST</span>
                            <span className="text-xs text-muted-foreground">Sync Today's Data</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => {
                                const venue = VENUES.find(v => v.id === selectedVenueId)!;
                                aiForm.setValue('salesData', `Square POS Sync [2026-04-10] | ${venue.name}: Gross: $${venue.baseSales}. Top items: ${venue.topItems}. High volume in morning, died off after 2PM. Waste higher than normal on pastries.`);
                                toast({ title: "Square Synced", description: `Imported transactions securely for ${venue.name}.` });
                            }}
                        >
                            <span className="font-bold tracking-tight text-lg">Square</span>
                            <span className="text-xs text-muted-foreground">Sync Today's Data</span>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or View Raw Payload</span>
                        </div>
                    </div>

                    <Form {...aiForm}>
                        <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-4">
                        <FormField
                            control={aiForm.control}
                            name="salesData"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Sync from POS to view raw telemetry..."
                                        className="min-h-[100px] font-mono text-xs bg-muted/50 border-dashed resize-none"
                                        readOnly
                                        {...field}
                                    />
                                    {!field.value && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded border shadow-sm">Awaiting POS Connection</span>
                                        </div>
                                    )}
                                </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading || !aiForm.watch('salesData')} className="w-full h-12 text-md font-semibold mt-4">
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing 10,000+ data points...</>
                            ) : 'Generate AI Operating Insights' }
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <BarChart /> Manual Sales Calculator
                    </CardTitle>
                    <CardDescription>
                        Enter sales figures to quickly calculate net and total revenue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Gross Sales</Label>
                        <Input value={grossSales} onChange={(e) => setGrossSales(e.target.value)} type="number" placeholder="5500.00" />
                    </div>
                    <div className="space-y-2">
                        <Label>Discounts & Comps</Label>
                        <Input value={discounts} onChange={(e) => setDiscounts(e.target.value)} type="number" placeholder="250.00" />
                    </div>
                    <div className="space-y-2">
                        <Label>Taxes</Label>
                        <Input value={taxes} onChange={(e) => setTaxes(e.target.value)} type="number" placeholder="420.00" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Net Sales <small>(Gross - Discounts)</small></span>
                            <span className="font-bold text-lg">{formatCurrency(netSales)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Revenue <small>(Net + Taxes)</small></span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(totalRevenue)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-3">
            {loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="text-2xl font-headline font-bold mt-4">AI is analyzing your sales data...</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Identifying trends, top sellers, and creating actionable recommendations for you.</p>
                </div>
            )}

            {!loading && !result && (
                <Card className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-accent/50 border-dashed">
                    <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
                    <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold">Sales Analysis Will Appear Here</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Paste your sales report into the form and let Gastronomic AI reveal hidden opportunities.</p>
                </Card>
            )}

            {!loading && result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><FileText /> AI Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{result.summary}</p>
                        </CardContent>
                    </Card>

                    {chartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2"><BarChart /> Top Sellers Performance</CardTitle>
                                <CardDescription>A visual summary of top-performing items based on units sold.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <RechartsBarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                        <CartesianGrid horizontal={false} />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickMargin={8}
                                            width={120}
                                            className="text-xs truncate"
                                        />
                                        <XAxis dataKey="unitsSold" type="number" hide />
                                        <Tooltip
                                            cursor={{ fill: "hsl(var(--accent))" }}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Bar dataKey="unitsSold" fill="var(--color-unitsSold)" radius={4} />
                                    </RechartsBarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}
                    
                    {result.topItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2"><TrendingUp /> Top Selling Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {result.topItems.map((item, index) => (
                                    <div key={index} className="p-3 rounded-md border bg-secondary/50">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{item.itemName}</p>
                                            <p className="font-mono text-sm text-primary font-bold">{item.unitsSold}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.insight}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {result.underperformingItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2"><TrendingDown className="text-destructive" /> Underperforming Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {result.underperformingItems.map((item, index) => (
                                    <div key={index} className="p-3 rounded-md border border-destructive/20 bg-destructive/5">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-foreground/90">{item.itemName}</p>
                                            <p className="font-mono text-sm text-destructive font-bold">{item.unitsSold}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.insight}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><Lightbulb /> Actionable Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {result.recommendations.map((rec, index) => (
                                <div key={index} className="p-3 rounded-md bg-accent">
                                    <p className="font-semibold">{rec.recommendation}</p>
                                    <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
