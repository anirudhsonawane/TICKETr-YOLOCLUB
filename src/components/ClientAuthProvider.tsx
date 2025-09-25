'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';

interface ClientAuthProviderProps {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by only rendering AuthProvider on client
  if (!isClient) {
    return <>{children}</>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
