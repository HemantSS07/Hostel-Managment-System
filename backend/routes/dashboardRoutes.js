import express from 'express';
import {
  getAdminDashboard,
  getStudentDashboard
} from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, admin, getAdminDashboard);
router.get('/student', protect, getStudentDashboard);

export default router;