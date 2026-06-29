import axios from 'axios';

// 1. Your Existing Token Key Configurations
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const isAuthenticated = () => Boolean(getAccessToken());


// 2. GLOBAL AXIOS INTERCEPTOR CLIENT
// Import and use this client across your website to handle 401 timeouts automatically
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Token Injector
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 Unauthorized Expiration Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearTokens(); // Wipes keys from localStorage
      window.location.href = '/auth/login'; // Bounces user to login screen instantly
    }
    return Promise.reject(error);
  }
);


// 3. GLOBAL SECURE FETCH WRAPPER (Alternative to Axios)
// If you prefer native fetch, use this method instead of window.fetch()
export const secureFetch = async (endpoint, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearTokens();
      window.location.href = '/login';
      return;
    }

    return response;
  } catch (error) {
    throw error;
  }
};

