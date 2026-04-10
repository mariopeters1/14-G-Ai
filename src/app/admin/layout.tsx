"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import { Mail, MessageSquare, UtensilsCrossed, Sparkles, Users, Archive, UserCog, Receipt, ClipboardList, FileText, BarChart4, Bot, BellRing, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import './legacy-dashboard.css';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate high-adrenaline live POS/Reservation notifications
    const intervals = [
        setTimeout(() => toast({
            title: "🔔 New VIP Reservation",
            description: "Table 4 - 'John Doe' party of 4 at 7:30 PM.",
            variant: "default",
        }), 8000),
        setInterval(() => {
            if (Math.random() > 0.5) {
                toast({
                    title: "🧾 Incoming Web Order",
                    description: `Order #${Math.floor(1000 + Math.random() * 9000)} - $${(Math.random() * 150 + 20).toFixed(2)} received.`,
                });
            } else if (Math.random() > 0.8) {
               toast({
                    title: "⚠️ Inventory Alert",
                    description: "Wagyu Beef stock is running low. AI reorder suggested.",
                    variant: "destructive"
                });
            }
        }, 25000)
    ];

    return () => {
        clearTimeout(intervals[0]);
        clearInterval(intervals[1]);
    };
  }, [toast]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold font-headline">
              Gastronomic AI <span className="text-muted-foreground font-normal">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
             <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Back to Site
            </Link>
          </div>
        </div>
      </header>
      <main>
         <div className="border-b">
            <nav className="container flex items-center gap-6 text-sm font-medium overflow-x-auto">
                <Link
                    href="/admin"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Mail className="h-4 w-4" />
                    Contact Messages
                </Link>
                <Link
                    href="/admin/reservations"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/reservations' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Users className="h-4 w-4" />
                    Reservations
                </Link>
                 <Link
                    href="/admin/sales"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/sales' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Receipt className="h-4 w-4" />
                    Sales & POS
                </Link>
                <Link
                    href="/admin/reports"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/reports' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <BarChart4 className="h-4 w-4" />
                    Reports & Analytics
                </Link>
                <Link
                    href="/admin/staff"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/staff' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <UserCog className="h-4 w-4" />
                    Staff Scheduler
                </Link>
                 <Link
                    href="/admin/inventory"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/inventory' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Archive className="h-4 w-4" />
                    Inventory AI
                </Link>
                <Link
                    href="/admin/menu"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/menu' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <ClipboardList className="h-4 w-4" />
                    Menu Editor
                </Link>
                <Link
                    href="/admin/feedback"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/feedback' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <MessageSquare className="h-4 w-4" />
                    Customer Feedback
                </Link>
                 <Link
                    href="/admin/ai-chef"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/ai-chef' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Bot className="h-4 w-4" />
                    Chef Mario Peters
                </Link>
                <Link
                    href="/admin/formula86"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/formula86' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <UtensilsCrossed className="h-4 w-4" />
                    Formula-86
                </Link>
                 <Link
                    href="/admin/smart-menu"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/smart-menu' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <ChefHat className="h-4 w-4" />
                    Smart Menu
                </Link>
            </nav>
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
