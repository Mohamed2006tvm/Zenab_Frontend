import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    // In production, ensure VITE_API_URL is set to your deployed backend URL
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, 
    headers: { 'Content-Type': 'application/json' },
});

// Add interceptor to attach Supabase JWT
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
