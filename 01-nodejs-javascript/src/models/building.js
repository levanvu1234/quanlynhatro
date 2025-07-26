const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  activity: {
    type: String,
    enum: ['Hoạt động', 'Tạm dừng'],
    default: 'Hoạt động'
  },
  electricityUnitPrice: { type: Number, default: 3000 }, // đơn giá điện
  waterUnitPrice: { type: Number, default: 7000 },       // đơn giá nước
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  images: [String],
  location: String,
}, { timestamps: true });

const Building = mongoose.model('Building', buildingSchema);
module.exports = Building;


