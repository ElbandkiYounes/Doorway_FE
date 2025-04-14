import axios from 'axios';
import { config } from './config';

const API_URL = config.apiUrl;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresIn: number;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Login user and get JWT token
  login: async (credentials: LoginCredentials): Promise<LoginResponse & { user: any }> => {
    try {
      // Updated endpoint to match the backend authentication endpoint
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Extract response data
      const { token, expiresIn } = response.data;
      
      // Get user info from token - we'll create basic user info since it's not returned
      // In a real app, you might want to decode the JWT or make a separate call to get user details
      const user = {
        id: '0',
        email: credentials.email,
        role: 'USER'
      };
      
      return {
        token,
        expiresIn,
        user
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error occurred during login');
    }
  },
  
  // Check if token is valid by fetching the current user
  // We use the /api/me endpoint which returns the current user info based on the token
  validateToken: async (token: string): Promise<boolean> => {
    try {
      // Use the /api/me endpoint instead of a non-existent validate-token endpoint
      const response = await axios.get(`${API_URL}/api/me`, {
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        // Add timeout to prevent long waiting times if the backend is down
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      // Check for network errors vs. actual auth errors
      if (axios.isAxiosError(error)) {
        // If it's a network error (backend down), don't invalidate the token
        if (!error.response) {
          console.warn('Network error during token validation, assuming token is still valid');
          return true;
        }
        
        // Only return false for auth-related errors (401, 403)
        if (error.response.status === 401 || error.response.status === 403) {
          console.warn('Token validation failed with status:', error.response.status);
          return false;
        }
      }
      
      // For other errors, assume token is valid to prevent unnecessary logouts
      console.warn('Error during token validation, assuming token is still valid:', error);
      return true;
    }
  }
};
