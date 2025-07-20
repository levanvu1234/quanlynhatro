const roomService = require('../services/roomService');
const fs = require('fs');
const path = require('path');

// Hàm di chuyển ảnh từ folder temp sang folder phòng
const moveFiles = (files, roomId) => {
  if (!files || files.length === 0) return [];

  const newPaths = [];
  const destDir = path.resolve(`./uploads/rooms/${roomId}`);

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  files.forEach(file => {
    const oldPath = path.resolve(file.path);
    const newFilename = `${Date.now()}-${file.originalname}`;
    const newPath = path.join(destDir, newFilename);

    fs.renameSync(oldPath, newPath);
    newPaths.push(`rooms/${roomId}/${newFilename}`);
  });

  return newPaths;
};

// Format dữ liệu room trả về client
const formatRoom = (room) => ({
  _id: room._id,
  name: room.name,
  activity: (room.users && room.users.length > 0) ? "Đã thuê" : "Đang trống",
  building: {
    _id: room.building?._id,
    name: room.building?.name || 'Chưa gán tòa nhà',
    location: room.building?.location || 'Chưa gán',
  },
  users: (room.users || []).map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phonenumber: user.phonenumber
  })),
  devices: (room.devices || []).map(device => ({
    _id: device._id,
    name: device.name,
    quantity: device.quantity,
    condition: device.condition,
    note: device.note
  })),
  startDate: room.startDate,
  endDate: room.endDate,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
  roomPrice: room.roomPrice,
  images: room.images || [],
  area: room.area,
  description: room.description,
});

// Chuẩn hoá danh sách users
const parseUsers = (input) => {
  if (!input) return [];
  if (typeof input === "string") return input.trim() ? [input.trim()] : [];
  if (Array.isArray(input)) return input.filter(id => id && id.trim() !== "");
  return [];
};

// Tạo controller
const roomController = {
  // Tạo phòng
  create: async (req, res) => {
    try {
      let roomData = req.body;

      roomData.users = parseUsers(req.body.users);
      roomData.roomPrice = parseFloat(req.body.roomPrice) || 0;
      roomData.area = parseFloat(req.body.area) || 0;
      roomData.startDate = req.body.startDate
          ? new Date(req.body.startDate)
          : null;

      roomData.endDate = req.body.endDate
        ? new Date(req.body.endDate)
        : null;

      const files = req.files || [];

      const room = await roomService.createRoom(roomData);

      if (files.length > 0) {
        const imagePaths = moveFiles(files, room._id);
        room.images = imagePaths;
        await room.save();
      }

      res.status(201).json(formatRoom(room));
    } catch (err) {
      console.error("Create Room Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy danh sách phòng
  getAll: async (req, res) => {
    try {
      const rooms = await roomService.getAllRooms();
      res.status(200).json(rooms.map(formatRoom));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy chi tiết phòng theo ID
  getById: async (req, res) => {
    try {
      const room = await roomService.getRoomById(req.params.id);
      if (!room) return res.status(404).json({ message: 'Room not found' });

      res.json(formatRoom(room));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật phòng
  update: async (req, res) => {
    try {
      console.log('Update room req.body:', req.body);
      const roomId = req.params.id;
      let roomData = req.body;

      const room = await roomService.getRoomById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      roomData.users = parseUsers(req.body.users);
      roomData.roomPrice = parseFloat(req.body.roomPrice) || room.roomPrice;
      roomData.area = parseFloat(req.body.area) || room.area;
      if (req.body.startDate === "") {
        roomData.startDate = null;
      } else if (req.body.startDate) {
        roomData.startDate = new Date(req.body.startDate);
      } else {
        roomData.startDate = room.startDate;
      }

      if (req.body.endDate === "") {
        roomData.endDate = null;
      } else if (req.body.endDate) {
        roomData.endDate = new Date(req.body.endDate);
      } else {
        roomData.endDate = room.endDate;
      }
      const files = req.files || [];

      if (files.length > 0) {
        const imagePaths = files.map(f => `rooms/${roomId}/${f.filename}`);
        roomData.images = [...(room.images || []), ...imagePaths];
      }

      const updatedRoom = await roomService.updateRoom(roomId, roomData);
      res.json(formatRoom(updatedRoom));
    } catch (err) {
      console.error("Update Room Error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Xoá phòng
  delete: async (req, res) => {
    try {
      await roomService.deleteRoom(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = roomController;
