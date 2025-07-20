const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Tên thiết bị: Quạt, Máy lạnh, Wifi...
  },
  quantity: {
    type: Number,
    default: 1, // Số lượng thiết bị trong phòng
  },
  condition: {
    type: String,
    enum: ['Tốt', 'Đang sửa', 'Hư hỏng'],
    default: 'Tốt',
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true, // Liên kết phòng sở hữu thiết bị này
  },
  note: {
    type: String, // Ghi chú thêm nếu có
  },
}, {
  timestamps: true, // tự động tạo createdAt và updatedAt
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
