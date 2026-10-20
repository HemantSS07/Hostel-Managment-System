import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiHome, 
  FiDollarSign, 
  FiAlertCircle,
  FiTrendingUp,
  FiActivity,
  FiCalendar
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
  Legend
} from 'recharts';
import StatsCard from '../common/StatsCard';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000); // 60 seconds auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await dashboardAPI.getAdminDashboard();
      setStats(data.stats);
      setChartData(data.charts?.monthlyStats || []);
    } catch (error) {
      if (!silent) toast.error('Failed to fetch dashboard data');
    } finally {
      if (!silent) setLoading(false);
    }
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your hostel today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FiCalendar className="w-4 h-4" />
            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiActivity className="w-5 h-5" />
            <span>Generate Report</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={FiUsers}
          trend={stats?.totalCapacity ? Math.round(((stats?.totalStudents || 0) / stats.totalCapacity) * 100) : 0}
          color="primary"
          onClick={() => navigate('/admin/students')}
        />
        <StatsCard
          title="Available Rooms"
          value={stats?.availableRooms || 0}
          icon={FiHome}
          trend={stats?.totalCapacity ? Math.round(((stats?.availableRooms || 0) / stats.totalCapacity) * 100) : 0}
          color="success"
          onClick={() => navigate('/admin/rooms')}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          trend={chartData?.length >= 2 && chartData[1]?.revenue > 0 ? Math.round(((chartData[0].revenue - chartData[1].revenue) / chartData[1].revenue) * 100) : 0}
          color="warning"
          onClick={() => navigate('/admin/payments')}
        />
        <StatsCard
          title="Open Complaints"
          value={stats?.openComplaints || 0}
          icon={FiAlertCircle}
          trend={stats?.totalComplaints ? -Math.round(((stats?.openComplaints || 0) / stats.totalComplaints) * 100) : 0}
          color="danger"
          onClick={() => navigate('/admin/complaints')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="text-green-500" />
              <span className="text-sm text-green-500">+12.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Room Occupancy Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Room Occupancy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Occupied', value: stats?.occupiedRooms || 0 },
                  { name: 'Available', value: stats?.availableRooms || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;