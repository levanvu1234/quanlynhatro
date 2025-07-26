require("dotenv").config();
const Room = require("../models/room");
const Building = require("../models/building");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const roomService = {
  // Tạo phòng mới và gắn vào tòa nhà
  createRoom: async (roomData) => {
    const room = new Room(roomData);
    const savedRoom = await room.save();

    // Gắn phòng vào tòa nhà (nếu có)
    if (roomData.building) {
      await Building.findByIdAndUpdate(
        roomData.building,
        { $push: { rooms: savedRoom._id } },
        { new: true }
      );
    }

    // Gắn room vào từng user (nếu có)
    if (roomData.users && Array.isArray(roomData.users)) {
      await User.updateMany(
        { _id: { $in: roomData.users } },
        { $addToSet: { rooms: savedRoom._id } }
      );
    }

    // Trả về phòng có populate tòa nhà
    return await Room.findById(savedRoom._id)
      .populate('building', 'name location electricityUnitPrice waterUnitPrice')
      .populate('users', 'name email phonenumber')
      .populate({
        path: 'devices',
        match: { activity: { $ne: "Tạm dừng" } }
      });
  },

  // Lấy tất cả phòng (có building và users)
  getAllRooms: async () => {
  return await Room.find()
    .populate("building", "name location electricityUnitPrice waterUnitPrice")
    .populate({
      path: "users",
      match: { condition: "Hoạt động" }, 
      select: "name email phonenumber"   
    })
    .populate({
      path: "devices",
      match: { activity: { $ne: "Tạm dừng" } }, 
    });
  },

  // Lấy phòng theo ID (có building và users)
  getRoomById: async (id) => {
    return await Room.findById(id)
      .populate('building', 'name location electricityUnitPrice waterUnitPrice')
      .populate('users', 'name email phonenumber')
      .populate({
        path: "devices",
        match: { activity: { $ne: "Tạm dừng" } }, 
      });
  },

  // Cập nhật phòng theo ID
  updateRoom: async (id, updatedData) => {
  const room = await Room.findById(id);
  if (!room) throw new Error("Room not found");

  // Cập nhật các trường đơn
  room.name = updatedData.name || room.name;
  room.roomPrice = updatedData.roomPrice ?? room.roomPrice;
  room.area = updatedData.area ?? room.area;
  room.startDate = updatedData.startDate ?? null;
  room.endDate = updatedData.endDate ?? null;
  room.description = updatedData.description ?? room.description;

  // Cập nhật người thuê (users)
  if (Array.isArray(updatedData.users)) {
    // Gỡ liên kết người cũ không còn thuê phòng
    await User.updateMany(
      { rooms: id, _id: { $nin: updatedData.users } },
      { $pull: { rooms: id } }
    );

    // Thêm liên kết người mới
    await User.updateMany(
      { _id: { $in: updatedData.users } },
      { $addToSet: { rooms: id } }
    );

    room.users = updatedData.users;
  }

  // Cập nhật hình ảnh
  if (Array.isArray(updatedData.images)) {
    const oldImages = room.images || [];
    const newImages = updatedData.images;

    // Tìm những ảnh cũ bị xóa
    const removedImages = oldImages.filter(img => !newImages.includes(img));

    // Xóa ảnh vật lý trong thư mục uploads/
    removedImages.forEach(imgPath => {
      const fileName = path.basename(imgPath); // chỉ lấy tên file
      const filePath = path.join(__dirname, "../uploads", fileName);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Lỗi khi xóa ảnh:", err.message);
      });
    });

    // Cập nhật danh sách ảnh mới
    room.images = newImages;
  }

  await room.save();

  return await Room.findById(id)
    .populate('building', 'name location electricityUnitPrice waterUnitPrice')
    .populate('users', 'name email phonenumber')
    .populate({
      path: 'devices',
      match: { activity: { $ne: "Tạm dừng" } } 
    });
  },

  // Xóa phòng và gỡ khỏi building
  deleteRoom: async (id) => {
    const room = await Room.findByIdAndDelete(id);

    if (room?.building) {
      await Building.findByIdAndUpdate(
        room.building,
        { $pull: { rooms: room._id } }
      );
    }

    // Gỡ liên kết room của tất cả users trong phòng
    await User.updateMany(
      { room: room._id },
      { $unset: { room: "" } }
    );

    return room;
  }
};

module.exports = roomService;
