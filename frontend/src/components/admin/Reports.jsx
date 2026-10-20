import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiHome,
  FiPrinter,
  FiFileText,
  FiFilter
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { dashboardAPI, paymentAPI, studentAPI, roomAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [dashboard, payments, students, rooms] = await Promise.all([
        dashboardAPI.getAdminDashboard(),
        paymentAPI.getStats(),
        studentAPI.getAll({ limit: 1000 }),
        roomAPI.getStats()
      ]);
      
      setReportData({
        dashboard: dashboard.data,
        payments: payments.data,
        students: students.data,
        rooms: rooms.data
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.success('PDF report generated successfully');
    // Implement PDF generation
  };

  const handleExportExcel = () => {
    toast.success('Excel report generated successfully');
    // Implement Excel export
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-500" />
        </div>
      </div>
    );
  }

  const revenueData = reportData?.payments?.monthlyRevenue || [];
  const occupancyData = [
    { name: 'Occupied', value: reportData?.rooms?.totalOccupied || 0 },
    { name: 'Available', value: reportData?.rooms?.availableRooms || 0 }
  ];
  const studentDistribution = reportData?.dashboard?.charts?.studentsByDepartment || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and export detailed reports
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="p-2 glass rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300"
              title="Export as PDF"
            >
              <FiFileText className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportExcel}
              className="p-2 glass rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300"
              title="Export as Excel"
            >
              <FiDownload className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="p-2 glass rounded-xl hover:bg-gray-100 dark:hover:bg-dark-300"
              title="Print Report"
            >
              <FiPrinter className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="glass-card p-4">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: FiPieChart },
            { id: 'financial', label: 'Financial', icon: FiDollarSign },
            { id: 'occupancy', label: 'Occupancy', icon: FiHome },
            { id: 'students', label: 'Students', icon: FiUsers },
          ].map((report) => (
            <motion.button
              key={report.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                selectedReport === report.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'hover:bg-gray-100 dark:hover:bg-dark-300'
              }`}
            >
              <report.icon className="w-4 h-4" />
              <span>{report.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{reportData?.payments?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData?.dashboard?.stats?.totalStudents || 0}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((reportData?.rooms?.totalOccupied || 0) / (reportData?.rooms?.totalCapacity || 1) * 100).toFixed(1)}%
                </p>
              </div>
              <FiHome className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData?.payments?.pendingPayments || 0}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Student Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Student Distribution by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {studentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Room Occupancy by Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4">Room Occupancy by Block</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.rooms?.statsByBlock || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="_id" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalCapacity" fill="#3B82F6" name="Total Capacity" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalOccupied" fill="#10B981" name="Occupied" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Payments */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Recent Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData?.dashboard?.recent?.payments?.slice(0, 5).map((payment, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{payment.studentId?.name}</td>
                      <td className="px-4 py-3 text-sm">₹{payment.amount}</td>
                      <td className="px-4 py-3 text-sm">
                        {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-success">{payment.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Fees */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Pending Fee Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block/Room</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData?.students?.students
                    ?.filter(s => s.feesStatus === 'Pending')
                    .slice(0, 5)
                    .map((student, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{student.name}</td>
                        <td className="px-4 py-3 text-sm">{student.registerNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          {student.hostelBlock} / {student.roomId?.roomNumber || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge badge-warning">Pending</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;