
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  analyzeInventory,
  type InventoryAnalysisOutput,
} from '@/ai/flows/inventory-analysis-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Lightbulb,
  ShoppingCart,
  BrainCircuit,
  Sparkles,
  Package,
  Martini,
  Snowflake,
  Carrot,
  Milk,
  Bird,
  Beef,
  Fish as FishIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


const inventoryAnalysisSchema = z.object({
  salesForecast: z.string().min(1, 'Sales forecast is required.'),
  upcomingEvents: z.string().min(1, 'Upcoming events are required.'),
  dryStorage: z.string().min(1, 'Dry storage inventory is required.'),
  bar: z.string().min(1, 'Bar inventory is required.'),
  freezer: z.string().min(1, 'Freezer inventory is required.'),
  produce: z.string().min(1, 'Produce inventory is required.'),
  dairy: z.string().min(1, 'Dairy inventory is required.'),
  poultry: z.string().min(1, 'Poultry inventory is required.'),
  meat: z.string().min(1, 'Meat inventory is required.'),
  fish: z.string().min(1, 'Fish inventory is required.'),
});

type FormData = z.infer<typeof inventoryAnalysisSchema>;

const inventoryFields: { name: keyof FormData; label: string; icon: LucideIcon }[] = [
  { name: 'dryStorage', label: 'Dry Storage', icon: Package },
  { name: 'bar', label: 'Bar', icon: Martini },
  { name: 'freezer', label: 'Freezer', icon: Snowflake },
  { name: 'produce', label: 'Produce', icon: Carrot },
  { name: 'dairy', label: 'Dairy', icon: Milk },
  { name: 'poultry', label: 'Poultry', icon: Bird },
  { name: 'meat', label: 'Meat', icon: Beef },
  { name: 'fish', label: 'Fish', icon: FishIcon },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InventoryAnalysisOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(inventoryAnalysisSchema),
    defaultValues: {
      salesForecast: 'Expecting 15% growth this week.',
      upcomingEvents: 'Corporate party for 50 on Friday.',
      dryStorage: 'Flour: 50 lbs, Sugar: 20 lbs, Pasta: 10 lbs, Olive Oil: 5L',
      bar: 'Vodka: 5 bottles, Wine: 12 bottles, Whiskey: 3 bottles',
      freezer: 'Frozen Fries: 30 lbs, Ice Cream: 10L, Shrimp: 15 lbs',
      produce: 'Tomatoes: 5 lbs, Lettuce: 5 heads, Onions: 10 lbs, Lemons: 20 units',
      dairy: 'Milk: 8L, Cheese: 10 lbs, Butter: 5 lbs',
      poultry: 'Chicken Breast: 30 lbs, Whole Chickens: 5 units',
      meat: 'Beef Sirloin: 20 lbs, Ground Beef: 10 lbs',
      fish: 'Salmon Fillets: 15 lbs, Tuna Steaks: 5 lbs',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await analyzeInventory(data);
      setResult(aiResult);
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to get purchasing suggestions. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline text-2xl">AI Inventory Analysis</CardTitle>
                  <CardDescription>
                    Let AI analyze your stock and provide smart purchasing recommendations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="salesForecast" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Forecast</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="e.g., Expecting 15% growth this week." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="upcomingEvents" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upcoming Events</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="e.g., Corporate party for 50 on Friday." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <Accordion type="single" collapsible className="w-full">
                    {inventoryFields.map(fieldInfo => (
                        <AccordionItem key={fieldInfo.name} value={fieldInfo.name}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <fieldInfo.icon className="h-4 w-4" />
                                    <span>{fieldInfo.label}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <FormField
                                    control={form.control}
                                    name={fieldInfo.name}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea className="min-h-[100px] font-mono text-xs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                  </Accordion>

                  <Button type="submit" disabled={loading} size="lg" className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" />
                        Get AI-Powered Suggestions
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-2xl font-headline font-bold mt-4">AI is analyzing your inventory...</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Cross-referencing your stock levels with sales forecasts and upcoming events to generate smart recommendations.</p>
            </div>
          )}

          {!loading && !result && (
             <Card className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-accent/50 border-dashed">
                <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Recommendations Will Appear Here</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Fill in your inventory data and click the button to let Gastronomic AI generate your next purchase order.</p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6">
              <h3 className="text-3xl font-headline font-bold">AI Purchasing Recommendations</h3>
              {result.recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommendations.map((rec, index) => (
                      <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-xl">
                             <ShoppingCart className="text-primary h-5 w-5" /> {rec.item}
                          </CardTitle>
                          <CardDescription>{rec.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="font-bold text-lg text-primary mb-3">{rec.suggestion}</p>
                          <div className="flex items-start gap-3 text-sm text-muted-foreground bg-accent p-3 rounded-md">
                              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80"/>
                              <p>{rec.reasoning}</p>
                          </div>
                      </CardContent>
                      </Card>
                  ))}
                  </div>
              ) : (
                  <Card className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8">
                      <h3 className="text-2xl font-headline font-bold">Inventory Looks Good!</h3>
                      <p className="text-muted-foreground mt-2 max-w-sm">Your inventory seems well-stocked for the upcoming period. No urgent purchases needed at this time.</p>
                  </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
