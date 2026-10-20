import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiMessageSquare,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiCreditCard,
  FiMapPin,
  FiLayers,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format, formatDistance } from 'date-fns';

const REFRESH_INTERVAL = 60000; // 60 seconds

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (silent = false) => {
    // Prevent fetching if no student profile linked at user level
    if (!user?.studentId) {
      setLoading(false);
      setError('unlinked');
      return;
    }

    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      
      const { data } = await dashboardAPI.getStudentDashboard();
      setDashboardData(data);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        // Unlinked or deleted
        setError('unlinked');
        setDashboardData(null);
      } else {
        if (!silent) {
          toast.error(err.response?.data?.message || 'Unable to fetch dashboard');
        }
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 60 seconds (silent, no loading spinner)
  useEffect(() => {
    if (error === 'unlinked') return; // Don't auto-refresh if profile is dead
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboardData, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
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
          <div className="inline-block glass p-6 rounded-2xl max-w-sm text-left shadow-sm bg-white/60 dark:bg-dark-300/60">
            <p className="text-sm font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <FiAlertCircle className="text-red-500 w-5 h-5" /> Next Steps:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                If you registered an account before we required registration numbers, you will need a new account.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Contact the hostel administration and ask them to map your profile.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const student = dashboardData?.student;
  const payments = dashboardData?.payments || [];
  const complaints = dashboardData?.complaints || [];
  const isRoomAllocated = !!student?.roomId;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, <span className="gradient-text">{user?.name}</span>!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {student?.hostelBlock} · Year {student?.year} · {student?.department}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-2xl font-bold mt-1 font-mono text-gray-800 dark:text-gray-200">{student?.registerNumber}</p>
            {lastRefreshed && (
              <div className="flex items-center justify-end gap-1 mt-1 text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">Live · updates every 60s</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== ROOM ALLOCATION STATUS BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isRoomAllocated ? (
          /* ✅ Room Allocated */
          <div className="glass-card p-6 border-2 border-green-400/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                      ✓ Room Allocated
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                    Room {student.roomId.roomNumber}
                  </h2>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    Your room has been successfully assigned
                  </p>
                </div>
              </div>

              {/* Room details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-white/10 rounded-xl">
                  <FiMapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Hostel Block</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{student.roomId.block}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-white/10 rounded-xl">
                  <FiLayers className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Floor</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">Floor {student.roomId.floor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-white/10 rounded-xl">
                  <FiHome className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Room Type</p>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{student.roomId.roomType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-green-700 dark:text-green-300">
                Capacity: {student.roomId.occupiedCount}/{student.roomId.capacity} beds occupied
              </p>
              <Link to="/student/room"
                className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-300 hover:text-green-800 transition-colors">
                View Room Details <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ⏳ No Room Allocated */
          <div className="glass-card p-6 border-2 border-amber-400/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
                <FiClock className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                    Pending Allocation
                  </span>
                  {isRefreshing && (
                    <FiRefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  Room Not Yet Allocated
                </h2>
                <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm">
                  Your room allocation is pending. The admin will assign a room shortly.
                  This dashboard updates automatically — no need to refresh manually.
                </p>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <div className="text-4xl">🏠</div>
                <p className="text-xs text-amber-600 mt-1 font-medium">Awaiting assignment</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Room Status</p>
              <p className={`text-xl font-semibold ${isRoomAllocated ? 'text-green-600' : 'text-amber-600'}`}>
                {isRoomAllocated ? 'Allocated' : 'Pending'}
              </p>
            </div>
            <FiHome className={`w-8 h-8 opacity-50 ${isRoomAllocated ? 'text-green-500' : 'text-amber-500'}`} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fee Status</p>
              <p className={`text-xl font-semibold ${student?.feesStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {student?.feesStatus || 'Pending'}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Complaints</p>
              <p className="text-xl font-semibold">{complaints.filter(c => c.status === 'Open').length}</p>
            </div>
            <FiAlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved Issues</p>
              <p className="text-xl font-semibold text-green-600">{complaints.filter(c => c.status === 'Resolved').length}</p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Recent Payments & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <FiCreditCard className="w-5 h-5 text-primary-500" />
          </div>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">₹{payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.duration || (payment.month + ' ' + payment.year)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      payment.status === 'Paid' ? 'badge-success' :
                      payment.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                    } text-xs`}>{payment.status || 'Paid'}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : (payment.dueDate ? 'Due: ' + format(new Date(payment.dueDate), 'dd/MM/yyyy') : '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Complaints */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Complaints</h2>
            <FiMessageSquare className="w-5 h-5 text-primary-500" />
          </div>
          {complaints.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No complaints filed yet</p>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map((complaint, index) => (
                <div key={index} className="p-3 glass rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${
                        complaint.status === 'Open' ? 'badge-warning' :
                        complaint.status === 'In Progress' ? 'badge-info' : 'badge-success'
                      } text-xs`}>{complaint.status}</span>
                      <span className="text-xs text-gray-500">{complaint.category}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{complaint.complaintText}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Personal Information Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Full Name</p>
            <p className="font-medium">{student?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Register Number</p>
            <p className="font-medium font-mono">{student?.registerNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Department</p>
            <p className="font-medium">{student?.department}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Year</p>
            <p className="font-medium">Year {student?.year}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Contact Number</p>
            <p className="font-medium">{student?.contactNumber || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Parent Contact</p>
            <p className="font-medium">{student?.parentContact || 'Not provided'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;