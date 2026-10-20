import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed', 'Overdue', 'Declined'],
    default: 'Pending'
  },
  duration: {
    type: String,
    enum: ['1 month', '6 months', '1 year']
  },
  dueDate: {
    type: Date
  },
  description: {
    type: String
  },
  paidDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer']
  },
  transactionId: {
    type: String
  },
  month: {
    type: String
  },
  year: {
    type: Number
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;