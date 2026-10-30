import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (payload: { username: string; email: string; password: string; fullName: string; role?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('inventory_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('inventory_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.me();
          setUser(currentUser);
          localStorage.setItem('inventory_user', JSON.stringify(currentUser));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const response = await authApi.login(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('inventory_token', response.token);
    localStorage.setItem('inventory_user', JSON.stringify(response.user));
  };

  const register = async (payload: { username: string; email: string; password: string; fullName: string; role?: string }) => {
    const response = await authApi.register(payload);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('inventory_token', response.token);
    localStorage.setItem('inventory_user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('inventory_token');
    localStorage.removeItem('inventory_user');
  };

  const role = user?.role || '';
  const isAdmin = role === 'ROLE_ADMIN';
  const isManager = role === 'ROLE_INVENTORY_MANAGER' || isAdmin;
  const isStaff = role === 'ROLE_STAFF' || isManager || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isManager,
        isStaff,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
