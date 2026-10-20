import express from 'express';
import {
  getPayments,
  getStudentPayments,
  createPayment,
  getPaymentStats,
  createPaymentRequests,
  payPaymentRequest,
  declinePaymentRequest
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getPayments)
  .post(protect, admin, createPayment);

router.post('/request', protect, admin, createPaymentRequests);
router.put('/:id/pay', protect, payPaymentRequest);
router.put('/:id/decline', protect, admin, declinePaymentRequest);

router.get('/stats', protect, admin, getPaymentStats);
router.get('/student/:studentId', protect, getStudentPayments);

export default router;