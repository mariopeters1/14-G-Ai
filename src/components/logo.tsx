import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

const Logo = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={cn("w-10 h-10 drop-shadow-md transition-transform duration-500 hover:scale-105", className)}
    {...props}
  >
    <defs>
      <linearGradient id="gold-gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF1B8" />
        <stop offset="40%" stopColor="#FFC01E" />
        <stop offset="100%" stopColor="#CC8B00" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <g filter="url(#glow)">
        {/* --- Fluff Puffs --- */}
        {/* Highest center puff */}
        <circle cx="50" cy="25" r="20" fill="url(#gold-gradient-logo)" />
        {/* Upper left puff */}
        <circle cx="30" cy="35" r="18" fill="url(#gold-gradient-logo)" />
        {/* Upper right puff */}
        <circle cx="70" cy="35" r="18" fill="url(#gold-gradient-logo)" />
        {/* Lower left puff */}
        <circle cx="18" cy="55" r="16" fill="url(#gold-gradient-logo)" />
        {/* Lower right puff */}
        <circle cx="82" cy="55" r="16" fill="url(#gold-gradient-logo)" />
        
        {/* Filler to connect the puffs to the band solidly */}
        <path d="M 14 55 L 86 55 L 75 80 L 25 80 Z" fill="url(#gold-gradient-logo)" />
        <circle cx="50" cy="45" r="25" fill="url(#gold-gradient-logo)" />

        {/* --- Background / Cut-outs for Pleats (#141922) --- */}
        {/* We use thick lines starting from the base curving upward to simulate folds */}
        <path d="M 33 80 Q 30 65 31 55" stroke="#141922" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 41 80 Q 40 60 43 45" stroke="#141922" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 50 80 Q 50 55 50 40" stroke="#141922" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 59 80 Q 60 60 57 45" stroke="#141922" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 67 80 Q 70 65 69 55" stroke="#141922" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* --- The Bottom Band --- */}
        <path d="M 28 80 L 72 80 C 74 80 75 81 75 83 L 75 92 C 75 94 74 95 72 95 L 28 95 C 26 95 25 94 25 92 L 25 83 C 25 81 26 80 28 80 Z" fill="url(#gold-gradient-logo)" />
        
        {/* Subtle horizontal line in the band for detail */}
        <line x1="28" y1="87.5" x2="72" y2="87.5" stroke="#141922" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

export default Logo;
