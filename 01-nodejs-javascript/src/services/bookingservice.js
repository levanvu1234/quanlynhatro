const Booking = require('../models/booking');

const createBooking = async (data) => {
  return await Booking.create(data);
};

const getAllBookings = async () => {
  return await Booking.find()
    .populate({
      path: 'roomId',
      populate: {
        path: 'building', 
        select: 'name',    
      },
    });
};

const getBookingsByRoom = async (roomId) => {
  return await Booking.find({ roomId }).sort({ createdAt: -1 });
};

const updateBookingStatus = async (id, updateData) => {
  return await Booking.findByIdAndUpdate(id, updateData, { new: true });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByRoom,
  updateBookingStatus,
};
