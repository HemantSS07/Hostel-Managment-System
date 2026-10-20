import mongoose from 'mongoose';

const roomSchema = mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  block: {
    type: String,
    enum: ['Block A', 'Block B', 'Block C', 'PG'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  occupiedCount: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String
  }],
  floor: {
    type: Number,
    required: true
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Dormitory'],
    default: 'Double'
  }
}, {
  timestamps: true
});

roomSchema.methods.isFull = function() {
  return this.occupiedCount >= this.capacity;
};

const Room = mongoose.model('Room', roomSchema);
export default Room;