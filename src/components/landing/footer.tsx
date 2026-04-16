import Link from "next/link";
import Logo from "@/components/logo";
import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0 px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4">
          <Logo className="h-8 w-8 drop-shadow-[0_0_8px_rgba(255,192,30,0.8)]" />
          <p className="text-center text-sm leading-loose text-white/50 tracking-wide md:text-left">
            Built by Mario Peters. © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6">
            <Link href="/#features" className="text-sm font-medium text-white/70 transition-colors hover:text-primary">Features</Link>
            <Link href="/careers" className="text-sm font-medium text-white/70 transition-colors hover:text-primary">Careers</Link>
            <Link href="#contact-us" className="text-sm font-medium text-white/70 transition-colors hover:text-primary">Contact</Link>
            <Link href="#" className="text-sm font-medium text-white/70 transition-colors hover:text-primary">Investors</Link>
            <Link href="#" className="text-sm font-medium text-white/70 transition-colors hover:text-primary">Support</Link>
            <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <Link href="#" className="text-white/50 hover:text-primary transition-colors">
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                </Link>
                 <Link href="#" className="text-white/50 hover:text-primary transition-colors">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
