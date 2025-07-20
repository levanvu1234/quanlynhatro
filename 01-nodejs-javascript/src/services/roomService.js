require("dotenv").config();
const Room = require("../models/room");
const Building = require("../models/building");
const User = require("../models/user");

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
      .populate('building', 'name location')
      .populate('users', 'name email phonenumber');
  },

  // Lấy tất cả phòng (có building và users)
  getAllRooms: async () => {
  return await Room.find()
    .populate("building", "name location")
    .populate("users", "name email phonenumber")
    .populate("devices");
  },

  // Lấy phòng theo ID (có building và users)
  getRoomById: async (id) => {
    return await Room.findById(id)
      .populate('building', 'name location')
      .populate('users', 'name email phonenumber')
      .populate("devices");
  },

  // Cập nhật phòng theo ID
  updateRoom: async (id, updatedData) => {
  const room = await Room.findById(id);
  if (!room) throw new Error("Room not found");

  // Cập nhật từng trường
  room.name = updatedData.name || room.name;
  room.roomPrice = updatedData.roomPrice ?? room.roomPrice;
  room.area = updatedData.area ?? room.area;
  room.startDate = updatedData.startDate ?? null;   //  Cho phép set null
  room.endDate = updatedData.endDate ?? null;       //  Cho phép set null
  room.description = updatedData.description ?? room.description;

  // Update danh sách users
  if (Array.isArray(updatedData.users)) {
    // Gỡ room khỏi user cũ
    await User.updateMany(
      { rooms: id, _id: { $nin: updatedData.users } },
      { $pull: { rooms: id } }
    );

    // Thêm room cho user mới
    await User.updateMany(
      { _id: { $in: updatedData.users } },
      { $addToSet: { rooms: id } }
    );

    room.users = updatedData.users;
  }

  // Update images nếu có
  if (updatedData.images) {
    room.images = updatedData.images;
  }

  await room.save();

  return await Room.findById(id)
    .populate('building', 'name location')
    .populate('users', 'name email phonenumber');
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
