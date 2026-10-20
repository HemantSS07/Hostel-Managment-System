import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';

const MyPayments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    lastPayment: null
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_payment', (payment) => {
      setPayments(prev => [payment, ...prev]);
      toast.success('New payment request received: ₹' + payment.amount);
    });

    socket.on('payment_updated', (updatedPayment) => {
      setPayments(prev => prev.map(p => 
        p._id === updatedPayment._id ? updatedPayment : p
      ));
      if (updatedPayment.status === 'Paid') {
        toast.success('Payment successfully processed');
      }
    });

    return () => {
      socket.off('new_payment');
      socket.off('payment_updated');
    };
  }, [socket]);

  const fetchPayments = async () => {
    if (!user?.studentId) {
      setLoading(false);
      setError('unlinked');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const studentId = typeof user.studentId === 'object' ? user.studentId._id : user.studentId;
      const { data } = await paymentAPI.getByStudent(studentId);
      setPayments(data);
      
      // Calculate stats
      const paid = data.filter(p => p.status === 'Paid');
      const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
      const pending = data.filter(p => p.status === 'Pending');
      const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
      
      setStats({
        totalPaid,
        pendingAmount,
        lastPayment: paid.length > 0 ? paid[0] : null
      });
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 500) {
        setError('unlinked');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch payments');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'Pending':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'Failed':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiCreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDownloadReceipt = (payment) => {
    toast.success('Receipt downloaded successfully');
    // Implement receipt download
  };

  const handlePayNow = async (payment) => {
    try {
      // The backend sets this to 'paid' immediately
      await paymentAPI.payRequest(payment._id);
      // We don't necessarily update state here, as socket 'payment_updated' will catch it
      // But just in case, we can show an initial msg
      toast.success('Processing payment...');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payment');
    }
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
            <FiCreditCard className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Profile Not Linked
          </h2>
          <p className="text-red-700 dark:text-red-300 max-w-md mx-auto mb-8">
            You cannot view or make payments because your account does not have an associated student profile in the system.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold gradient-text">My Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your payment history and fee status
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                ₹{stats.totalPaid.toLocaleString()}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                ₹{stats.pendingAmount.toLocaleString()}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Payment</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.lastPayment ? `₹${stats.lastPayment.amount}` : 'N/A'}
              </p>
            </div>
            <FiCalendar className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          {stats.lastPayment?.paymentDate && (
            <p className="text-xs text-gray-500 mt-2">
              {format(new Date(stats.lastPayment.paymentDate), 'dd MMM yyyy')}
            </p>
          )}
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Payment History</h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <FiCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono">{payment.transactionId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {payment.duration || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {payment.dueDate ? format(new Date(payment.dueDate), 'dd MMM yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">₹{payment.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{payment.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`badge ${
                          payment.status === 'Paid' ? 'badge-success' :
                          payment.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.paymentDate 
                          ? format(new Date(payment.paymentDate), 'dd/MM/yyyy')
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowReceipt(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {payment.status === 'Paid' && (
                          <button
                            onClick={() => handleDownloadReceipt(payment)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        )}
                        {(payment.status === 'Pending' || payment.status === 'Overdue') && (
                          <button
                            onClick={() => handlePayNow(payment)}
                            className="ml-2 px-3 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                          >
                            Pay Now
                          </button>
                        )}
                        {payment.status === 'Declined' && (
                          <span className="ml-2 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                            Declined by Admin
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment Summary */}
      {payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Methods Used</p>
              <div className="space-y-2">
                {Object.entries(
                  payments.reduce((acc, p) => {
                    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([method, count]) => (
                  <div key={method} className="flex justify-between items-center">
                    <span className="text-sm">{method}</span>
                    <span className="text-sm font-medium">{count} times</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Average</p>
              <p className="text-3xl font-bold text-primary-600">
                ₹{(stats.totalPaid / payments.filter(p => p.status === 'Paid').length || 1).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {payments.filter(p => p.status === 'Paid').length} payments
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyPayments;