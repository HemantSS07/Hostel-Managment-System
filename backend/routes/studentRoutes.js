import express from 'express';
import {
  getStudents,
  getUnassignedStudents,
  getStudentById,
  createStudent,
  updateStudent,
  assignRoom,
  removeRoom,
  deleteStudent
} from '../controllers/studentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Must be before /:id to avoid being treated as a param
router.get('/unassigned', protect, admin, getUnassignedStudents);

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, updateStudent)
  .delete(protect, admin, deleteStudent);

// Room assignment routes
router.route('/:id/assign-room')
  .post(protect, admin, assignRoom)
  .delete(protect, admin, removeRoom);

export default router;