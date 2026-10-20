import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    registerNumber,
    year,
    department,
    hostelBlock,
    contactNumber
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create the User account first
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student'
  });

  // For students, auto-create a Student record so it is immediately visible to admins
  if ((role === 'student' || !role) && registerNumber) {
    // Check if register number is already taken
    const existingStudent = await Student.findOne({ registerNumber });

    if (existingStudent) {
      // Link existing student profile (admin pre-created) to this user account
      user.studentId = existingStudent._id;
      await user.save();
    } else {
      // Validate required student fields
      if (!year || !department || !hostelBlock) {
        // Clean up user if we can't create the student record
        await user.deleteOne();
        res.status(400);
        throw new Error('Year, department, and hostel block are required for student registration');
      }

      // Auto-create a new Student record from registration data
      const student = await Student.create({
        name,
        registerNumber,
        year: Number(year),
        department,
        hostelBlock,
        contactNumber: contactNumber || '',
        feesStatus: 'Pending'
      });

      // Link student profile to user
      user.studentId = student._id;
      await user.save();
    }
  }

  if (user) {
    // Re-fetch with populated studentId for complete response
    const populatedUser = await User.findById(user._id).populate('studentId');
    res.status(201).json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      studentId: populatedUser.studentId,
      token: generateToken(populatedUser._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate('studentId');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('studentId');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { registerUser, loginUser, getUserProfile };