import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare, FiSearch, FiEye, FiCheck, FiX, FiClock,
  FiAlertCircle, FiUser, FiHome, FiZap, FiDroplet, FiWifi,
  FiMoreHorizontal, FiMapPin, FiLayers, FiRefreshCw, FiTrash2
} from 'react-icons/fi';
import { complaintAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistance } from 'date-fns';

const REFRESH_INTERVAL = 30; // seconds

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [resolution, setResolution] = useState('');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const categories = ['Room', 'Food', 'Maintenance', 'Electricity', 'Water', 'Internet', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed'];

  const fetchComplaints = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const { data } = await complaintAPI.getAll();
      setComplaints(data);
      setLastRefreshed(new Date());
    } catch (error) {
      if (!silent) toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await complaintAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [fetchComplaints, fetchStats]);

  // Auto-refresh with countdown
  useEffect(() => {
    setCountdown(REFRESH_INTERVAL);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? REFRESH_INTERVAL : prev - 1));
    }, 1000);

    intervalRef.current = setInterval(() => {
      fetchComplaints(true);
      fetchStats();
    }, REFRESH_INTERVAL * 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchComplaints, fetchStats]);

  const handleManualRefresh = () => {
    fetchComplaints();
    fetchStats();
    setCountdown(REFRESH_INTERVAL);
  };

  const handleUpdateStatus = async (id, status, resolutionText = '') => {
    try {
      await complaintAPI.updateStatus(id, { status, resolution: resolutionText });
      toast.success(`Complaint marked as ${status}`);
      setShowResolveModal(false);
      setShowDetailsModal(false);
      setResolution('');
      fetchComplaints(true);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint permanently?')) return;
    try {
      await complaintAPI.delete(id);
      toast.success('Complaint deleted');
      fetchComplaints(true);
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete complaint');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch =
      c.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentId?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hostelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const categoryIcon = {
    Room: FiHome, Food: FiMoreHorizontal, Maintenance: FiAlertCircle,
    Electricity: FiZap, Water: FiDroplet, Internet: FiWifi, Other: FiMessageSquare
  };

  const statusConfig = {
    Open:          { badge: 'badge-warning',   dot: 'bg-amber-500',  label: 'Open' },
    Pending:       { badge: 'badge-warning',   dot: 'bg-orange-500', label: 'Pending' },
    'In Progress': { badge: 'badge-info',      dot: 'bg-blue-500',   label: 'In Progress' },
    Resolved:      { badge: 'badge-success',   dot: 'bg-green-500',  label: 'Resolved' },
    Closed:        { badge: 'badge-secondary', dot: 'bg-gray-400',   label: 'Closed' },
  };

  const priorityColor = {
    Low:    'text-green-600 bg-green-50 dark:bg-green-900/20',
    Medium: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    High:   'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    Urgent: 'text-red-600 bg-red-50 dark:bg-red-900/20'
  };
  const priorityBadge = { Low: 'badge-success', Medium: 'badge-info', High: 'badge-warning', Urgent: 'badge-danger' };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold gradient-text">Complaint Management</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE</span>
              <span className="text-xs text-gray-500">· {countdown}s</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">
              {complaints.length} total · Last updated {lastRefreshed ? formatDistance(lastRefreshed, new Date(), { addSuffix: true }) : '—'}
              {isRefreshing && <FiRefreshCw className="inline w-3 h-3 ml-1 animate-spin" />}
            </p>
            <button onClick={handleManualRefresh}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.totalComplaints, color: 'text-primary-600' },
            { label: 'Open', value: stats.openComplaints, color: 'text-amber-600', icon: FiAlertCircle },
            { label: 'Pending', value: stats.pendingComplaints || 0, color: 'text-orange-600', icon: FiClock },
            { label: 'In Progress', value: stats.inProgressComplaints, color: 'text-blue-600', icon: FiClock },
            { label: 'Resolved', value: stats.resolvedComplaints, color: 'text-green-600', icon: FiCheck },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                {stat.icon && <stat.icon className={`w-7 h-7 opacity-40 ${stat.color}`} />}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by student, room, description..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
            </div>
          ))
        ) : filteredComplaints.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FiMessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No complaints found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            const CatIcon = categoryIcon[complaint.category] || FiMessageSquare;
            const sCfg = statusConfig[complaint.status] || statusConfig.Open;
            return (
              <motion.div key={complaint._id}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                className="glass-card p-5 cursor-pointer group"
                onClick={() => { setSelectedComplaint(complaint); setShowDetailsModal(true); }}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${priorityColor[complaint.priority]}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
                        <span className="text-xs font-medium">{complaint.status}</span>
                      </div>
                      <span className={`badge ${priorityBadge[complaint.priority]} text-xs`}>{complaint.priority}</span>
                      <span className="text-xs text-gray-500">{complaint.category}</span>
                    </div>

                    {/* Location pill */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        <FiHome className="w-3 h-3" />{complaint.hostelName || '—'}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        <FiLayers className="w-3 h-3" />Floor {complaint.floorNumber || '—'}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        <FiMapPin className="w-3 h-3" />Room {complaint.roomNumber || '—'}
                      </span>
                    </div>

                    {/* Complaint text */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{complaint.complaintText}</p>

                    {/* Student + time */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {complaint.studentId?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{complaint.studentId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{complaint.studentId?.registerNumber || '—'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ===== Complaint Details Modal ===== */}
      <AnimatePresence>
        {showDetailsModal && selectedComplaint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">Complaint Details</h2>
                  <button onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${(statusConfig[selectedComplaint.status] || statusConfig.Open).badge}`}>{selectedComplaint.status}</span>
                    <span className={`badge ${priorityBadge[selectedComplaint.priority]}`}>{selectedComplaint.priority}</span>
                    <span className="badge badge-info">{selectedComplaint.category}</span>
                  </div>

                  {/* Location */}
                  <div className="p-4 glass rounded-xl">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-primary-500" /> Location
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Hostel Block</p>
                        <p className="font-semibold">{selectedComplaint.hostelName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="font-semibold">{selectedComplaint.floorNumber || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Room Number</p>
                        <p className="font-semibold">{selectedComplaint.roomNumber || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Complaint text */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Issue Description</h3>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-gray-900 dark:text-white leading-relaxed">{selectedComplaint.complaintText}</p>
                    </div>
                  </div>

                  {/* Student info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Student Information</h3>
                    <div className="glass p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{selectedComplaint.studentId?.name}</p>
                          <p className="text-sm text-gray-500 font-mono">{selectedComplaint.studentId?.registerNumber}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="text-sm font-medium">{selectedComplaint.studentId?.department || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Year</p>
                          <p className="text-sm font-medium">Year {selectedComplaint.studentId?.year || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Contact</p>
                          <p className="text-sm font-medium">{selectedComplaint.studentId?.contactNumber || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution (if any) */}
                  {selectedComplaint.resolution && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Resolution</h3>
                      <div className="glass p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm">{selectedComplaint.resolution}</p>
                        <p className="text-xs text-green-600 mt-1">By {selectedComplaint.resolvedBy?.name || 'Admin'}</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Timeline</h3>
                    <div className="glass p-4 rounded-xl space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created</span>
                        <span>{format(new Date(selectedComplaint.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Updated</span>
                        <span>{format(new Date(selectedComplaint.updatedAt), 'dd MMM yyyy, hh:mm a')}</span>
                      </div>
                      {selectedComplaint.resolvedAt && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Resolved</span>
                          <span className="text-green-600">{format(new Date(selectedComplaint.resolvedAt), 'dd MMM yyyy, hh:mm a')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                    className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50">
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                  <div className="flex gap-2 flex-wrap">
                    {selectedComplaint.status === 'Open' && (
                      <>
                        <button onClick={() => handleUpdateStatus(selectedComplaint._id, 'Pending')}
                          className="btn-secondary text-sm px-3 py-2">
                          Mark Pending
                        </button>
                        <button onClick={() => handleUpdateStatus(selectedComplaint._id, 'In Progress')}
                          className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                          In Progress
                        </button>
                        <button onClick={() => { setShowDetailsModal(false); setShowResolveModal(true); }}
                          className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-2">
                          Resolve
                        </button>
                      </>
                    )}
                    {selectedComplaint.status === 'Pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(selectedComplaint._id, 'In Progress')}
                          className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                          In Progress
                        </button>
                        <button onClick={() => { setShowDetailsModal(false); setShowResolveModal(true); }}
                          className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-2">
                          Resolve
                        </button>
                      </>
                    )}
                    {selectedComplaint.status === 'In Progress' && (
                      <button onClick={() => { setShowDetailsModal(false); setShowResolveModal(true); }}
                        className="btn-primary bg-green-600 hover:bg-green-700 text-sm px-3 py-2">
                        Mark Resolved
                      </button>
                    )}
                    <button onClick={() => setShowDetailsModal(false)} className="btn-secondary text-sm px-3 py-2">Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Resolve Modal ===== */}
      <AnimatePresence>
        {showResolveModal && selectedComplaint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">Resolve Complaint</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Room {selectedComplaint.roomNumber} · {selectedComplaint.hostelName}
                    </p>
                  </div>
                  <button onClick={() => { setShowResolveModal(false); setResolution(''); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-3 glass rounded-xl text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">
                    "{selectedComplaint.complaintText}"
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution Details <span className="text-red-500">*</span>
                    </label>
                    <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
                      className="input-modern" rows="4"
                      placeholder="Describe how this complaint was resolved..." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => { setShowResolveModal(false); setResolution(''); }} className="btn-secondary">Cancel</button>
                  <button
                    onClick={() => handleUpdateStatus(selectedComplaint._id, 'Resolved', resolution)}
                    disabled={!resolution.trim()}
                    className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    <FiCheck className="w-4 h-4" /> Confirm Resolution
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplaintManagement;