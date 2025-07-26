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

    delete: async (req, res) => {
    const { id } = req.params;
    const { deleteCode } = req.body; // nhận mã xác thực

    const data = await deviceService.deleteDevice(id, deleteCode);
    if (data.EC === 0) {
      return res.status(200).json(data);
    } else if (data.EC === 1) {
      return res.status(403).json(data); // mã xác thực sai
    } else if (data.EC === 2) {
      return res.status(404).json(data); 
    } else {
      return res.status(500).json(data);
  }
  },
  };

  module.exports = deviceController;
