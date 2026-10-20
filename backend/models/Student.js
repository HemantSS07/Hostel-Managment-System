import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  department: {
    type: String,
    required: true
  },
  hostelBlock: {
    type: String,
    enum: ['Block A', 'Block B', 'Block C', 'PG'],
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  feesStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  contactNumber: {
    type: String
  },
  parentContact: {
    type: String
  },
  address: {
    type: String
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;