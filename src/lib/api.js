import axios from 'axios';
import { supabase } from './supabase';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return 'http://localhost:5000/api';
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
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
