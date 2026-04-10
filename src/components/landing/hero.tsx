"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/logo";

export default function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center text-center overflow-hidden">
      {/* Cinematic Background Video */}
      <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FVideo%2FReady_House_Music_Cue%20salmon.mp4?alt=media&token=0b26e351-3a7f-4777-8af3-7942efdc542a"
      />

      {/* Dark Overlay to maintain readability and theme */}
      <div className="absolute inset-0 bg-background/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/80 z-10 pointer-events-none" />
      
      {/* Glowing Orb Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] z-15 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[150px] z-15 mix-blend-screen pointer-events-none" />
      
      <div className="absolute inset-0 z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-overlay" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="container relative z-20 flex flex-col items-center px-4 md:px-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium border border-primary/50 text-primary bg-primary/10 rounded-full">
          <Logo className="!w-5 !h-5 drop-shadow-none" />
          <span>The Next Evolution of Culinary</span>
        </div>

        <div className="max-w-4xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-5xl font-headline font-bold mb-4 tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/80 to-white pb-2"
          >
            Where Culinary Art <br className="hidden md:block"/>
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,192,30,0.5)]">Meets Intelligence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto"
          >
            Personalized menus, precision operations, and unrivaled guest delight. 
            Elevate your establishment with Gastronomic AI.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center items-center"
        >
          <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(255,192,30,0.3)] hover:shadow-[0_0_30px_rgba(255,192,30,0.5)] transition-all duration-300" asChild>
            <Link href="#contact-us">Request a Demo</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300" asChild>
            <Link href="/roadmap">Discover Formula-86</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild className="h-14 px-6 text-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-all duration-300 border border-transparent hover:border-primary/30">
            <Link href="#contact-us">
              <TrendingUp className="mr-2 text-primary" />
              <span className="font-semibold tracking-wide">Invest in Gastronomic AI</span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
