import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiGrid,
  FiCheck,
  FiX,
  FiMapPin,
  FiLayers,
  FiWifi,
  FiDroplet,
  FiZap,
  FiWind,
  FiCoffee,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, roomAPI } from '../../services/api';
import toast from 'react-hot-toast';

const REFRESH_INTERVAL = 60000; // 60 seconds

const MyRoom = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [student, setStudent] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState(0);

  const [error, setError] = useState(null);

  const fetchRoomDetails = useCallback(async (silent = false) => {
    // Check if user has a linked student profile
    if (!user?.studentId) {
      setLoading(false);
      setIsRefreshing(false);
      setError('unlinked');
      return;
    }

    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      // Get student ID whether it's a string or object
      const studentId = typeof user.studentId === 'object' ? user.studentId._id : user.studentId;
      const studentRes = await studentAPI.getById(studentId);
      setStudent(studentRes.data);
      setLastRefreshed(new Date());
      setSecondsSinceRefresh(0);

      if (studentRes.data.roomId) {
        const roomId = typeof studentRes.data.roomId === 'object'
          ? studentRes.data.roomId._id
          : studentRes.data.roomId;
        const roomRes = await roomAPI.getById(roomId);
        setRoom(roomRes.data);
        setRoommates(roomRes.data.students || []);
      } else {
        setRoom(null);
        setRoommates([]);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 500) {
        setError('unlinked');
      } else {
        if (!silent) toast.error(err.response?.data?.message || 'Failed to fetch room details');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (error === 'unlinked') return;
    
    const refreshInterval = setInterval(() => {
      fetchRoomDetails(true);
    }, REFRESH_INTERVAL);

    const secondsInterval = setInterval(() => {
      setSecondsSinceRefresh(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(secondsInterval);
    };
  }, [fetchRoomDetails]);

  const amenityIcons = {
    'WiFi': FiWifi,
    'AC': FiWind,
    'Hot Water': FiDroplet,
    'Electricity': FiZap,
    'Attached Bathroom': FiDroplet,
    'Study Table': FiCoffee,
    'Wardrobe': FiLayers
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error === 'unlinked') {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-card p-12 text-center border-2 border-red-300/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Profile Not Linked
          </h2>
          <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-8">
            Your account does not have an associated student profile in the system. This blocks access to dashboard data, room allocation, and other student features.
          </p>
        </motion.div>
      </div>
    );
  }

  // ===== No Room Allocated State =====
  if (!student?.roomId) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Room</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Your room allocation status</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isRefreshing ? (
              <FiRefreshCw className="w-4 h-4 animate-spin text-primary-500" />
            ) : (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            <span>Auto-updates every 60s</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-12 text-center border-2 border-amber-300/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10"
        >
          {/* Animated waiting illustration */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center"
            >
              <FiHome className="w-14 h-14 text-amber-500" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30"
            >
              <FiClock className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
            Room Not Yet Allocated
          </h2>
          <p className="text-amber-700 dark:text-amber-300 max-w-md mx-auto mb-6">
            Your room allocation is currently pending. The hostel administration will assign
            a room to you shortly. This page refreshes automatically every minute.
          </p>

          {/* Status indicator */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
            <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <span className="font-medium text-amber-800 dark:text-amber-200">Awaiting admin allocation</span>
            {isRefreshing && <FiRefreshCw className="w-4 h-4 text-amber-600 animate-spin" />}
          </div>

          {/* Next check countdown */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Next check in {Math.max(0, 60 - (secondsSinceRefresh % 60))}s ·{' '}
            <button
              onClick={() => fetchRoomDetails(true)}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Check now
            </button>
          </p>

          <div className="mt-8 p-4 glass rounded-xl max-w-sm mx-auto">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What happens next?</p>
            <div className="space-y-2 text-left">
              {[
                { icon: '✅', text: 'Admin reviews your registration' },
                { icon: '🏠', text: 'A room is assigned based on your block preference' },
                { icon: '🔔', text: 'Your dashboard updates automatically' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== Room Allocated View =====
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Room</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your room details and amenities
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isRefreshing ? (
            <FiRefreshCw className="w-4 h-4 animate-spin text-primary-500" />
          ) : (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <span>Live</span>
          <button
            onClick={() => fetchRoomDetails(true)}
            className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Room Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                    {room?.block}
                  </span>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    Floor {room?.floor}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1">
                    <FiCheck className="w-3 h-3" /> Allocated
                  </span>
                </div>
                <h2 className="text-3xl font-bold">Room {room?.roomNumber}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{room?.roomType} Room</p>
              </div>
              <div className="text-right">
                <div className="inline-block p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                  <FiHome className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Occupancy Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                <span className="font-medium">{room?.occupiedCount} / {room?.capacity} Beds</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(room?.occupiedCount / room?.capacity) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                />
              </div>
            </div>

            {/* Room Status Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Room Status</span>
                </div>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <FiUsers className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Roommates</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{Math.max(0, roommates.length - 1)}</p>
              </div>
            </div>

            {/* Amenities */}
            {room?.amenities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Room Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || FiCheck;
                    return (
                      <div key={index} className="flex items-center space-x-2 p-3 glass rounded-xl">
                        <IconComponent className="w-5 h-5 text-primary-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Roommates List */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Roommates</h3>
            {roommates.length <= 1 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No other roommates yet</p>
            ) : (
              <div className="space-y-3">
                {roommates
                  .filter(r => {
                    const studentIdStr = typeof user.studentId === 'object'
                      ? user.studentId._id?.toString()
                      : user.studentId?.toString();
                    return r._id?.toString() !== studentIdStr;
                  })
                  .map((roommate, index) => (
                    <div key={index} className="flex flex-col p-3 glass rounded-xl space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                          {roommate.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{roommate.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{roommate.registerNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                          {roommate.department || 'N/A'}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md whitespace-nowrap">
                          Year {roommate.year || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Room Information */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Room Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                <FiMapPin className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-xs text-gray-500">Block</p>
                  <p className="font-medium">{room?.block}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                <FiLayers className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-xs text-gray-500">Floor</p>
                  <p className="font-medium">{room?.floor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                <FiGrid className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-xs text-gray-500">Room Type</p>
                  <p className="font-medium">{room?.roomType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Contact the hostel administration for room-related issues.
            </p>
            <button className="w-full btn-secondary text-sm">Contact Warden</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyRoom;