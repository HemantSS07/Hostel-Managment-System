import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare, FiPlus, FiX, FiCheckCircle, FiClock,
  FiAlertCircle, FiSend, FiFilter, FiEye, FiMapPin,
  FiLayers, FiHome, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { complaintAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format, formatDistance } from 'date-fns';

const REFRESH_INTERVAL = 30000; // 30 seconds

const hostels = ['Block A', 'Block B', 'Block C', 'PG'];
const categories = ['Room', 'Food', 'Maintenance', 'Electricity', 'Water', 'Internet', 'Other'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

const MyComplaints = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    hostelName: '',
    floorNumber: '',
    roomNumber: '',
    complaintText: '',
    category: 'Other',
    priority: 'Medium'
  });
  const [formErrors, setFormErrors] = useState({});

  // Resolve studentId whether stored as string or object
  const studentId = user?.studentId?._id || user?.studentId;

  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(async (silent = false) => {
    // Check if user has a linked student profile
    if (!studentId) {
      setLoading(false);
      setIsRefreshing(false);
      setError('unlinked');
      return;
    }

    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      
      const { data } = await complaintAPI.getByStudent(studentId);
      setComplaints(data);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 500) {
        setError('unlinked');
      } else {
        if (!silent) toast.error(err.response?.data?.message || 'Failed to fetch complaints');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchComplaints(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const validateForm = () => {
    const errors = {};
    if (!formData.hostelName) errors.hostelName = 'Hostel block is required';
    if (!formData.floorNumber.trim()) errors.floorNumber = 'Floor number is required';
    if (!formData.roomNumber.trim()) errors.roomNumber = 'Room number is required';
    if (!formData.complaintText.trim()) errors.complaintText = 'Please describe your complaint';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await complaintAPI.create({ studentId, ...formData });
      toast.success('Complaint submitted successfully!');
      setShowAddModal(false);
      setFormData({ hostelName: '', floorNumber: '', roomNumber: '', complaintText: '', category: 'Other', priority: 'Medium' });
      setFormErrors({});
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter(c =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const statusConfig = {
    Open:        { icon: FiAlertCircle, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  badge: 'badge-warning' },
    Pending:     { icon: FiClock,       color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', badge: 'badge-warning' },
    'In Progress':{ icon: FiClock,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',    badge: 'badge-info' },
    Resolved:    { icon: FiCheckCircle, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',  badge: 'badge-success' },
    Closed:      { icon: FiMessageSquare, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20',   badge: 'badge-secondary' },
  };

  const priorityBadge = { Low: 'badge-success', Medium: 'badge-info', High: 'badge-warning', Urgent: 'badge-danger' };

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
            <FiMessageSquare className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Profile Not Linked
          </h2>
          <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-8">
            You cannot view or submit complaints because your account does not have an associated student profile in the system.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold gradient-text">My Complaints</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">LIVE</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Submit and track complaints · auto-refreshes every 30s
            {isRefreshing && <FiRefreshCw className="inline w-3 h-3 ml-1 animate-spin" />}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>New Complaint</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: complaints.length },
          { label: 'Open', value: complaints.filter(c => c.status === 'Open' || c.status === 'Pending').length },
          { label: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
          { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <FiFilter className="w-4 h-4 text-gray-400" />
          {['all', 'Open', 'Pending', 'In Progress', 'Resolved', 'Closed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filterStatus === s ? 'bg-primary-500 text-white' : 'glass hover:bg-gray-100 dark:hover:bg-dark-300'
              }`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Complaints</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all' ? "You haven't submitted any complaints yet" : `No ${filterStatus} complaints`}
          </p>
          {filterStatus === 'all' && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Submit Your First Complaint
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint, index) => {
            const cfg = statusConfig[complaint.status] || statusConfig.Open;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={complaint._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card p-6 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => { setSelectedComplaint(complaint); setShowDetailsModal(true); }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 ${cfg.bg} rounded-xl flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge ${cfg.badge} text-xs`}>{complaint.status}</span>
                        <span className={`badge ${priorityBadge[complaint.priority]} text-xs`}>{complaint.priority}</span>
                        <span className="badge badge-secondary text-xs">{complaint.category}</span>
                      </div>
                      {/* Location */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                        <span className="flex items-center gap-1"><FiHome className="w-3 h-3" />{complaint.hostelName}</span>
                        <span className="flex items-center gap-1"><FiLayers className="w-3 h-3" />Floor {complaint.floorNumber}</span>
                        <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />Room {complaint.roomNumber}</span>
                      </div>
                      {/* Complaint text */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{complaint.complaintText}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true })}
                        {complaint.resolvedAt && (
                          <span className="text-green-600 ml-3">
                            Resolved {format(new Date(complaint.resolvedAt), 'dd MMM yyyy')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <FiEye className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== Add Complaint Modal ===== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">Submit Complaint</h2>
                    <p className="text-sm text-gray-500 mt-1">Provide location details for faster resolution</p>
                  </div>
                  <button onClick={() => { setShowAddModal(false); setFormErrors({}); }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  {/* Location Section */}
                  <div className="p-4 glass rounded-xl space-y-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-primary-500" /> Location Details
                    </p>

                    {/* Hostel Block */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hostel Block <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {hostels.map(h => (
                          <button key={h} type="button"
                            onClick={() => { setFormData({ ...formData, hostelName: h }); setFormErrors({ ...formErrors, hostelName: '' }); }}
                            className={`py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                              formData.hostelName === h
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                : 'border-gray-200 dark:border-gray-700 glass'
                            }`}>
                            {h}
                          </button>
                        ))}
                      </div>
                      {formErrors.hostelName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{formErrors.hostelName}</p>}
                    </div>

                    {/* Floor + Room Number */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Floor Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                          <input type="text" value={formData.floorNumber} placeholder="e.g. 2"
                            onChange={(e) => { setFormData({ ...formData, floorNumber: e.target.value }); setFormErrors({ ...formErrors, floorNumber: '' }); }}
                            className={`input-modern pl-9 ${formErrors.floorNumber ? 'border-red-500' : ''}`} />
                        </div>
                        {formErrors.floorNumber && <p className="text-red-500 text-xs mt-1">{formErrors.floorNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Room Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                          <input type="text" value={formData.roomNumber} placeholder="e.g. 201"
                            onChange={(e) => { setFormData({ ...formData, roomNumber: e.target.value }); setFormErrors({ ...formErrors, roomNumber: '' }); }}
                            className={`input-modern pl-9 ${formErrors.roomNumber ? 'border-red-500' : ''}`} />
                        </div>
                        {formErrors.roomNumber && <p className="text-red-500 text-xs mt-1">{formErrors.roomNumber}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Category + Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-modern">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="input-modern">
                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Complaint Description <span className="text-red-500">*</span>
                    </label>
                    <textarea required value={formData.complaintText}
                      onChange={(e) => { setFormData({ ...formData, complaintText: e.target.value }); setFormErrors({ ...formErrors, complaintText: '' }); }}
                      className={`input-modern ${formErrors.complaintText ? 'border-red-500' : ''}`}
                      rows="5" placeholder="Describe your issue in detail..." />
                    {formErrors.complaintText && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{formErrors.complaintText}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => { setShowAddModal(false); setFormErrors({}); }} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                      ) : (
                        <><FiSend className="w-4 h-4" /> Submit Complaint</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {/* Status + badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${(statusConfig[selectedComplaint.status] || statusConfig.Open).badge}`}>{selectedComplaint.status}</span>
                    <span className={`badge ${priorityBadge[selectedComplaint.priority]}`}>{selectedComplaint.priority}</span>
                    <span className="badge badge-secondary">{selectedComplaint.category}</span>
                  </div>

                  {/* Location */}
                  <div className="p-4 glass rounded-xl">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-primary-500" /> Location
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Hostel Block</p>
                        <p className="font-medium">{selectedComplaint.hostelName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Floor</p>
                        <p className="font-medium">{selectedComplaint.floorNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Room</p>
                        <p className="font-medium">{selectedComplaint.roomNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Complaint text */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Complaint</h3>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-gray-900 dark:text-white leading-relaxed">{selectedComplaint.complaintText}</p>
                    </div>
                  </div>

                  {/* Resolution */}
                  {selectedComplaint.resolution && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Admin Resolution</h3>
                      <div className="glass p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-gray-900 dark:text-white">{selectedComplaint.resolution}</p>
                        {selectedComplaint.resolvedBy && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Resolved by {selectedComplaint.resolvedBy.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                    <div className="glass p-4 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted</span>
                        <span>{format(new Date(selectedComplaint.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Updated</span>
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

                <div className="flex justify-end mt-6">
                  <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyComplaints;