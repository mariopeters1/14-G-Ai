"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Utensils, Clock, Star, Users, ChefHat } from "lucide-react";

// ─── Animated Counter Hook ──────────────────────────────────────

function useCounter(end: number, duration: number = 2000, start: boolean = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return value;
}

// ─── KPI Data ───────────────────────────────────────────────────

const kpis = [
  {
    value: 40,
    suffix: "%",
    label: "Labor Cost Reduction",
    description: "Average savings on scheduling optimization",
    icon: TrendingUp,
    color: "#10B981",
  },
  {
    value: 3,
    suffix: "x",
    label: "Revenue Multiplier",
    description: "Increase in personalized upsell conversion",
    icon: Utensils,
    color: "#F59E0B",
  },
  {
    value: 98,
    suffix: "%",
    label: "Guest Satisfaction",
    description: "Across dietary personalization scores",
    icon: Star,
    color: "#8B5CF6",
  },
  {
    value: 15,
    suffix: "min",
    label: "Avg. Time Saved",
    description: "Per service with AI-automated prep workflows",
    icon: Clock,
    color: "#3B82F6",
  },
  {
    value: 500,
    suffix: "+",
    label: "Menu Variations",
    description: "Generated dynamically per season",
    icon: ChefHat,
    color: "#EC4899",
  },
  {
    value: 12,
    suffix: "K+",
    label: "Guest Profiles",
    description: "Tracked preferences & dietary needs",
    icon: Users,
    color: "#06B6D4",
  },
];

// ─── Single KPI Card ────────────────────────────────────────────

function KPICard({
  kpi,
  index,
  isVisible,
}: {
  kpi: (typeof kpis)[0];
  index: number;
  isVisible: boolean;
}) {
  const count = useCounter(kpi.value, 2200, isVisible);
  const Icon = kpi.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative text-center px-4 py-8"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at center, ${kpi.color}08 0%, transparent 70%)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Counter */}
      <div className="relative">
        <div className="text-4xl md:text-5xl font-light text-white tracking-tight font-mono">
          {count}
          <span style={{ color: kpi.color }} className="text-3xl md:text-4xl">{kpi.suffix}</span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 text-sm font-medium text-white/80 tracking-wide">{kpi.label}</div>
      <div className="mt-1 text-xs text-white/30 leading-relaxed max-w-[180px] mx-auto">{kpi.description}</div>

      {/* Bottom accent line */}
      <div
        className="w-8 h-0.5 mx-auto mt-5 rounded-full opacity-30 group-hover:opacity-100 group-hover:w-12 transition-all duration-500"
        style={{ backgroundColor: kpi.color }}
      />
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function KPIStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-background py-20 overflow-hidden" ref={ref}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-white/[0.01] to-background pointer-events-none" />

      {/* Top & bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-medium text-white/50 tracking-widest uppercase mb-4">
            Platform Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter text-white">
            Numbers That Speak <span className="text-primary drop-shadow-[0_0_10px_rgba(255,192,30,0.3)]">Volumes.</span>
          </h2>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} isVisible={isInView} />
          ))}
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      </div>
    </section>
  );
}
