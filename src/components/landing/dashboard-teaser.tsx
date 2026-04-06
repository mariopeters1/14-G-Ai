
"use client";

import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

// New component for the video player
const TeaserVideo = ({ src, playbackRate = 1 }: { src: string, playbackRate?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
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
  media: { src: string; hint: string; };
  playbackRate?: number;
};

export default function DashboardTeaser() {
  const teasers: Teaser[] = [
    {
      key: "guest-view",
      title: "Personalized Guest View",
      description: "Shows a diabetic diner’s low-sugar recommendations instantly.",
      media: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FKitchen_Video_Peters.mp4?alt=media&token=05ea5be3-4ab2-40e7-b9ee-b645b4d4719c", hint: "personalized menu" },
      playbackRate: 1,
    },
    {
      key: "inventory",
      title: "Live Inventory Screen",
      description: "Highlights low-stock items like chili lime seasoning in real-time.",
      media: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FKitchen_Video_.mp4?alt=media&token=29cc82d2-dd59-4cb0-ae91-fb1ac1ef5004", hint: "inventory management" },
      playbackRate: 1,
    },
    {
      key: "prep-board",
      title: "Automated Prep Board",
      description: "Tasks are auto-color-coded for priority and status.",
      media: { src: "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FKitchen_Video_Chef%20MPmp4.mp4?alt=media&token=1a51770e-aac9-4ed3-8c42-04999bda844a", hint: "dashboard task" },
      playbackRate: 1,
    },
  ];

  const isVideo = (src: string) => {
    try {
        const url = new URL(src);
        return url.pathname.toLowerCase().endsWith('.mp4');
    } catch (e) {
        return false;
    }
  };

  return (
    <section className="bg-background py-24 relative overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">Command Center</div>
          <h2 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl lg:text-6xl text-white">
            Absolute Control.<br/><span className="text-white/40">Zero Latency.</span>
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
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-20 pointer-events-none" />
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto relative z-10"
          >
            <CarouselContent className="-ml-4">
              {teasers.map((teaser) => (
                <CarouselItem key={teaser.key} className="pl-4 md:basis-1/2 lg:basis-2/3">
                  <div className="p-2 group">
                    <div className="relative overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 aspect-video transition-all hover:border-primary/50 mb-6">
                      {isVideo(teaser.media.src) ? (
                        <TeaserVideo src={teaser.media.src} playbackRate={teaser.playbackRate} />
                      ) : (
                        <Image
                          src={teaser.media.src}
                          alt={teaser.title}
                          data-ai-hint={teaser.media.hint}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    
                    {/* Styled as a distinct sub-section */}
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 md:-left-6 w-12 h-12 bg-black/50 border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary transition-colors z-30 backdrop-blur-md" />
            <CarouselNext className="right-4 md:-right-6 w-12 h-12 bg-black/50 border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary transition-colors z-30 backdrop-blur-md" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
