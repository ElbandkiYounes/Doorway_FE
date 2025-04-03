import axios from 'axios';

// Updated to match the base URL without the /api path
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create API client instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('doorway_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized, redirect to login
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear stored authentication
      localStorage.removeItem('doorway_token');
      localStorage.removeItem('doorway_user');
      
      // In a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
