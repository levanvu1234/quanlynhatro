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
    return await Building.find() 
    .populate({
          path: 'rooms',
          populate: {
            path: 'devices',
            model: 'Device'  // Tên model của devices trong mongoose
          }
        });
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
  // Xóa tòa nhà (chuyển trạng thái sang "Tạm dừng")
  deleteBuilding: async (id, deleteCode) => {
    try {
      const validDeleteCode = "123456";
      if (deleteCode !== validDeleteCode) {
        return {
          EC: 1,
          EM: "Mã xác thực không hợp lệ",
        };
      }

      const building = await Building.findById(id);
      if (!building) {
        return {
          EC: 2,
          EM: "Không tìm thấy tòa nhà để xóa",
        };
      }

      // Cập nhật trạng thái hoạt động
      building.activity = "Tạm dừng";
      await building.save();

      return {
        EC: 0,
        EM: "Chuyển trạng thái tòa nhà thành 'Tạm dừng' thành công",
        building,
      };
    } catch (error) {
      console.error(error);
      return {
        EC: -1,
        EM: "Lỗi server khi cập nhật trạng thái tòa nhà",
      };
    }
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
