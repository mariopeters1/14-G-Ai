'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestAlternatives, type Formula86Output } from '@/ai/flows/formula-86-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  ingredient: z.string().min(1, { message: 'Please enter an ingredient.' }),
  menu: z.string().min(1, { message: 'Please enter the current menu.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function Formula86Page() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Formula86Output | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredient: '',
      menu: 'Grilled Salmon with Asparagus, Lemon Chicken, Beef Steak with Mashed Potatoes, Tomato Soup, Caesar Salad with Chicken',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await suggestAlternatives(data);
      setResult(aiResult);
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to get suggestions. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Formula-86 AI</CardTitle>
            <CardDescription>
              When an ingredient is out of stock, enter it here to get smart menu alternatives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="ingredient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>86'd Ingredient</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tomatoes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Menu</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Dish one, Dish two, Dish three..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 animate-spin" />}
                  Get Suggestions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Formula-86 AI is thinking...</p>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h3 className="text-2xl font-headline font-bold mb-4">AI Recommendations</h3>
            {result.affectedDishes.length > 0 ? (
                <div className="space-y-4">
                {result.affectedDishes.map((dish, index) => (
                    <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{dish.dishName}</CardTitle>
                        <AlertTriangle className="text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{dish.reasoning}</p>
                        <div className="flex items-center gap-2 bg-accent p-3 rounded-md">
                            <Lightbulb className="text-primary"/>
                            <div>
                                <p className="font-semibold">Suggested Alternative:</p>
                                <p>{dish.suggestedAlternative}</p>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-lg">No dishes on your menu are affected by this shortage. Business as usual!</p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
