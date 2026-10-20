import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Room from '../models/Room.js';
import Payment from '../models/Payment.js';
import Complaint from '../models/Complaint.js';

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  // Student stats
  const totalStudents = await Student.countDocuments();
  const studentsByYear = await Student.aggregate([
    { $group: { _id: "$year", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const studentsByDepartment = await Student.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } }
  ]);

  // Room stats
  const totalRooms = await Room.countDocuments();
  const roomStats = await Room.aggregate([
    {
      $group: {
        _id: null,
        totalCapacity: { $sum: "$capacity" },
        totalOccupied: { $sum: "$occupiedCount" }
      }
    }
  ]);

  // Payment stats
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'Paid' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const pendingFees = await Student.countDocuments({ feesStatus: 'Pending' });

  // Recent payments
  const recentPayments = await Payment.find({})
    .populate('studentId', 'name registerNumber')
    .sort({ createdAt: -1 })
    .limit(5);

  // Complaint stats
  const totalComplaints = await Complaint.countDocuments();
  const openComplaints = await Complaint.countDocuments({ status: 'Open' });
  const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
  const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });

  // Recent complaints
  const recentComplaints = await Complaint.find({})
    .populate('studentId', 'name registerNumber')
    .sort({ createdAt: -1 })
    .limit(5);

  // Monthly trends
  const monthlyStats = await Payment.aggregate([
    { $match: { status: 'Paid' } },
    {
      $group: {
        _id: { 
          month: { $month: "$paymentDate" },
          year: { $year: "$paymentDate" }
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 }
  ]);

  res.json({
    stats: {
      totalStudents,
      totalRooms,
      totalCapacity: roomStats[0]?.totalCapacity || 0,
      occupiedRooms: roomStats[0]?.totalOccupied || 0,
      availableRooms: (roomStats[0]?.totalCapacity || 0) - (roomStats[0]?.totalOccupied || 0),
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingFees,
      totalComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints
    },
    charts: {
      studentsByYear,
      studentsByDepartment,
      monthlyStats
    },
    recent: {
      payments: recentPayments,
      complaints: recentComplaints
    }
  });
});

// @desc    Get student dashboard stats
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboard = asyncHandler(async (req, res) => {
  // req.user.studentId may be a full populated object {_id,...} or a plain ObjectId
  const rawStudentId = req.user.studentId;
  const studentId = rawStudentId?._id || rawStudentId;

  if (!studentId) {
    res.status(400);
    throw new Error('No student profile linked to this account. Please contact admin.');
  }

  const student = await Student.findById(studentId).populate('roomId');

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Get payment history
  const payments = await Payment.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get complaint history
  const complaints = await Complaint.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate total paid
  const totalPaid = await Payment.aggregate([
    { $match: { studentId: student._id, status: 'Paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const pendingAmount = student.feesStatus === 'Pending' ? 5000 : 0;

  res.json({
    student,
    payments,
    complaints,
    stats: {
      totalPaid: totalPaid[0]?.total || 0,
      pendingAmount,
      openComplaints: complaints.filter(c => c.status === 'Open' || c.status === 'Pending').length,
      resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length
    }
  });
});

export {
  getAdminDashboard,
  getStudentDashboard
};