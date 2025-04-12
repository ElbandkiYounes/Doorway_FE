"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './auth-service';

interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
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
      // Set token and user initially without validation to prevent flickering
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Then validate in background
      const isValid = await authService.validateToken(storedToken);
      
      if (!isValid) {
        // Token is invalid, clear localStorage
        console.warn('Stored token is invalid, clearing authentication state');
        localStorage.removeItem('doorway_token');
        localStorage.removeItem('doorway_user');
        setToken(null);
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error validating token', error);
      // Don't clear token on validation errors - only on explicit invalid responses
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('doorway_token');
    const storedUser = localStorage.getItem('doorway_user');
    
    if (storedToken && storedUser) {
      validateAndSetToken(storedToken, storedUser);
    } else {
      setLoading(false);
    }
  }, []);

  // Add function to validate current token
  const validateCurrentToken = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const isValid = await authService.validateToken(token);
      if (!isValid) {
        // Token is invalid, clear state and redirect
        logout();
      }
      return isValid;
    } catch (error) {
      console.error('Error validating token', error);
      // Don't log out automatically on network errors
      return true; // Assume token is valid if there's an error checking it
    }
  };

  // Login function - store token and user data
  const login = (newToken: string, userData: User) => {
    localStorage.setItem('doorway_token', newToken);
    localStorage.setItem('doorway_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    router.push('/dashboard'); // Redirect to dashboard after login
  };

  // Logout function - clear token and user data
  const logout = () => {
    localStorage.removeItem('doorway_token');
    localStorage.removeItem('doorway_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
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
