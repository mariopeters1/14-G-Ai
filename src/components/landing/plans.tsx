"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Plans() {
  const plans = [
    {
      name: "Prototype",
      price: "Free",
      description: "For small teams testing the waters.",
      features: ["AI Menu Generation", "Basic Inventory", "1 Location"],
    },
    {
      name: "Pilot",
      price: "Custom",
      description: "For growing restaurants ready to scale.",
      features: ["All Prototype features", "Live Dashboard", "Wearable Integration", "Priority Support"],
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "Let's Talk",
      description: "For large-scale operations and chains.",
      features: ["All Pilot features", "Multi-location Sync", "Dedicated Account Manager", "API Access"],
    },
  ];

  return (
    <section id="plans" className="relative py-24 bg-background overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute bottom-1/2 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center space-y-4 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">Partnerships</div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl lg:text-6xl text-white">Find the Perfect Fit</h2>
          <p className="max-w-[700px] text-white/60 text-lg md:text-xl font-light mt-4">
            Join our exclusive waitlist to secure lifetime pilot rates as a founding partner.
          </p>
        </motion.div>
        
        <div className="mx-auto mt-16 grid max-w-md gap-8 lg:max-w-5xl lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="h-full"
            >
              <Card className={cn(
                "relative flex flex-col h-full bg-black/40 backdrop-blur-sm border transition-all duration-500 overflow-hidden group",
                 plan.isPopular ? "border-primary/50 shadow-[0_0_30px_rgba(255,192,30,0.15)] hover:shadow-[0_0_40px_rgba(255,192,30,0.3)] scale-105 z-10" : "border-white/10 hover:border-white/30 hover:-translate-y-2"
              )}>
                
                {plan.isPopular && (
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                )}

                {plan.isPopular && (
                  <div className="text-center py-2 px-4 bg-gradient-to-r from-primary to-accent text-background font-bold text-sm tracking-widest uppercase">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="relative z-10 text-center pb-8 pt-8">
                  <CardTitle className="font-headline text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white/60 mt-2">{plan.description}</CardDescription>
                  <div className={cn("text-5xl font-bold pt-6 tracking-tight", plan.isPopular ? "text-primary drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]" : "text-white")}>
                    {plan.price}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 relative z-10 px-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className={cn("h-5 w-5 mt-0.5 flex-shrink-0", plan.isPopular ? "text-primary" : "text-white/40")} />
                        <span className="text-white/80 font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative z-10 pt-8 pb-8 px-8">
                  <Button className={cn("w-full h-14 text-lg rounded-full transition-all duration-300", plan.isPopular ? "bg-primary text-background hover:bg-white hover:text-background shadow-[0_0_20px_rgba(255,192,30,0.3)]" : "bg-white/5 text-white hover:bg-white/10 border border-white/10")} asChild variant={plan.isPopular ? 'default' : 'outline'}>
                    <Link href="#contact">Join Waitlist</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
