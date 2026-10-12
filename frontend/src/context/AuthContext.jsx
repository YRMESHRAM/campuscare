import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'coordinator':
      return '/coordinator/dashboard';
    case 'facility_manager':
      return '/facility/dashboard';
    case 'hod':
      return '/hod/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cc_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('cc_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('cc_user');
        localStorage.removeItem('cc_token');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('cc_user', JSON.stringify(userData));
      localStorage.setItem('cc_token', userToken);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cc_user');
      localStorage.removeItem('cc_token');
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasPermission,
        getDashboardRoute: () => (user ? getDashboardRoute(user.role) : '/login'),
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
