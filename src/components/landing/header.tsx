"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/10 py-2 shadow-lg" : "bg-transparent py-4"
      }`}
    >
      <div className="container flex items-center justify-between mx-auto px-4 md:px-6 max-w-7xl">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover:bg-primary/40 transition-all duration-300"></div>
            <Logo className="h-10 w-10 relative z-10 drop-shadow-[0_0_8px_rgba(255,192,30,0.8)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold font-headline text-lg tracking-wide text-white group-hover:text-primary transition-colors">
              Gastronomic AI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary/80 hidden sm:inline-block">
              Floridian Modern Cuisine
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link href="#how-it-works" className="text-white/70 transition-colors hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]">How It Works</Link>
            <Link href="#features" className="text-white/70 transition-colors hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]">Features</Link>
            <Link href="#plans" className="text-white/70 transition-colors hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]">Plans</Link>
            <Link href="/careers" className="text-white/70 transition-colors hover:text-primary hover:drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]">Careers</Link>
          </nav>
          <Button asChild className="rounded-full px-6 bg-white border border-white/20 text-background hover:bg-primary hover:text-background hover:border-primary transition-all duration-300">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
