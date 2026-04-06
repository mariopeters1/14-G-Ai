"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/logo';
import { Mail, MessageSquare, UtensilsCrossed, Sparkles, Users, Archive, UserCog, Receipt, ClipboardList, FileText, BarChart4, Bot } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

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
                    AI Chef Chat
                </Link>
                <Link
                    href="/admin/formula86"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/formula86' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <UtensilsCrossed className="h-4 w-4" />
                    Formula-86 AI
                </Link>
                 <Link
                    href="/admin/smart-menu"
                    className={`flex items-center gap-2 py-4 px-1 transition-colors hover:text-primary whitespace-nowrap ${pathname === '/admin/smart-menu' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
                >
                    <Sparkles className="h-4 w-4" />
                    Smart Menu AI
                </Link>
            </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
