const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  activity: String,
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building', // tham chiếu tới Building
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // hoặc 'User' tùy theo bạn đặt tên model
  }],
  devices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  roomPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  area: { type: Number },  
  description: { type: String }, // Mô tả
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
