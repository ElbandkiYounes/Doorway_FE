import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  
  // Check if token is valid
  validateToken: async (token: string): Promise<boolean> => {
    try {
      // You might want to update this to match your backend's token validation endpoint
      const response = await axios.get(`${API_URL}/auth/validate-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
};
