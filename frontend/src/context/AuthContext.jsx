import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure axios sends cookies with every request
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Axios Interceptor for handling 401 and token refresh
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (
                    error.response?.status === 401 && 
                    !originalRequest._retry && 
                    originalRequest.url !== '/api/auth/google' && 
                    originalRequest.url !== '/api/auth/refresh-token'
                ) {
                    originalRequest._retry = true;
                    try {
                        const res = await axios.get('/api/auth/refresh-token');
                        if (res.data.success) {
                            setToken(res.data.token);
                            localStorage.setItem('token', res.data.token);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                            originalRequest.headers['Authorization'] = `Bearer ${res.data.token}`;
                            return axios(originalRequest);
                        }
                    } catch (err) {
                        logout();
                        return Promise.reject(err);
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile();
        } else {
            // Attempt to refresh if token is missing but refresh cookie might be present
            refreshSession();
        }
    }, [token]);

    const refreshSession = async () => {
        try {
            const res = await axios.get('/api/auth/refresh-token');
            if (res.data.success) {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data.user);
            }
        } catch (error) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/auth/profile');
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (credential) => {
        const res = await axios.post('/api/auth/google', { credential });
        if (res.data.success) {
            setToken(res.data.token);
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setUser(res.data.user);
            return res.data;
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};
