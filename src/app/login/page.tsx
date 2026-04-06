"use client";

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && user) {
      // If user is already logged in, redirect them.
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    setAuthError(null); // Clear previous errors
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      // This will trigger the onAuthStateChanged listener in the provider,
      // which will update the user state and trigger the useEffect above.
      toast({
        title: "Sign-in successful",
        description: `Welcome, ${result.user.displayName}!`,
      });
      // The useEffect will handle the redirect.
    } catch (error: any) {
      console.error('Error during sign-in popup:', error);

      // Don't show the generic "unauthorized-domain" error, as it's not actionable for the end-user.
      // Show a more user-friendly message with instructions.
      if (error.code === 'auth/unauthorized-domain') {
         setAuthError('This app\'s domain is not authorized. Please go to the Firebase Console -> Authentication -> Settings -> Authorized domains, and add the domain you are using to preview the app.');
      } else {
         toast({
            variant: 'destructive',
            title: 'Sign-in failed',
            description: error.message || 'There was a problem signing you in. Please try again.',
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show a loading spinner while checking auth state or during the sign-in attempt
  if (isUserLoading || isSigningIn || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 z-10"
        >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
              <Logo className="h-20 w-20 relative z-10 drop-shadow-[0_0_15px_rgba(255,192,30,0.8)]" />
            </div>
            <Loader2 className="h-10 w-10 animate-spin text-primary drop-shadow-[0_0_8px_rgba(255,192,30,0.5)]" />
            <p className="text-white/60 font-light tracking-wide uppercase text-sm">
              {user ? 'Redirecting...' : isSigningIn ? 'Authenticating...' : 'Initializing...'}
            </p>
        </motion.div>
      </div>
    );
  }
  
  // If we're not loading and the user is not logged in, show the login page.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="items-center text-center pt-10 pb-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Logo className="h-16 w-16 relative z-10 drop-shadow-[0_0_10px_rgba(255,192,30,0.6)]" />
              </div>
            <CardTitle className="font-headline text-3xl font-bold text-white tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-white/60 mt-2 text-md">
              Authenticate via Google to access your kitchen's command center.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {authError && (
              <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-900/50 text-red-200">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  {authError}
                </AlertDescription>
              </Alert>
            )}
            <Button 
              className="w-full h-14 bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-white transition-all duration-300 relative overflow-hidden group shadow-[0_0_15px_rgba(255,192,30,0.1)] hover:shadow-[0_0_25px_rgba(255,192,30,0.3)]" 
              onClick={handleSignIn} 
              disabled={!auth}
              variant="outline"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <svg className="mr-3 h-5 w-5 bg-white rounded-full p-0.5" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-semibold tracking-wide">Continue with Google</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
