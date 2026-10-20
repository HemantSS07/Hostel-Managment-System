import express from 'express';
import {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats
} from '../controllers/roomController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getRooms)
  .post(protect, admin, createRoom);

router.get('/available', protect, getAvailableRooms);
router.get('/stats', protect, admin, getRoomStats);

router.route('/:id')
  .get(protect, getRoomById)
  .put(protect, admin, updateRoom)
  .delete(protect, admin, deleteRoom);

export default router;