"use client";

import { DollarSign, Zap, Scale, ChefHat, Sparkles, BrainCircuit } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5, delay }}
    className="group flex items-start space-x-5 p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-primary/30"
  >
    <div className="bg-gradient-to-br from-primary/20 to-transparent text-primary p-4 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
      <Icon className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,192,30,0.8)]" />
    </div>
    <div>
      <h3 className="text-xl font-semibold font-headline text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-white/60 leading-relaxed font-light">{description}</p>
    </div>
  </motion.div>
);

export default function ProblemPromise() {
  return (
    <section id="features" className="relative bg-background py-24 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          
          {/* The Pains Section */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">The Dilemma</div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-white">The Status Quo<br/><span className="text-white/40">Is Flawed.</span></h2>
            </motion.div>
            
            <div className="space-y-6">
              <FeatureCard 
                icon={DollarSign}
                title="Rising Labor Costs"
                description="Manual prep scheduling and inventory management are time-consuming and prone to error, driving up overhead."
                delay={0.1}
              />
              <FeatureCard 
                icon={Scale}
                title="Menu Complexity"
                description="Catering to diverse dietary needs without compromising creativity is a constant, high-stakes balancing act."
                delay={0.2}
              />
              <FeatureCard 
                icon={Zap}
                title="Operational Anxiety"
                description="Guests worry about their needs being met, and staff stress over executing every complex order perfectly."
                delay={0.3}
              />
            </div>
          </div>

          {/* The Promises Section */}
          <div className="space-y-8">
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary tracking-wide uppercase shadow-[0_0_15px_rgba(255,192,30,0.15)]">The Solution</div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter text-white">Intelligent Design.<br/><span className="text-primary drop-shadow-[0_0_10px_rgba(255,192,30,0.3)]">Flawless Execution.</span></h2>
            </motion.div>

            <div className="space-y-6">
               <FeatureCard 
                icon={ChefHat}
                title="Automated Prep Workflows"
                description="Optimize your entire kitchen workflow with AI-driven task management, reducing waste and saving valuable floor hours."
                delay={0.4}
              />
              <FeatureCard 
                icon={Sparkles}
                title="AI-Assisted Curation"
                description="Instantly generate personalized menus that astonish guests and dynamically utilize your active inventory."
                delay={0.5}
              />
              <FeatureCard 
                icon={BrainCircuit}
                title="Real-time Guest Insights"
                description="Leverage preferences and dietary profiles to provide a genuinely bespoke dining experience every single time."
                delay={0.6}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
