import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hostel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('hostel_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('hostel_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('hostel_token', newToken);
      localStorage.setItem('hostel_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('hostel_token', newToken);
      localStorage.setItem('hostel_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

