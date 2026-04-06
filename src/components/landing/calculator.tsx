"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// NOTE: The following calculation is for illustrative purposes.
const HOURLY_LABOR_RATE = 20; // in dollars
const ANNUAL_HOURS_SAVED_PER_MENU_ITEM = 10;
const ANNUAL_EXTRA_REVENUE_PER_DAILY_COVER = 50;

const formSchema = z.object({
  seats: z.coerce.number().positive({ message: "Number of seats must be positive." }).int(),
  dailyCovers: z.coerce.number().positive({ message: "Average daily covers must be positive." }).int(),
  menuItems: z.coerce.number().positive({ message: "Number of menu items must be positive." }).int(),
  firstName: z.string().min(1, { message: "Please enter your first name." }),
  lastName: z.string().min(1, { message: "Please enter your last name." }),
  businessName: z.string().min(1, { message: "Please enter your business name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormData = z.infer<typeof formSchema>;

export default function Calculator() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [projectedSavings, setProjectedSavings] = useState({
    annualSavings: 0,
    laborHours: 0,
    extraRevenue: 0,
  });
  const [hasCalculated, setHasCalculated] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seats: 50,
      dailyCovers: 100,
      menuItems: 25,
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
    },
  });

  const { watch, formState: { isValid } } = form;
  const seats = watch("seats");
  const dailyCovers = watch("dailyCovers");
  const menuItems = watch("menuItems");

  useEffect(() => {
    const validSeats = seats > 0 ? seats : 0;
    const validDailyCovers = dailyCovers > 0 ? dailyCovers : 0;
    const validMenuItems = menuItems > 0 ? menuItems : 0;

    const laborHours = validMenuItems * ANNUAL_HOURS_SAVED_PER_MENU_ITEM;
    const extraRevenue = validDailyCovers * ANNUAL_EXTRA_REVENUE_PER_DAILY_COVER;
    const laborCostSavings = laborHours * HOURLY_LABOR_RATE;
    const newAnnualSavings = laborCostSavings + extraRevenue;
    
    setProjectedSavings({ annualSavings: newAnnualSavings, laborHours, extraRevenue });
    setHasCalculated(true);

  }, [seats, dailyCovers, menuItems]);

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "costSavingsLeads"), {
        ...data,
        ...projectedSavings,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Report on its way!",
        description: "We've sent the detailed cost-savings report to your email.",
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem submitting your request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="calculator" className="bg-background py-24 relative overflow-hidden border-y border-white/5">
      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
                <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">ROI Calculator</div>
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-white tracking-tight">Project Your Savings</h2>
                 <p className="text-white/60 text-lg font-light leading-relaxed">
                    Our Interactive Cost-Savings Calculator demonstrates how Gastronomic AI can directly impact your bottom line. Add your restaurant's details to get a personalized projection of your potential annual savings.
                </p>
                 <div className="space-y-6 pt-4">
                    <h3 className="font-headline text-xl font-bold text-white">Estimated Annual Savings</h3>
                    <p className={cn(
                    "text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-[0_0_10px_rgba(255,192,30,0.3)] transition-all duration-500",
                    hasCalculated ? "scale-100" : "opacity-50 scale-95"
                    )}>
                    ${projectedSavings.annualSavings.toLocaleString()}
                    </p>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <p className="text-sm font-light text-white/50 tracking-wide uppercase">Labor Hours Saved</p>
                            <p className="text-3xl font-bold text-white mt-2">{projectedSavings.laborHours.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <p className="text-sm font-light text-white/50 tracking-wide uppercase">Extra Revenue</p>
                            <p className="text-3xl font-bold text-white mt-2">${projectedSavings.extraRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-[0_0_40px_rgba(255,192,30,0.1)] border-white/10 bg-black/40 backdrop-blur-lg">
                  <CardHeader className="pb-4 border-b border-white/10">
                  <CardTitle className="font-headline text-2xl text-white">Get Your Free Report</CardTitle>
                  <CardDescription className="text-white/50">
                      Fill out the form for a detailed breakdown emailed to you.
                  </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                          control={form.control}
                          name="seats"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Seats</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" type="number" placeholder="50" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="dailyCovers"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Daily Covers</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" type="number" placeholder="100" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="menuItems"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Menu Items</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" type="number" placeholder="25" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">First Name</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Last Name</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Business Name</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-white/70">Your Email</FormLabel>
                              <FormControl>
                                  <Input className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50" type="email" placeholder="you@restaurant.com" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </div>
                      <Button type="submit" className="w-full h-12 bg-primary text-background hover:bg-white hover:text-background transition-colors" size="lg" disabled={loading || !isValid}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Generate Full Report
                      </Button>
                      </form>
                  </Form>
                  </CardContent>
              </Card>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
