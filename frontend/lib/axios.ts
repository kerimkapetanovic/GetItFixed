import axios from 'axios';

const api = axios.create({
  // Fallback to localhost:8000 if the env variable isn't loaded
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR:
// Every time you make a request, this checks if a token exists in LocalStorage.
// If it does, it adds it to the "Authorization" header.
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;