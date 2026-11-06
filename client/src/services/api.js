import axios from 'axios';

// Dynamically determine the API base URL
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // 1. If an explicit valid non-placeholder URL is configured
  if (envUrl && !envUrl.includes('YOUR-RENDER-BACKEND-URL')) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  // 2. If running on Vercel production or preview (e.g. hostel-expense-tracker-eta.vercel.app)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://hostel-expenses.onrender.com/api';
  }

  // 3. Fallback for local development (uses Vite proxy /api -> http://localhost:5000)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register endpoints
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('hostel_token');
        localStorage.removeItem('hostel_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

