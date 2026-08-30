import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const res = await axios.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        if (res.data.success) {
            setUser(res.data.data);
        }
        return res.data;
    };

    const logout = async () => {
        await axios.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
