'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { analyzeFeedback, type CustomerFeedbackOutput } from '@/ai/flows/customer-feedback-analysis-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Sparkles,
  Lightbulb,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Meh,
  FileImage,
  X,
  ClipboardList,
  BrainCircuit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  feedbackText: z.string().min(10, { message: 'Please provide more detailed feedback.' }),
  photo: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

const SentimentDisplay = ({ sentiment }: { sentiment: CustomerFeedbackOutput['sentiment'] }) => {
    const sentimentConfig = {
        Positive: { icon: ThumbsUp, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50', label: 'Positive' },
        Negative: { icon: ThumbsDown, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Negative' },
        Mixed: { icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', label: 'Mixed' },
        Neutral: { icon: MessageSquare, color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Neutral' },
    };
    const config = sentimentConfig[sentiment];
    const Icon = config.icon;

    return (
         <Badge variant="outline" className={`text-lg gap-2 pl-2 pr-3 border-2 ${config.bgColor} ${config.color}`}>
            <Icon className="h-5 w-5" />
            <span className="font-semibold">{config.label}</span>
        </Badge>
    )
}

export default function CustomerFeedbackPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomerFeedbackOutput | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedbackText: "The service was incredibly slow, but the steak was the best I've ever had. The music was a bit too loud.",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
      setPhotoPreview(null);
      form.setValue('photo', undefined);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      let photoDataUri: string | undefined;
      if (data.photo) {
        photoDataUri = await fileToDataUri(data.photo);
      }
      const aiResult = await analyzeFeedback({ feedbackText: data.feedbackText, photoDataUri });
      setResult(aiResult);
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to analyze feedback. Please try again.',
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
                  <CardTitle className="font-headline text-2xl">AI Feedback Analysis</CardTitle>
                  <CardDescription>
                    Let AI analyze reviews to find actionable insights.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="feedbackText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Feedback Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'The service was incredibly slow...'"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Attach a Photo (optional)</FormLabel>
                    {photoPreview ? (
                        <div className="relative">
                            <Image src={photoPreview} alt="Photo preview" width={200} height={200} className="rounded-md w-full h-auto object-cover" />
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removePhoto}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ) : (
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                        </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                  <Button type="submit" disabled={loading} size="lg" className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" />
                        Get AI Analysis
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
                <h3 className="text-2xl font-headline font-bold mt-4">AI is reading the review...</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Analyzing sentiment, identifying key topics, and preparing actionable suggestions for you.</p>
            </div>
          )}

          {!loading && !result && (
             <Card className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-accent/50 border-dashed">
                <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Feedback Analysis Will Appear Here</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Paste a customer review into the form and let Gastronomic AI turn complaints and compliments into opportunities.</p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <CardTitle className="font-headline text-xl">Overall Sentiment</CardTitle>
                         <SentimentDisplay sentiment={result.sentiment} />
                    </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">{result.overallSummary}</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                            <ClipboardList/> Key Topics Identified
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {result.keyTopics.map((item, index) => (
                        <div key={index} className="p-3 rounded-md border bg-secondary/50">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold">{item.topic}</p>
                             <SentimentDisplay sentiment={item.sentiment as CustomerFeedbackOutput['sentiment']} />
                        </div>
                        <p className="text-sm text-muted-foreground italic">"{item.details}"</p>
                        </div>
                    ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2">
                           <Lightbulb/> Actionable Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {result.suggestedActions.map((rec, index) => (
                        <div key={index} className="p-3 rounded-md bg-accent">
                        <p className="font-semibold">{rec.action}</p>
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
