'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Types
interface User {
  _id: string;
  id: string; // For compatibility with existing code
  userId?: string; // For backend compatibility
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'seller';
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT token validation
const parseJWTToken = (token: string) => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Always check if we're on the client side
        if (typeof window === 'undefined') {
          return;
        }

        // Get token from localStorage or cookies (for middleware compatibility)
        const storedToken = localStorage.getItem('token') || 
                           document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          const tokenData = parseJWTToken(storedToken);
          
          // Check if token is valid and matches user (using userId or _id)
          if (tokenData && (tokenData.id === userData.userId || tokenData.id === userData._id)) {
            setToken(storedToken);
            setUser({ ...userData, id: userData.userId || userData._id }); // Ensure id exists
          } else {
            // Token is invalid, clear auth state
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Enhanced setToken function that persists to localStorage and cookies
  const setTokenWithPersistence = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('token', newToken);
        // Also set cookie for middleware
        document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      } else {
        localStorage.removeItem('token');
        // Remove cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, []);

  // Enhanced setUser function that persists to localStorage
  const setUserWithPersistence = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Clear auth state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      // For now, we'll use a simple approach since Convex doesn't have bcrypt
      // In production, you'd want to implement proper password hashing
      const user = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(res => res.json());

      if (user.success) {
        // Use the JWT token from the backend
        setTokenWithPersistence(user.token);
        setUserWithPersistence({ ...user.user, id: user.user.userId });

        return { success: true };
      } else {
        return { success: false, message: user.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, message: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, [setTokenWithPersistence, setUserWithPersistence]);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      const user = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      }).then(res => res.json());

      if (user.success) {
        // Use the JWT token from the backend
        setTokenWithPersistence(user.token);
        setUserWithPersistence({ ...user.user, id: user.user.userId });

        return { success: true };
      } else {
        return { success: false, message: user.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, [setTokenWithPersistence, setUserWithPersistence]);

  // Logout function
  const logout = useCallback(async () => {
    // Clear the local auth state
    clearAuthState();
  }, [clearAuthState]);

  // Update user function
  const updateUser = useCallback(async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      }).then(res => res.json());

      if (response.success) {
        setUserWithPersistence(response.user);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Update failed' };
      }
    } catch (error: any) {
      return { success: false, message: 'Update failed' };
    }
  }, [token, setUserWithPersistence]);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());
      
      if (response.success) {
        setUserWithPersistence(response.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, [token, setUserWithPersistence]);

  // Handle OAuth callback
  const handleOAuthCallback = (token: string, user: User) => {
    setTokenWithPersistence(token);
    setUserWithPersistence({ ...user, id: user.userId || user._id }); // Add id for compatibility
  };

  // Expose OAuth callback function
  if (typeof window !== 'undefined') {
    (window as any).handleOAuthCallback = handleOAuthCallback;
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    setToken: setTokenWithPersistence,
    setUser: setUserWithPersistence
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Admin-only HOC
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return null;
    }

    return <Component {...props} />;
  };
}
