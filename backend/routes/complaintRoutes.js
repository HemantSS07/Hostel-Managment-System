import express from 'express';
import {
  getComplaints,
  getStudentComplaints,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats
} from '../controllers/complaintController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getComplaintStats);
router.get('/student/:studentId', protect, getStudentComplaints);

router.route('/')
  .get(protect, admin, getComplaints)
  .post(protect, createComplaint);

router.route('/:id')
  .put(protect, admin, updateComplaintStatus)
  .delete(protect, admin, deleteComplaint);

export default router;