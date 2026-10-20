import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate('studentId', 'name registerNumber')
    .sort({ createdAt: -1 });
  
  res.json(payments);
});

// @desc    Get student payments
// @route   GET /api/payments/student/:studentId
// @access  Private
const getStudentPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ studentId: req.params.studentId })
    .sort({ createdAt: -1 });
  
  res.json(payments);
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, paymentMethod, month, year, transactionId } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const payment = await Payment.create({
    studentId,
    amount,
    status: 'Paid',
    paymentDate: new Date(),
    paymentMethod,
    month,
    year,
    transactionId
  });

  // Update student fee status
  await Student.findByIdAndUpdate(studentId, { feesStatus: 'Paid' });

  res.status(201).json(payment);
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'Paid' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const pendingPayments = await Student.countDocuments({ feesStatus: 'Pending' });

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: 'Paid' } },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 }
  ]);

  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingPayments,
    monthlyRevenue
  });
});

// @desc    Create payment requests for students
// @route   POST /api/payments/request
// @access  Private/Admin
const createPaymentRequests = asyncHandler(async (req, res) => {
  const { studentIds, amount, duration, dueDate, description } = req.body;

  if (!studentIds || !studentIds.length) {
    res.status(400);
    throw new Error('Please select at least one student');
  }

  const payments = [];
  for (const studentId of studentIds) {
    const payment = await Payment.create({
      studentId,
      amount,
      duration,
      dueDate,
      description,
      status: 'Pending',
    });
    const populatedPayment = await Payment.findById(payment._id).populate('studentId', 'name registerNumber');
    payments.push(populatedPayment);
    
    const io = req.app.get('io');
    if (io) {
      io.to(studentId.toString()).emit('new_payment', populatedPayment);
      io.to('admins').emit('new_payment', populatedPayment);
    }
  }

  res.status(201).json(payments);
});

// @desc    Student pays for a payment request
// @route   PUT /api/payments/:id/pay
// @access  Private
const payPaymentRequest = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  payment.status = 'Paid';
  payment.paidDate = new Date();
  
  // Simulated gateway data
  payment.transactionId = 'SIM_' + Math.random().toString(36).substring(2, 9).toUpperCase();
  payment.paymentMethod = 'Online';

  const updatedPayment = await payment.save();
  await updatedPayment.populate('studentId', 'name registerNumber');

  const io = req.app.get('io');
  if (io) {
    io.to(payment.studentId._id.toString()).emit('payment_updated', updatedPayment);
    io.to('admins').emit('payment_updated', updatedPayment);
  }

  res.json(updatedPayment);
});

// @desc    Student declines a payment request
// @route   PUT /api/payments/:id/decline
// @access  Private
const declinePaymentRequest = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  payment.status = 'Declined';
  payment.remarks = req.body.reason || 'Declined by student';

  const updatedPayment = await payment.save();
  await updatedPayment.populate('studentId', 'name registerNumber');

  const io = req.app.get('io');
  if (io) {
    io.to(payment.studentId._id.toString()).emit('payment_updated', updatedPayment);
    io.to('admins').emit('payment_updated', updatedPayment);
  }

  res.json(updatedPayment);
});

export {
  getPayments,
  getStudentPayments,
  createPayment,
  getPaymentStats,
  createPaymentRequests,
  payPaymentRequest,
  declinePaymentRequest
};