"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('doorway_token');
    const storedUser = localStorage.getItem('doorway_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        // Clear invalid data
        localStorage.removeItem('doorway_token');
        localStorage.removeItem('doorway_user');
      }
    }
    
    setLoading(false);
  }, []);

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
    loading
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
