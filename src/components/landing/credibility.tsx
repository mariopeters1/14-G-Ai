"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Credibility() {
  return (
    <section className="bg-background py-24 border-y border-white/5 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
        <div className="mx-auto grid items-center gap-16 lg:grid-cols-2">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="relative">
              <span className="absolute -top-10 -left-6 text-[100px] text-white/5 font-serif leading-none">"</span>
              <blockquote className="text-3xl font-semibold font-headline leading-tight lg:text-4xl lg:leading-snug text-white relative z-10">
                I wanted a sous-chef that never sleeps and a concierge who knows every guest’s needs. <span className="text-primary">We built both in one app.</span>
              </blockquote>
            </div>
            <div className="flex items-center gap-6 mt-8">
                <div className="relative w-24 sm:w-32 shadow-lg drop-shadow-[0_0_15px_rgba(255,192,30,0.2)] rounded-lg overflow-hidden shrink-0">
                  <img 
                      src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842"
                      alt="Chef Mario Peters"
                      className="w-full h-auto object-contain"
                  />
                </div>
                <div>
                    <div className="font-semibold text-xl text-white">Chef Mario Peters</div>
                    <div className="text-sm font-light text-primary tracking-wide uppercase mt-1">Founder, Gastronomic AI</div>
                </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full relative"
          >
            <div className="grid grid-cols-2 gap-4">
                {/* Big Main Image - Bartender now gets the massive spotlight */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-2xl border border-white/10 group">
                   <motion.div
                      animate={{ 
                        scale: [1.4, 1.4, 1.4], 
                        y: ["18%", "-18%", "18%"] // Deep cinematic pan top to bottom
                      }}
                      transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
                      className="absolute inset-0 w-full h-full"
                   >
                     <Image
                        src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FBartender%2001.png?alt=media&token=df8b58ca-bf0e-4be9-80a8-faf70f327ea4"
                        alt="Bartender"
                        fill
                        className="object-cover object-center"
                     />
                   </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Stacked Sidebar Images */}
                <div className="grid gap-4">
                     <div className="relative overflow-hidden rounded-2xl aspect-[1.6/1] shadow-2xl border border-white/10 group">
                       <Image
                          src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FChefs.jpg?alt=media&token=77a75c99-4768-4b1d-a599-441112490480"
                          alt="Professional Chef"
                          fill
                          quality={100}
                          className="object-cover transition-transform duration-700 group-hover:scale-105 contrast-[1.15] saturate-[1.2] sepia-[.15]"
                          />
                       {/* Warm color grading overlay preserved for chef */}
                       <div className="absolute inset-0 bg-orange-950/20 mix-blend-color-burn pointer-events-none" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                     </div>

                     <div className="relative overflow-hidden rounded-2xl aspect-[1.6/1] shadow-2xl border border-white/10 group">
                       <Image
                          src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FConciergs.jpg?alt=media&token=2834be3d-7725-46df-a85a-000231ec6f5d"
                          alt="Concierge Desk"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                     </div>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
