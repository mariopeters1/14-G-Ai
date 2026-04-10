'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { askAiChef } from '@/ai/flows/ai-chef-flow';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Bot, User, Loader2, Mic, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockSalesData = [
  { day: 'Mon', sales: 4000 },
  { day: 'Tue', sales: 3000 },
  { day: 'Wed', sales: 5000 },
  { day: 'Thu', sales: 8000 },
  { day: 'Fri', sales: 12000 },
  { day: 'Sat', sales: 15000 },
  { day: 'Sun', sales: 10000 },
];

const chatFormSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

type ChatFormData = z.infer<typeof chatFormSchema>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp;
}

export default function AiChefChatPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatFormData>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: '',
    },
  });

  // Listen for new messages in Firestore
  useEffect(() => {
    if (!firestore) return;

    const messagesRef = collection(firestore, 'ai-chef-chat/main-chat/messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch chat history. Please refresh the page.",
      });
    });

    return () => unsubscribe();
  }, [firestore, toast]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);


  const handleSendMessage = async (data: ChatFormData) => {
    if (!firestore) return;

    const userMessage = data.message.trim();
    form.reset();

    // Add user message to Firestore
    const messagesRef = collection(firestore, 'ai-chef-chat/main-chat/messages');
    try {
      await addDoc(messagesRef, {
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      setIsAiTyping(true);

      // Simulate intercepting "show me a chart" or "sales" to demo Generative UI
      if (userMessage.toLowerCase().includes('chart') || userMessage.toLowerCase().includes('sales')) {
         setTimeout(async () => {
             await addDoc(messagesRef, {
                text: "Here is the sales chart for the last 7 days. We're seeing a strong weekend push.\n[RENDER_SALES_CHART]",
                sender: 'ai',
                timestamp: serverTimestamp(),
            });
            setIsAiTyping(false);
         }, 1500);
         return;
      }

      // Call AI flow
      const aiResponse = await askAiChef({ message: userMessage });

      // Add AI response to Firestore
      await addDoc(messagesRef, {
        text: aiResponse.response,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error sending message or getting AI response:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message or get a response from the AI.',
      });
    } finally {
        setIsAiTyping(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto h-[80vh] flex flex-col">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
              <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
            </Avatar>
            <div>
                Chef Mario Peters <span className="text-sm font-normal text-muted-foreground ml-2">Gastronomic AI</span>
            </div>
          </CardTitle>
          <CardDescription>
            Ask me to 'Show the sales chart' or anything about kitchen operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
             <div className="p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-start gap-3", msg.sender === 'user' && 'justify-end')}>
                  {msg.sender === 'ai' && (
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
                      <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-xl shadow-sm border", 
                     msg.sender === 'ai' ? 'bg-secondary/50 border-border' : 'bg-primary text-primary-foreground border-primary')}>
                     <div className="text-sm space-y-4">
                        {msg.text.includes('[RENDER_SALES_CHART]') ? (
                            <>
                                <p>{msg.text.replace('[RENDER_SALES_CHART]', '').trim()}</p>
                                <div className="h-48 w-full mt-4 bg-background rounded-lg border p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockSalesData}>
                                            <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
                                            {/* <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} /> */}
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        )}
                     </div>
                  </div>
                   {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isAiTyping && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
                      <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs p-3 rounded-lg bg-secondary flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                        <span className="text-sm text-muted-foreground">AI Chef is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Ask the AI Chef..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="px-8 shadow-md" disabled={isAiTyping}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
