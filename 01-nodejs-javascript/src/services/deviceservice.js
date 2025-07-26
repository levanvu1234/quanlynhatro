const Device = require('../models/device');
const Room = require("../models/room");
const deviceService = {
  createDevice: async (data) => {
    const device = await Device.create(data);
     // Cập nhật thêm thiết bị vào mảng devices của phòng tương ứng
    await Room.findByIdAndUpdate(device.room, {
      $addToSet: { devices: device._id }
    });
    return await Device.findById(device._id)
    .populate({
      path: 'room',
      select: 'name building',
      populate: {
        path: 'building',
        select: 'name address'
      }
    });
  },

  getAllDevices: async () => {
    return await Device.find()
      .populate({
        path: 'room',
        select: 'name building',  
        populate: {
          path: 'building',
          select: 'name address'
        }
      });
  },

  getDevicesByRoom: async (roomId) => {
    return await Device.find({ room: roomId })
      .populate({
        path: 'room',
        select: 'name building',
        populate: {
          path: 'building',
          select: 'name address'
        }
      });
  },

  updateDevice: async (id, data) => {
    // Lấy thiết bị cũ để biết phòng cũ
    const oldDevice = await Device.findById(id);
    if (!oldDevice) return null;

    const oldRoomId = oldDevice.room?.toString();
    const newRoomId = data.room;
    return await Device.findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: 'room',
        select: 'name building',
        populate: {
          path: 'building',
          select: 'name address'
        }
      });
      // Nếu đổi phòng (room khác phòng cũ)
      if (newRoomId && oldRoomId !== newRoomId) {
        // Xóa device khỏi phòng cũ
        await Room.findByIdAndUpdate(oldRoomId, {
          $pull: { devices: id }
        });

        // Thêm device vào phòng mới
        await Room.findByIdAndUpdate(newRoomId, {
          $addToSet: { devices: id }
        });
      }
  },

  deleteDevice: async (id, deleteCode) => {
    try {
      const validDeleteCode = "123456";
      if (deleteCode !== validDeleteCode) {
        return {
          EC: 1,
          EM: "Mã xác thực không hợp lệ",
        };
      }

      const device = await Device.findById(id);
      if (!device) {
        return {
          EC: 2,
          EM: "Không tìm thấy thiết bị để xóa",
        };
      }

      // Cập nhật trạng thái thiết bị
      device.activity = "Tạm dừng";
      await device.save();

      // Populate lại để trả về đầy đủ thông tin
      const populatedDevice = await Device.findById(device._id)
      .populate({
        path: 'room',
        select: 'name building',
        populate: {
          path: 'building',
          select: 'name address'
        }
      });

      return {
        EC: 0,
        EM: "Chuyển trạng thái thiết bị thành 'Tạm dừng' thành công",
        data: populatedDevice,
      };
    } catch (error) {
      console.error(error);
      return {
        EC: -1,
        EM: "Lỗi server khi cập nhật trạng thái thiết bị",
      };
    }
  },

};

module.exports = deviceService;
