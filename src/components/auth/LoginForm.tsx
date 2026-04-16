"use client";

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo Mode Override: Always bypass for demonstration
    setTimeout(() => {
      window.dispatchEvent(new Event('mock-login'));
    }, 500);
    return;
  };

  return (
    <form onSubmit={handleAuth} className="space-y-6 w-full max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Admin Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#10B981] transition-colors placeholder-neutral-600"
              placeholder="director@gastronomic.ai (Optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Secure Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#10B981] transition-colors placeholder-neutral-600"
              placeholder="•••••••• (Optional)"
            />
          </div>
        </div>
      </div>

      {error && (
         <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg text-[#EF4444] text-sm">
           {error}
         </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>{isSignUp ? 'Create Account' : 'Secure Login'} <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>

      {process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
        <p className="text-center text-xs text-neutral-500 mt-6">
          Running in Demo Mode. Click {isSignUp ? 'Create Account' : 'Secure Login'} to bypass.
        </p>
      )}
    </form>
  );
}
