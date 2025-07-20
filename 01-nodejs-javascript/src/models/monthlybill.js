const mongoose = require('mongoose');
const Room = require('./room');
const Building = require('./building');

const monthlyBillSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  roomPrice: { type: Number },

  sodienmoi: { type: Number, default: 0 },
  sodiencu: { type: Number, default: 0 },
  sonuocmoi: { type: Number, default: 0 },
  sonuoccu: { type: Number, default: 0 },

  electricityUsage: { type: Number, default: 0 },
  waterUsage: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Tính usage trước khi lưu
monthlyBillSchema.pre('save', function (next) {
  this.electricityUsage = Math.max(0, this.sodienmoi - this.sodiencu);
  this.waterUsage = Math.max(0, this.sonuocmoi - this.sonuoccu);
  next();
});

// KHÔNG CẦN virtual nữa — đã lưu totalCost là field thật

monthlyBillSchema.set('toJSON', { virtuals: true });
monthlyBillSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.MonthlyBill || mongoose.model("MonthlyBill", monthlyBillSchema);
