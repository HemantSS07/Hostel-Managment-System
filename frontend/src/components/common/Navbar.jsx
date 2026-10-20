import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiKey, 
  FiDollarSign, 
  FiMessageSquare,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiBell,
  FiSettings
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New complaint submitted', time: '5 min ago' },
    { id: 2, message: 'Payment received', time: '1 hour ago' },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/students', label: 'Students', icon: FiUsers },
    { path: '/admin/rooms', label: 'Rooms', icon: FiKey },
    { path: '/admin/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/admin/complaints', label: 'Complaints', icon: FiMessageSquare },
  ] : [
    { path: '/student/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/student/profile', label: 'Profile', icon: FiUser },
    { path: '/student/room', label: 'My Room', icon: FiKey },
    { path: '/student/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/student/complaints', label: 'Complaints', icon: FiMessageSquare },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">H</span>
              </motion.div>
              <span className="text-xl font-bold gradient-text">HostelMS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-300 transition-all duration-200 flex items-center space-x-2 group"
                >
                  <item.icon className="group-hover:text-primary-500 transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors relative"
                >
                  <FiBell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </motion.button>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block font-medium">{user?.name}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                      <FiUser className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors">
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              >
                {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="glass m-4 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-300 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5 text-primary-500" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;