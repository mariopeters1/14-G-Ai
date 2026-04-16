"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const TeaserVideo = ({ src, playbackRate = 1 }: { src: string; playbackRate?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
};

type Teaser = {
  key: string;
  title: string;
  description: string;
  src: string;
  playbackRate?: number;
};

const teasers: Teaser[] = [
  {
    key: "guest-view",
    title: "Personalized Guest View",
    description: "Shows a diabetic diner's low-sugar recommendations instantly.",
    src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FKitchen_Video_Peters.mp4?alt=media&token=05ea5be3-4ab2-40e7-b9ee-b645b4d4719c",
    playbackRate: 1,
  },
  {
    key: "inventory",
    title: "Live Inventory Screen",
    description: "Highlights low-stock items like chili lime seasoning in real-time.",
    src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FChef%20Kitchen%20Command%20M%20Peters.mp4?alt=media&token=de78aa70-95f6-4d16-b0f3-460c7fdc1fa0",
    playbackRate: 1,
  },
  {
    key: "prep-board",
    title: "Automated Prep Board",
    description: "Tasks are auto-color-coded for priority and status.",
    src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FKitchen_Video_Chef%20MPmp4.mp4?alt=media&token=1a51770e-aac9-4ed3-8c42-04999bda844a",
    playbackRate: 1,
  },
];

export default function DashboardTeaser() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollTo = useCallback((idx: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[idx] as HTMLElement;
    if (child) {
      container.scrollTo({ left: child.offsetLeft - 16, behavior: "smooth" });
      setActiveIndex(idx);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const childWidth = (container.children[0] as HTMLElement)?.offsetWidth || 1;
    setActiveIndex(Math.round(scrollLeft / childWidth));
  }, []);

  return (
    <section className="bg-background py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">
            Command Center
          </div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl lg:text-6xl text-white">
            Absolute Control.<br />
            <span className="text-white/40">Zero Latency.</span>
          </h2>
          <p className="max-w-[700px] text-white/60 text-lg md:text-xl font-light mt-4">
            Everything updates in under two seconds thanks to Formula-86, ensuring your team is never out of sync.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          {/* Edge fade gradients */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {teasers.map((teaser) => (
              <div
                key={teaser.key}
                className="flex-shrink-0 w-[85%] md:w-[65%] snap-center group"
              >
                {/* Video */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 aspect-video transition-all hover:border-primary/50 mb-6"
                  style={{ boxShadow: "0 0 30px rgba(0,0,0,0.5)" }}
                >
                  <TeaserVideo src={teaser.src} playbackRate={teaser.playbackRate} />
                </div>

                {/* Info Card */}
                <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 relative overflow-hidden group-hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4 opacity-90">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,192,30,0.8)]" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Live Module</span>
                  </div>
                  <h3 className="font-semibold font-headline text-2xl md:text-3xl text-white group-hover:text-primary transition-colors duration-300">
                    {teaser.title}
                  </h3>
                  <p className="text-base md:text-lg text-white/50 font-light mt-3 leading-relaxed">
                    {teaser.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {teasers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === activeIndex ? "#D4A373" : "rgba(255,255,255,0.2)",
                    transform: i === activeIndex ? "scale(1.5)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => scrollTo(Math.min(teasers.length - 1, activeIndex + 1))}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
