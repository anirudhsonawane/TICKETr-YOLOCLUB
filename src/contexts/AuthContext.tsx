'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Types
interface User {
  _id: string;
  id: string; // For compatibility with existing code
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

// Simple JWT-like token generation for local storage
const generateSimpleToken = (userId: string) => {
  return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
};

const parseSimpleToken = (token: string) => {
  try {
    return JSON.parse(atob(token));
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
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Get token from localStorage or cookies (for middleware compatibility)
        const storedToken = localStorage.getItem('token') || 
                           document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          const tokenData = parseSimpleToken(storedToken);
          
          // Check if token is valid and matches user (using userId or _id)
          if (tokenData && (tokenData.userId === userData.userId || tokenData.userId === userData._id)) {
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

    initializeAuth();
  }, []);

  // Clear auth state
  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
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
        const newToken = generateSimpleToken(user.user.userId);
        
        setTokenWithPersistence(newToken);
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
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      const user = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      }).then(res => res.json());

      if (user.success) {
        const newToken = generateSimpleToken(user.user.userId);
        
        setTokenWithPersistence(newToken);
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
  };

  // Logout function
  const logout = async () => {
    // Clear the local auth state
    clearAuthState();
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
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
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
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
  };

  // Enhanced setToken function that persists to localStorage and cookies
  const setTokenWithPersistence = (newToken: string | null) => {
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
  };

  // Enhanced setUser function that persists to localStorage
  const setUserWithPersistence = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
    }
  };

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
