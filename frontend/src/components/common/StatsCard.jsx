import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary',
  subtitle,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    primary: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    success: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    },
    warning: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    pink: {
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-200 dark:border-pink-800'
    },
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800'
    }
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-6 group cursor-pointer hover:shadow-2xl ${className}`}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {typeof value === 'number' ? (
                <CountUp 
                  end={value} 
                  duration={2} 
                  separator="," 
                  decimals={value % 1 !== 0 ? 2 : 0}
                />
              ) : (
                value
              )}
            </h3>
            {trend !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend > 0 ? (
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <FiTrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Icon Container */}
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.abs(trend || 70), 100)}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
        />
      </div>
      
      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className={`text-xs ${colors.text} font-medium`}>
          Updated just now
        </div>
        <motion.div
          whileHover={{ x: 5 }}
          className={`text-xs ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          View Details →
        </motion.div>
      </div>
      
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${color}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${color})`} />
        </svg>
      </div>
    </motion.div>
  );
};

// Mini Stats Card (Compact Version)
export const MiniStatsCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colors = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center space-x-3 p-4 glass rounded-xl"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  );
};

// Stats Grid Component
export const StatsGrid = ({ children, columns = 4 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
};

export default StatsCard;