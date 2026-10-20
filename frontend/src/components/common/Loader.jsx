import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const loaderContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary-200 dark:border-primary-900/30 rounded-full`} />
        
        {/* Spinning Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-500 rounded-full`}
        />
        
        {/* Spinning Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-b-purple-500 rounded-full`}
        />
        
        {/* Inner Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-primary-500 rounded-full" />
        </motion.div>
      </div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

// Page Loader Component with Skeleton
export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Loader size="large" text="Loading your dashboard..." />
        
        {/* Skeleton Loader */}
        <div className="mt-8 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
        </div>
      </div>
    </div>
  );
};

// Card Loader Component
export const CardLoader = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Table Loader Component
export const TableLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="glass-card p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {[...Array(columns)].map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-800">
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Loader;