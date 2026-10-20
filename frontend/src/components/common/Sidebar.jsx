import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiKey,
  FiDollarSign,
  FiMessageSquare,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiPieChart,
  FiSettings,
  FiHelpCircle,
  FiLogOut
} from 'react-icons/fi';
import { BiBuildingHouse } from 'react-icons/bi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/students', label: 'Students', icon: FiUsers },
    { path: '/admin/rooms', label: 'Rooms', icon: FiKey },
    { path: '/admin/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/admin/complaints', label: 'Complaints', icon: FiMessageSquare },
    { path: '/admin/reports', label: 'Reports', icon: FiPieChart },
  ];

  const studentMenuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/student/profile', label: 'My Profile', icon: FiUser },
    { path: '/student/room', label: 'My Room', icon: FiKey },
    { path: '/student/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/student/complaints', label: 'Complaints', icon: FiMessageSquare },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  const bottomMenuItems = [
    { path: '/settings', label: 'Settings', icon: FiSettings },
    { path: '/help', label: 'Help & Support', icon: FiHelpCircle },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`relative h-screen glass border-r border-white/20 dark:border-white/10 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-colors z-50"
      >
        {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {/* Logo Section */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link to="/" className="flex items-center space-x-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <BiBuildingHouse className="w-6 h-6 text-white" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold gradient-text whitespace-nowrap"
              >
                HostelMS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 5 }}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-300'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'group-hover:text-primary-500'
                }`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {bottomMenuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ x: isCollapsed ? 0 : 5 }}
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                isCollapsed ? 'justify-center' : ''
              } text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-300`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary-500" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </motion.div>
          </Link>
        ))}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
            isCollapsed ? 'justify-center' : ''
          } text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;