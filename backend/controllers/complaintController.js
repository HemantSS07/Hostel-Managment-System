import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';

// @desc    Get all complaints (admin)
// @route   GET /api/complaints
// @access  Private/Admin
const getComplaints = asyncHandler(async (req, res) => {
  const filter = {};

  // Optional filter by status
  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  // Optional filter by category
  if (req.query.category && req.query.category !== 'all') {
    filter.category = req.query.category;
  }
  // Optional filter by priority
  if (req.query.priority && req.query.priority !== 'all') {
    filter.priority = req.query.priority;
  }
  // For polling: only return complaints updated after a certain timestamp
  if (req.query.since) {
    filter.updatedAt = { $gt: new Date(req.query.since) };
  }

  const complaints = await Complaint.find(filter)
    .populate({
      path: 'studentId',
      select: 'name registerNumber hostelBlock roomId year department contactNumber',
      populate: { path: 'roomId', select: 'roomNumber block floor' }
    })
    .populate('resolvedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(complaints);
});

// @desc    Get student's own complaints
// @route   GET /api/complaints/student/:studentId
// @access  Private
const getStudentComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ studentId: req.params.studentId })
    .populate('resolvedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(complaints);
});

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
  const {
    studentId,
    hostelName,
    floorNumber,
    roomNumber,
    complaintText,
    category,
    priority
  } = req.body;

  if (!hostelName || !floorNumber || !roomNumber) {
    res.status(400);
    throw new Error('Hostel name, floor number, and room number are required');
  }

  if (!complaintText || !complaintText.trim()) {
    res.status(400);
    throw new Error('Complaint description is required');
  }

  const complaint = await Complaint.create({
    studentId,
    hostelName,
    floorNumber,
    roomNumber,
    complaintText: complaintText.trim(),
    category: category || 'Other',
    priority: priority || 'Medium',
    status: 'Open'
  });

  const populated = await Complaint.findById(complaint._id)
    .populate('studentId', 'name registerNumber');

  res.status(201).json(populated);
});

// @desc    Update complaint status (admin can set any status; student can only see)
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const { status, resolution } = req.body;

  const updateData = {
    status,
    ...(status === 'Resolved' && {
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      resolution: resolution || ''
    })
  };

  const updatedComplaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  )
    .populate({
      path: 'studentId',
      select: 'name registerNumber hostelBlock roomId year department',
      populate: { path: 'roomId', select: 'roomNumber block floor' }
    })
    .populate('resolvedBy', 'name');

  res.json(updatedComplaint);
});

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  await complaint.deleteOne();
  res.json({ message: 'Complaint deleted' });
});

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private/Admin
const getComplaintStats = asyncHandler(async (req, res) => {
  const [
    totalComplaints,
    openComplaints,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    complaintsByCategory,
    complaintsByPriority
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'Open' }),
    Complaint.countDocuments({ status: 'Pending' }),
    Complaint.countDocuments({ status: 'In Progress' }),
    Complaint.countDocuments({ status: 'Resolved' }),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
  ]);

  res.json({
    totalComplaints,
    openComplaints,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    complaintsByCategory,
    complaintsByPriority
  });
});

export {
  getComplaints,
  getStudentComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats
};