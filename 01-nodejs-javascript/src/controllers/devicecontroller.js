  const deviceService = require('../services/deviceservice');

  const deviceController = {
    create: async (req, res) => {
      try {
        console.log("BODY:", req.body);
        const device = await deviceService.createDevice(req.body);
        res.status(201).json({ success: true, data: device });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi tạo thiết bị: ' + err.message });
      }
    },

    getAll: async (req, res) => {
      try {
        const devices = await deviceService.getAllDevices();
        res.json({ success: true, data: devices });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi lấy thiết bị: ' + err.message });
      }
    },

    getByRoom: async (req, res) => {
      try {
        const { roomId } = req.params;
        const devices = await deviceService.getDevicesByRoom(roomId);
        res.json({ success: true, data: devices });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi lấy thiết bị theo phòng: ' + err.message });
      }
    },

    update: async (req, res) => {
      try {
        const device = await deviceService.updateDevice(req.params.id, req.body);
        if (!device) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
        }
        res.json({ success: true, data: device });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật thiết bị: ' + err.message });
      }
    },

    remove: async (req, res) => {
      try {
        const device = await deviceService.deleteDevice(req.params.id);
        if (!device) {
          return res.status(404).json({ success: false, message: 'Thiết bị không tồn tại' });
        }
        res.json({ success: true, message: 'Xoá thành công', data: device });
      } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi xoá thiết bị: ' + err.message });
      }
    }
  };

  module.exports = deviceController;
