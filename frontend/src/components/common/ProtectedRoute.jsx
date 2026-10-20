import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ role, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <PageLoader />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If role is specified and user doesn't have the required role
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user's role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and has correct role, render the child routes
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Outlet />
    </motion.div>
  );
};

// Higher-order component for protecting individual components
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return function WithAuthComponent(props) {
    const { user, loading } = useAuth();

    if (loading) {
      return <PageLoader />;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      return <Navigate to={redirectPath} replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Route guard for checking specific permissions
export const PermissionGuard = ({ children, permission }) => {
  const { user } = useAuth();

  // Define permissions based on role
  const rolePermissions = {
    admin: ['view_all', 'edit_all', 'delete_all', 'create_all', 'manage_users', 'view_reports'],
    student: ['view_own', 'edit_own', 'create_complaint', 'view_payments']
  };

  const hasPermission = user && rolePermissions[user.role]?.includes(permission);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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

  return children;
};

export default ProtectedRoute;