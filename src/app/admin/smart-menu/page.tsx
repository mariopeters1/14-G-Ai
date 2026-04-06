
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateSmartMenu, type SmartMenuOutput } from '@/ai/flows/smart-menu-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ChefHat, Salad, Cookie, Lightbulb } from 'lucide-react';

const formSchema = z.object({
  dietaryNeeds: z.string().min(1, { message: 'Please enter dietary needs.' }),
  healthData: z.string().min(1, { message: 'Please enter health data.' }),
  availableIngredients: z.string().min(1, { message: 'Please enter available ingredients.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function SmartMenuPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartMenuOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryNeeds: 'Diabetic, low-sodium',
      healthData: 'Last reading: Glucose 140 mg/dL',
      availableIngredients: 'Salmon, asparagus, lemon, chicken, mixed greens, quinoa, olive oil, berries, yogurt, almonds',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await generateSmartMenu(data);
      setResult(aiResult);
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate menu. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getCourseIcon = (course: string) => {
    switch (course) {
      case 'Appetizer':
        return <Salad className="h-6 w-6 text-primary" />;
      case 'Main Course':
        return <ChefHat className="h-6 w-6 text-primary" />;
      case 'Dessert':
        return <Cookie className="h-6 w-6 text-primary" />;
      default:
        return <Sparkles className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
           <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Smart Menu AI</CardTitle>
              <CardDescription>
                Generate personalized menus based on guest needs, health data, and your current inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="dietaryNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Dietary Needs</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Vegetarian, Gluten-Free" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wearable Health Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Glucose levels, heart rate, allergies..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableIngredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Ingredients</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Salmon, broccoli, olive oil..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} size="lg" className="w-full">
                    {loading ? <><Loader2 className="mr-2 animate-spin" /> Generating...</> : <><Sparkles className="mr-2"/>Generate Menu</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-2xl font-headline font-bold mt-4">The AI chef is crafting a menu...</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">Analyzing the guest profile and your inventory to create a perfectly balanced and delicious three-course meal.</p>
            </div>
          )}

          {!loading && !result && (
             <Card className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-accent/50 border-dashed">
                <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
                  <ChefHat className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Your Personalized Menu Awaits</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Enter a guest's dietary needs, health data, and your kitchen's inventory to see Gastronomic AI in action.</p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6">
              <h2 className="text-3xl font-headline font-bold">AI-Generated Smart Menu</h2>
              {result.menu.map((dish, index) => (
                <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {getCourseIcon(dish.course)}
                      <div>
                        <CardTitle className="font-headline text-2xl">{dish.name}</CardTitle>
                        <CardDescription>{dish.course}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{dish.description}</p>
                     <div className="flex items-start gap-3 text-sm text-muted-foreground bg-accent p-3 rounded-md">
                        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80"/>
                        <p><span className="font-semibold text-foreground">Chef's Reasoning:</span> {dish.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
