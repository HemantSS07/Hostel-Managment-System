import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiSearch, FiFilter, FiDownload, FiPlus, FiEye, FiCheck, FiX, FiClock, FiTrendingUp, FiCalendar, FiCreditCard, FiSend } from 'react-icons/fi';
import { paymentAPI, studentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const socket = useSocket();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'Cash',
    month: format(new Date(), 'MMMM'),
    year: new Date().getFullYear(),
    transactionId: '',
    remarks: ''
  });
  const [reqFormData, setReqFormData] = useState({
    studentIds: [],
    amount: '',
    duration: '1 month',
    dueDate: '',
    description: ''
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer'];
  const durations = ['1 month', '6 months', '1 year'];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_payment', (payment) => {
      setPayments(prev => [payment, ...prev]);
      fetchStats();
    });
    socket.on('payment_updated', (payment) => {
      setPayments(prev => prev.map(p => p._id === payment._id ? payment : p));
      fetchStats();
    });
    return () => {
      socket.off('new_payment');
      socket.off('payment_updated');
    };
  }, [socket]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await paymentAPI.getAll();
      setPayments(data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await paymentAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch payment stats');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll({ limit: 100 });
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create(formData);
      toast.success('Payment recorded successfully');
      setShowAddModal(false);
      resetForm();
      fetchPayments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      amount: '',
      paymentMethod: 'Cash',
      month: format(new Date(), 'MMMM'),
      year: new Date().getFullYear(),
      transactionId: '',
      remarks: ''
    });
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.createRequests(reqFormData);
      toast.success('Payment requests sent successfully');
      setShowRequestModal(false);
      resetReqForm();
      // Socket handles UI update, but we can fetch just in case
      // fetchPayments(); 
    } catch (err) {
      toast.error('Failed to send requests');
    }
  };

  const resetReqForm = () => {
    setReqFormData({
      studentIds: [],
      amount: '',
      duration: '1 month',
      dueDate: '',
      description: ''
    });
  };

  const handleDecline = async (payment) => {
    if (window.confirm('Are you sure you want to decline/cancel this payment request?')) {
      try {
        await paymentAPI.declineRequest(payment._id, 'Canceled by Admin');
        toast.info('Payment request declined successfully');
        // We don't necessarily update state directly, as our socket listener 'payment_updated' 
        // will pick this up automatically and trigger a re-render.
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to decline request');
      }
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || payment.month === filterMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Paid': 'badge-success',
      'Pending': 'badge-warning',
      'Failed': 'badge-danger',
      'Declined': 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all fee payments
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRequestModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiSend className="w-5 h-5" />
            <span>Send Request</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Record Payment</span>
          </motion.button>
        </div>
      </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ₹{stats.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <FiTrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {stats.pendingPayments || 0}
                  </p>
                </div>
                <FiClock className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{stats.monthlyRevenue?.[0]?.total?.toLocaleString() || 0}
                  </p>
                </div>
                <FiCalendar className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {payments.length}
                  </p>
                </div>
                <FiCreditCard className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, register number or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 glass rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300"
              >
                <FiDownload className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration / Month
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {payment.transactionId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {payment.studentId?.name?.charAt(0) || 'S'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.studentId?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.studentId?.registerNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{payment.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {payment.duration || (payment.month + ' ' + payment.year)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {payment.dueDate ? format(new Date(payment.dueDate), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                          {(payment.status === 'Pending' || payment.status === 'Overdue') && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDecline(payment)}
                              className="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                            >
                              Decline
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Payment Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Record Payment</h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Student</label>
                      <select
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="input-modern"
                      >
                        <option value="">Select Student</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name} - {student.registerNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="input-modern"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                          required
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="input-modern"
                        >
                          {paymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Month</label>
                        <select
                          required
                          value={formData.month}
                          onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                          className="input-modern"
                        >
                          {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Year</label>
                        <select
                          required
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          className="input-modern"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Transaction ID (Optional)</label>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        className="input-modern"
                        placeholder="TXN123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Remarks</label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="input-modern"
                        rows="2"
                        placeholder="Any additional notes..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Record Payment
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Request Payment Modal */}
        <AnimatePresence>
          {showRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Send Payment Request</h2>
                    <button
                      onClick={() => {
                        setShowRequestModal(false);
                        resetReqForm();
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSendRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Students</label>
                      <select
                        multiple
                        required
                        value={reqFormData.studentIds}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setReqFormData({ ...reqFormData, studentIds: values });
                        }}
                        className="input-modern h-32"
                      >
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name} - {student.registerNumber}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs mt-1 text-gray-500">Hold Ctrl (or Cmd) to select multiple</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={reqFormData.amount}
                          onChange={(e) => setReqFormData({ ...reqFormData, amount: e.target.value })}
                          className="input-modern"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <select
                          required
                          value={reqFormData.duration}
                          onChange={(e) => setReqFormData({ ...reqFormData, duration: e.target.value })}
                          className="input-modern"
                        >
                          {durations.map(duration => (
                            <option key={duration} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date</label>
                      <input
                        type="date"
                        required
                        value={reqFormData.dueDate}
                        onChange={(e) => setReqFormData({ ...reqFormData, dueDate: e.target.value })}
                        className="input-modern"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description / Remarks</label>
                      <textarea
                        value={reqFormData.description}
                        onChange={(e) => setReqFormData({ ...reqFormData, description: e.target.value })}
                        className="input-modern"
                        rows="2"
                        placeholder="E.g., Hostel fee for first semester"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRequestModal(false);
                          resetReqForm();
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary flex items-center">
                        <FiSend className="mr-2 h-4 w-4" /> Send
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-md"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Payment Details</h2>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{selectedPayment.amount?.toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Student</span>
                        <span className="text-sm font-medium">
                          {selectedPayment.studentId?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Register Number</span>
                        <span className="text-sm font-medium">
                          {selectedPayment.studentId?.registerNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                        <span className="text-sm font-mono">
                          {selectedPayment.transactionId || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                        <span className="text-sm font-medium">
                          {selectedPayment.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Month/Year</span>
                        <span className="text-sm font-medium">
                          {selectedPayment.month} {selectedPayment.year}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payment Date</span>
                        <span className="text-sm font-medium">
                          {selectedPayment.paymentDate
                            ? format(new Date(selectedPayment.paymentDate), 'dd MMM yyyy, hh:mm a')
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`badge ${getStatusBadge(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                      {selectedPayment.remarks && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remarks</p>
                          <p className="text-sm">{selectedPayment.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="btn-secondary"
                    >
                      Close
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

      export default PaymentManagement;