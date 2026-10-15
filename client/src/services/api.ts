import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('essen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return structured error message
    let msg = error.response?.data?.error?.message;
    if (!msg) {
      if (error.response?.status === 405 || (typeof error.response?.data === 'string' && error.response.data.includes('<!doctype html>'))) {
        msg = 'Backend server not found (405). Please configure VITE_API_URL in Vercel to point to your live backend API.';
      } else if (error.message === 'Network Error' && !import.meta.env.VITE_API_URL) {
        msg = 'Network Error: Backend API URL (VITE_API_URL) is not configured in Vercel environment variables.';
      } else {
        msg = error.message || 'Something went wrong';
      }
    }
    return Promise.reject(new Error(msg));
  }
);

