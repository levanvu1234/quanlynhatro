require("dotenv").config();
const Building = require("../models/building");
const MonthlyBill = require("../models/monthlybill");

const buildingService = {
  // Tạo tòa nhà mới
  createBuilding: async (buildingData) => {
    const building = new Building(buildingData);
    return await building.save();
  },

  // Lấy tất cả tòa nhà
  getAllBuildings: async () => {
    return await Building.find();
  },

  // Lấy tòa nhà theo ID
   getBuildingById : async (id) => {
      return Building.findById(id)
        .populate({
          path: 'rooms',
          populate: {
            path: 'devices',
            model: 'Device'  // Tên model của devices trong mongoose
          }
        });
    },

  // Cập nhật tòa nhà theo ID
  updateBuilding: async (id, updatedData) => {
    return await Building.findByIdAndUpdate(id, updatedData, { new: true });
  },

  // Xóa tòa nhà theo ID
  deleteBuilding: async (id) => {
    return await Building.findByIdAndDelete(id);
  },

  //  Thống kê doanh thu theo từng tòa nhà và từng tháng
  // Thống kê doanh thu theo từng tòa nhà và từng tháng
  getBuildingsWithRevenue: async () => {
    const buildings = await Building.find().populate("rooms");
    const roomMap = {};

    buildings.forEach(b => {
      b.rooms.forEach(r => {
        roomMap[r._id.toString()] = {
          building: b,
          room: r
        };
      });
    });

    const allRoomIds = Object.keys(roomMap);
    const bills = await MonthlyBill.find({ room: { $in: allRoomIds } });

    const buildingRevenueMap = {};

    buildings.forEach((b) => {
      buildingRevenueMap[b._id.toString()] = {
        building: b,
        revenueByMonth: {},
        total: 0,
      };
    });

    bills.forEach((bill) => {
      const roomInfo = roomMap[bill.room.toString()];
      if (!roomInfo) return;

      const building = roomInfo.building;
      const buildingId = building._id.toString();

      const electricityPrice = building.electricityUnitPrice || 0;
      const waterPrice = building.waterUnitPrice || 0;

      const billTotal =
        (bill.roomPrice || 0) +
        electricityPrice * (bill.electricityUsage || 0) +
        waterPrice * (bill.waterUsage || 0);

      const key = `${bill.year}-${bill.month.toString().padStart(2, "0")}`;

      if (!buildingRevenueMap[buildingId].revenueByMonth[key]) {
        buildingRevenueMap[buildingId].revenueByMonth[key] = 0;
      }

      buildingRevenueMap[buildingId].revenueByMonth[key] += billTotal;
      buildingRevenueMap[buildingId].total += billTotal;
    });

    return Object.values(buildingRevenueMap).map((entry) => ({
      _id: entry.building._id,
      name: entry.building.name,
      address: entry.building.address,
      total: entry.total,
      revenue: Object.entries(entry.revenueByMonth).map(([monthKey, amount]) => {
        const [year, month] = monthKey.split("-");
        return {
          month: parseInt(month),
          year: parseInt(year),
          totalAmount: amount,
        };
      }),
    }));
  }

};

module.exports = buildingService;
