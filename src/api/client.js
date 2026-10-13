import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor to attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dmosthigh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If backend returns structured error
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Auto clear expired session on 401 if not on login/register endpoints
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      if (localStorage.getItem('dmosthigh_token')) {
        localStorage.removeItem('dmosthigh_token');
        localStorage.removeItem('dmosthigh_user');
      }
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);

export default apiClient;
