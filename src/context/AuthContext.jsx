import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dmosthigh_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dmosthigh_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / verify user session on initial load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('dmosthigh_user', JSON.stringify(freshUser));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dmosthigh_token', data.token);
      localStorage.setItem('dmosthigh_user', JSON.stringify(data.user));
    }
    return data?.user;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('dmosthigh_token', data.token);
      localStorage.setItem('dmosthigh_user', JSON.stringify(data.user));
    }
    return data?.user;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('dmosthigh_token');
    localStorage.removeItem('dmosthigh_user');
  };

  const updateProfile = async (profileData) => {
    const updated = await authService.updateProfile(profileData);
    if (updated) {
      setUser(updated);
      localStorage.setItem('dmosthigh_user', JSON.stringify(updated));
    }
    return updated;
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile,
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
