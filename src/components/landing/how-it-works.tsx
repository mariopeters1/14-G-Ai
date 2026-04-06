"use client";

import { Database, CloudCog, HeartPulse, ChefHat } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    { icon: Database, title: "1. Collect Data", desc: "Integrate wearables, POS systems, and real-time inventory." },
    { icon: CloudCog, title: "2. Predict & Process", desc: "Cloud functions and AI models analyze data to find patterns." },
    { icon: HeartPulse, title: "3. Delight Guests", desc: "Deliver smart menus and personalized recommendations instantly." },
    { icon: ChefHat, title: "4. Optimize Ops", desc: "Use live dashboards and inventory alerts to stay ahead of the rush." },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-background border-t border-white/5 overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">The Workflow</div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl lg:text-6xl text-white">
            A Seamless Flow <br/> <span className="text-primary drop-shadow-[0_0_10px_rgba(255,192,30,0.3)]">From Data to Delight.</span>
          </h2>
          <p className="max-w-[700px] text-white/60 text-lg md:text-xl font-light mt-4">
            Our platform integrates every aspect of your culinary operation into one intelligent, self-optimizing ecosystem.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-20 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-[3rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative group grid gap-4 text-center"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background border border-primary/20 text-primary mb-2 shadow-[0_0_15px_rgba(255,192,30,0.1)] group-hover:shadow-[0_0_30px_rgba(255,192,30,0.3)] group-hover:border-primary/50 transition-all duration-500 z-10 relative">
                <div className="absolute inset-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-500" />
                <step.icon className="h-10 w-10 relative z-10 drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]" />
              </div>
              <h3 className="text-xl font-bold font-headline text-white group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-md text-white/60 font-light px-4">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
