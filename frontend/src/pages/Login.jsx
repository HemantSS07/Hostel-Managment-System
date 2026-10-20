import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn,
  FiAlertCircle 
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        const userRole = result.data.role;
        navigate(userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      admin: { email: 'admin@hostel.com', password: 'admin123' },
      student: { email: 'student@hostel.com', password: 'student123' }
    };
    
    setFormData(demoCredentials[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-bg opacity-10" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, -10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, -5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25"
            >
              <BiBuildingHouse className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to access your account
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  className={`input-modern pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 flex items-center"
                >
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  className={`input-modern pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 flex items-center"
                >
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="p-2 text-xs bg-white dark:bg-dark-300 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <span className="font-medium block">Admin</span>
                <span className="text-gray-500 block text-xs mt-1">admin@hostel.com</span>
              </button>
              <button
                onClick={() => handleDemoLogin('student')}
                className="p-2 text-xs bg-white dark:bg-dark-300 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <span className="font-medium block">Student</span>
                <span className="text-gray-500 block text-xs mt-1">student@hostel.com</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;