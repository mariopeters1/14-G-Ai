'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';

type UserContextType = {
  user: User | any | null;
  loading: boolean;
};

const AuthContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for mock login events from the login page
    const handleMockLogin = () => {
      setUser({ uid: 'mock', email: 'director@gastronomic.ai', displayName: 'Mock Admin' });
    };
    window.addEventListener('mock-login', handleMockLogin);

    // Check if a mock session already exists in sessionStorage
    const existingSession = sessionStorage.getItem('gastronomic-pay-session');
    if (existingSession) {
      setUser(JSON.parse(existingSession));
    }

    setLoading(false);

    return () => {
      window.removeEventListener('mock-login', handleMockLogin);
    };
  }, []);

  // Persist mock session when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('gastronomic-pay-session', JSON.stringify(user));
    }
  }, [user]);

  // Route blocking: redirect to login if no user
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    } else if (!loading && user && pathname === '/login') {
      router.push('/admin/pay');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="h-screen flex-1 w-full bg-[#0D0D12] flex items-center justify-center">
        <div className="text-neutral-500 animate-pulse font-sans">Initializing Security Bounds...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
