import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Stable module-level axios instance (avoids stale closure issues)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout — prevents infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [initialized, setInitialized] = useState(false);

  // Use ref so the interceptor can always call the latest logout
  const logoutRef = useRef(null);

  // Logout function (defined early so ref can be set)
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Keep ref in sync
  logoutRef.current = logout;

  // Register the 401 response interceptor once
  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logoutRef.current?.();
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentToken = localStorage.getItem('token');

      if (!currentToken) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
        setToken(currentToken);
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        if (error.response?.status !== 401) {
          toast.error('Failed to load user profile');
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    fetchUserProfile();
  }, []); // runs once on mount only

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      toast.success('Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset link';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword });
      toast.success('Password reset successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh-token');
      localStorage.setItem('token', data.token);
      setToken(data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return { success: true, data };
    } catch (error) {
      logout();
      return { success: false, error: 'Failed to refresh token' };
    }
  };

  // Verify email
  const verifyEmail = async (verificationToken) => {
    try {
      await api.post('/auth/verify-email', { token: verificationToken });
      toast.success('Email verified successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Role helpers
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const isAuthenticated = () => !!user && !!token;

  // Permissions
  const getPermissions = () => {
    const rolePermissions = {
      admin: ['view_all','create_all','edit_all','delete_all','manage_users','manage_rooms','manage_payments','manage_complaints','view_reports','export_data'],
      student: ['view_own_profile','edit_own_profile','view_own_room','view_own_payments','create_complaint','view_own_complaints']
    };
    return user ? rolePermissions[user.role] || [] : [];
  };
  const hasPermission = (permission) => getPermissions().includes(permission);

  const value = {
    user, loading, token, initialized,
    isAuthenticated: isAuthenticated(),
    login, register, logout, updateProfile, changePassword,
    forgotPassword, resetPassword, refreshToken, verifyEmail,
    resendVerificationEmail, hasRole, hasAnyRole, hasPermission,
    getPermissions, api
  };

  // Show loading screen while initializing
  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-200">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-500" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting components
export const withAuth = (WrappedComponent, options = {}) => {
  const { requiredRole, requiredPermission, redirectTo = '/login' } = options;

  return function WithAuthComponent(props) {
    const { user, loading, hasRole, hasPermission } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (!user) {
      window.location.href = redirectTo;
      return null;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      window.location.href = redirectPath;
      return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Custom hook for role-based access
export const useRole = () => {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    role: user?.role
  };
};

// Custom hook for permissions
export const usePermissions = () => {
  const { getPermissions, hasPermission } = useAuth();
  
  return {
    permissions: getPermissions(),
    can: hasPermission
  };
};

export default AuthContext;