import asyncHandler from 'express-async-handler';
import Room from '../models/Room.js';
import Student from '../models/Student.js';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private/Admin
const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({}).sort({ block: 1, roomNumber: 1 });
  res.json(rooms);
});

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private
const getAvailableRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({
    $expr: { $lt: ["$occupiedCount", "$capacity"] }
  }).sort({ block: 1, roomNumber: 1 });
  
  res.json(rooms);
});

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (room) {
    // Get students in this room
    const students = await Student.find({ roomId: room._id }).select('name registerNumber department year');
    res.json({ ...room.toObject(), students });
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = asyncHandler(async (req, res) => {
  const { roomNumber, block, capacity, floor, roomType, amenities } = req.body;

  const roomExists = await Room.findOne({ roomNumber });

  if (roomExists) {
    res.status(400);
    throw new Error('Room already exists');
  }

  const room = await Room.create({
    roomNumber,
    block,
    capacity,
    floor,
    roomType,
    amenities: amenities || []
  });

  if (room) {
    res.status(201).json(room);
  } else {
    res.status(400);
    throw new Error('Invalid room data');
  }
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  // Ensure capacity isn't set below current occupancy
  if (req.body.capacity && req.body.capacity < room.occupiedCount) {
    res.status(400);
    throw new Error('Capacity cannot be less than current occupancy');
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedRoom);
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  if (room.occupiedCount > 0) {
    res.status(400);
    throw new Error('Cannot delete room with students');
  }

  await room.deleteOne();
  res.json({ message: 'Room removed' });
});

// @desc    Get room statistics
// @route   GET /api/rooms/stats
// @access  Private/Admin
const getRoomStats = asyncHandler(async (req, res) => {
  const totalRooms = await Room.countDocuments();
  const totalCapacity = await Room.aggregate([
    { $group: { _id: null, total: { $sum: "$capacity" } } }
  ]);
  const totalOccupied = await Room.aggregate([
    { $group: { _id: null, total: { $sum: "$occupiedCount" } } }
  ]);

  const statsByBlock = await Room.aggregate([
    {
      $group: {
        _id: "$block",
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: "$capacity" },
        totalOccupied: { $sum: "$occupiedCount" }
      }
    }
  ]);

  res.json({
    totalRooms,
    totalCapacity: totalCapacity[0]?.total || 0,
    totalOccupied: totalOccupied[0]?.total || 0,
    availableRooms: (totalCapacity[0]?.total || 0) - (totalOccupied[0]?.total || 0),
    statsByBlock
  });
});

export {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats
};