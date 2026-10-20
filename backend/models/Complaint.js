import mongoose from 'mongoose';

const complaintSchema = mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // ── Location fields (required on submission) ──────────────────────────────
  hostelName: {
    type: String,
    enum: ['Block A', 'Block B', 'Block C', 'PG'],
    required: true
  },
  floorNumber: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  // ── Complaint details ─────────────────────────────────────────────────────
  complaintText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Room', 'Food', 'Maintenance', 'Electricity', 'Water', 'Internet', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;