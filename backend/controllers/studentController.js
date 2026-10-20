import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import Room from '../models/Room.js';

// @desc    Get all students (with optional filters)
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { registerNumber: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  // Support filtering for students without a room assigned
  const unassignedFilter = req.query.unassigned === 'true'
    ? { roomId: { $exists: false } }
    : {};

  const filter = { ...keyword, ...unassignedFilter };
  const count = await Student.countDocuments(filter);
  const students = await Student.find(filter)
    .populate('roomId')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    students,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get all students without a room assigned
// @route   GET /api/students/unassigned
// @access  Private/Admin
const getUnassignedStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ roomId: { $exists: false } })
    .sort({ createdAt: -1 });
  res.json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('roomId');

  if (student) {
    // Check if user is admin or the student themselves
    const reqStudentId = req.user.studentId?._id || req.user.studentId;
    if (req.user.role === 'admin' ||
        (reqStudentId && reqStudentId.toString() === student._id.toString())) {
      res.json(student);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this student');
    }
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const { name, registerNumber, year, department, hostelBlock, roomId } = req.body;

  const studentExists = await Student.findOne({ registerNumber });

  if (studentExists) {
    res.status(400);
    throw new Error('Student already exists');
  }

  // Check room availability
  if (roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }
    if (room.isFull()) {
      res.status(400);
      throw new Error('Room is full');
    }
  }

  const student = await Student.create({
    name,
    registerNumber,
    year,
    department,
    hostelBlock,
    roomId
  });

  if (student && roomId) {
    // Update room occupied count
    await Room.findByIdAndUpdate(roomId, { $inc: { occupiedCount: 1 } });
  }

  if (student) {
    res.status(201).json(student);
  } else {
    res.status(400);
    throw new Error('Invalid student data');
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const reqStudentId = req.user.studentId?._id || req.user.studentId;
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && (!reqStudentId || reqStudentId.toString() !== student._id.toString())) {
    res.status(403);
    throw new Error('Not authorized to update this student');
  }

  const oldRoomId = student.roomId;
  const newRoomId = req.body.roomId;

  // Handle room changes
  if (isAdmin && oldRoomId && oldRoomId.toString() !== newRoomId) {
    // Decrease occupied count for old room
    await Room.findByIdAndUpdate(oldRoomId, { $inc: { occupiedCount: -1 } });

    // Increase occupied count for new room
    if (newRoomId) {
      const newRoom = await Room.findById(newRoomId);
      if (newRoom.isFull()) {
        res.status(400);
        throw new Error('New room is full');
      }
      await Room.findByIdAndUpdate(newRoomId, { $inc: { occupiedCount: 1 } });
    }
  }

  let updateData = req.body;
  if (!isAdmin) {
    // Restrict student from changing core fields like roomId, registerNumber, year, department, etc
    updateData = {
      name: req.body.name || student.name,
      contactNumber: req.body.contactNumber,
      parentContact: req.body.parentContact,
      address: req.body.address
    };
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate('roomId');

  const io = req.app.get('io');
  if (io) {
    io.emit('student_updated', updatedStudent);
  }

  res.json(updatedStudent);
});

// @desc    Assign a room to a student (with guards)
// @route   POST /api/students/:id/assign-room
// @access  Private/Admin
const assignRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.body;
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Guard: student can only have one room
  if (student.roomId) {
    res.status(400);
    throw new Error('Student already has a room assigned. Remove the current room first.');
  }

  if (!roomId) {
    res.status(400);
    throw new Error('Room ID is required');
  }

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  // Guard: check capacity
  if (room.isFull()) {
    res.status(400);
    throw new Error(`Room ${room.roomNumber} is at full capacity (${room.capacity}/${room.capacity})`);
  }

  // Assign room to student
  student.roomId = roomId;
  await student.save();

  // Increment room occupancy
  await Room.findByIdAndUpdate(roomId, { $inc: { occupiedCount: 1 } });

  const updatedStudent = await Student.findById(student._id).populate('roomId');
  res.json({
    message: `Room ${room.roomNumber} successfully assigned to ${student.name}`,
    student: updatedStudent
  });
});

// @desc    Remove room from a student
// @route   DELETE /api/students/:id/assign-room
// @access  Private/Admin
const removeRoom = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  if (!student.roomId) {
    res.status(400);
    throw new Error('Student does not have a room assigned');
  }

  const roomId = student.roomId;
  student.roomId = undefined;
  await student.save();

  // Decrement room occupancy
  await Room.findByIdAndUpdate(roomId, { $inc: { occupiedCount: -1 } });

  res.json({ message: 'Room removed from student successfully' });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Free up the room
  if (student.roomId) {
    await Room.findByIdAndUpdate(student.roomId, { $inc: { occupiedCount: -1 } });
  }

  await student.deleteOne();
  res.json({ message: 'Student removed' });
});

export {
  getStudents,
  getUnassignedStudents,
  getStudentById,
  createStudent,
  updateStudent,
  assignRoom,
  removeRoom,
  deleteStudent
};
