import axios from 'axios';
import { config } from './config';

const API_URL = config.apiUrl;

// Create API client instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add reasonable timeout to avoid long waits when server is down
  timeout: 10000
});

// Flag to track if we're currently experiencing connection issues
let isBackendUnavailable = false;
let lastConnectionAttempt = 0;
const RETRY_INTERVAL = 10000; // 10 seconds

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('doorway_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Track if we're retrying a connection to a potentially down backend
    if (isBackendUnavailable) {
      const now = Date.now();
      // Only allow retries every RETRY_INTERVAL to avoid hammering the server
      if (now - lastConnectionAttempt < RETRY_INTERVAL) {
        // For non-critical requests, we might want to abort them when backend is down
        // but for authentication-related requests, let them through to test if backend is back up
        if (!config.url?.includes('/auth/') && !config.url?.includes('/api/me')) {
          // This is how you might abort a request in axios
          // We're not implementing this part yet as it requires more careful consideration
          // const controller = new AbortController();
          // config.signal = controller.signal;
          // controller.abort('Backend is currently unavailable. Retrying in a moment...');
        }
      }
      lastConnectionAttempt = now;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    // If we got a successful response, clear the unavailable flag
    if (isBackendUnavailable) {
      console.log('Backend is available again');
      isBackendUnavailable = false;
    }
    return response;
  },
  async (error) => {
    // Check for network errors which could indicate backend is down
    if (axios.isAxiosError(error) && !error.response) {
      console.warn('Network error detected. Backend might be down.');
      isBackendUnavailable = true;
      lastConnectionAttempt = Date.now();
      
      // Don't automatically log out on connection errors
      return Promise.reject(error);
    }
    
    // Handle actual 401 errors (invalid token)
    const originalRequest = error.config;
    if (axios.isAxiosError(error) && 
        error.response?.status === 401 && 
        !originalRequest._retry) {
        
      // Mark that we've attempted a retry
      originalRequest._retry = true;

      // Clear stored authentication
      localStorage.removeItem('doorway_token');
      localStorage.removeItem('doorway_user');
      
      // In a browser environment, redirect to login
      if (typeof window !== 'undefined') {
        // Add a clear message to the console about what happened
        console.warn('JWT token is no longer valid (server may have restarted). Redirecting to login page.');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
