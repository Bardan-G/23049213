import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Session expired or invalid token. Signing out...");
            // Force signout to clear invalid session
            if (typeof window !== 'undefined') {
                signOut({ callbackUrl: '/auth/login' });
            }
        }
        return Promise.reject(error);
    }
);

export default api;