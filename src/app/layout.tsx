import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Gastronomic AI',
  description: 'Where Culinary Art Meets Intelligent Innovation.',
};

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("!scroll-smooth", fontBody.variable, fontHeadline.variable)}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
