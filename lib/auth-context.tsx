"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './auth-service';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  validateCurrentToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Validate token and set auth state
  const validateAndSetToken = async (storedToken: string, storedUser: string) => {
    try {
      const isValid = await authService.validateToken(storedToken);
      
      if (!isValid) {
        // Token is invalid, clear everything immediately
        console.warn('Stored token is invalid, clearing authentication state');
        clearAuthState();
        return;
      }

      // Only set token and user if validation succeeds
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
    } catch (error) {
      console.error('Error validating token', error);
      // On any error, clear the auth state to be safe
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear authentication state
  const clearAuthState = () => {
    localStorage.removeItem('doorway_token');
    localStorage.removeItem('doorway_user');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('doorway_token');
    const storedUser = localStorage.getItem('doorway_user');
    
    if (storedToken && storedUser) {
      validateAndSetToken(storedToken, storedUser);
    } else {
      setLoading(false);
      if (window.location.pathname !== '/login') {
        router.replace('/login');
      }
    }
  }, []);

  // Add function to validate current token
  const validateCurrentToken = async (): Promise<boolean> => {
    if (!token) {
      clearAuthState();
      return false;
    }
    
    try {
      const isValid = await authService.validateToken(token);
      if (!isValid) {
        clearAuthState();
      }
      return isValid;
    } catch (error) {
      console.error('Error validating token', error);
      clearAuthState();
      return false;
    }
  };

  // Login function - store token and user data
  const login = (newToken: string, userData: User) => {
    localStorage.setItem('doorway_token', newToken);
    localStorage.setItem('doorway_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    router.replace('/dashboard');
  };

  // Logout function - clear token and user data
  const logout = () => {
    clearAuthState();
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
    validateCurrentToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
