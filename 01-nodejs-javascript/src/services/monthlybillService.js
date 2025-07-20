const MonthlyBill = require('../models/monthlybill');
const PDFDocument = require('pdfkit');
const path = require("path");
const fs = require('fs');
const Room = require('../models/room');

const monthlyBillService = {
  // Tạo mới bill
  create: async (data) => {
    const room = await Room.findById(data.room).populate('building');
    if (!room || !room.building) throw new Error('Không tìm thấy phòng hoặc tòa nhà');

    const building = room.building;
    const electricityPrice = building.electricityUnitPrice || 0;
    const waterPrice = building.waterUnitPrice || 0;
    const roomPrice = room.roomPrice || data.roomPrice || 0;// lấy trực tiếp từ room

    const electricityUsage = Math.max(0, data.sodienmoi - data.sodiencu);
    const waterUsage = Math.max(0, data.sonuocmoi - data.sonuoccu);

    const totalCost =
      roomPrice +
      electricityUsage * electricityPrice +
      waterUsage * waterPrice;

    const bill = new MonthlyBill({
      ...data,
      roomPrice, // ghi lại để lưu đúng theo thời điểm
      electricityUsage,
      waterUsage,
      totalCost
    });

    return await bill.save();
  },

  // Cập nhật bill theo ID
  update: async (id, data) => {
    const existingBill = await MonthlyBill.findById(id).populate({
      path: 'room',
      populate: { path: 'building' }
    });

    if (!existingBill) throw new Error('Không tìm thấy hóa đơn');

    const room = existingBill.room;
    const building = room?.building;
    const roomPrice = room?.roomPrice || 0; // lấy từ room, không dùng data.roomPrice

    // Lấy dữ liệu mới (ưu tiên data mới, fallback dùng cũ)
    const sodiencu = data.sodiencu ?? existingBill.sodiencu;
    const sodienmoi = data.sodienmoi ?? existingBill.sodienmoi;
    const sonuoccu = data.sonuoccu ?? existingBill.sonuoccu;
    const sonuocmoi = data.sonuocmoi ?? existingBill.sonuocmoi;

    const electricityUsage = Math.max(0, sodienmoi - sodiencu);
    const waterUsage = Math.max(0, sonuocmoi - sonuoccu);

    const electricityPrice = building?.electricityUnitPrice || 0;
    const waterPrice = building?.waterUnitPrice || 0;

    const totalCost =
      roomPrice +
      electricityUsage * electricityPrice +
      waterUsage * waterPrice;

    return await MonthlyBill.findByIdAndUpdate(
      id,
      {
        ...data,
        roomPrice, //  cập nhật lại nếu giá phòng có thay đổi
        electricityUsage,
        waterUsage,
        totalCost
      },
      { new: true }
    );
  },

  // Xóa bill
  delete: async (id) => {
    return await MonthlyBill.findByIdAndDelete(id);
  },

  // Lấy bill theo ID
  getById: async (id) => {
    return await MonthlyBill.findById(id).populate({
      path: 'room',
      populate: {
        path: 'building',
        model: 'Building',
      },
    });
  },

  // Lấy tất cả bill theo filter
  getAll: async (filter = {}) => {
    return await MonthlyBill.find(filter).populate({
      path: 'room',
      populate: {
        path: 'building',
        model: 'Building',
      },
    });
  },

  // Thống kê tổng tiền theo tháng và năm
  getSummaryByMonthYear: async (month, year) => {
    const bills = await MonthlyBill.find({ month, year }).populate({
      path: 'room',
      populate: {
        path: 'building',
        model: 'Building',
      },
    });

    let total = 0;

    for (const bill of bills) {
      const electricityPrice = bill.room?.building?.electricityUnitPrice || 0;
      const waterPrice = bill.room?.building?.waterUnitPrice || 0;

      const billTotal =
        (bill.roomPrice || 0) +
        electricityPrice * (bill.electricityUsage || 0) +
        waterPrice * (bill.waterUsage || 0);

      total += billTotal;
    }

    return {
      month,
      year,
      total,
      count: bills.length,
    };
  }
};

module.exports = monthlyBillService;
