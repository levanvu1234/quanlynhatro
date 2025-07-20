const bookingService = require('../services/bookingservice');

const createBooking = async (req, res) => {
  try {
    const data = req.body;
    const booking = await bookingService.createBooking(data);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Tạo đặt lịch thất bại', error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách đặt lịch', error: error.message });
  }
};

const getBookingsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const bookings = await bookingService.getBookingsByRoom(roomId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy lịch hẹn của phòng', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { status, schedule } = req.body.data || req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (schedule) updateData.schedule = schedule; 

    const updated = await bookingService.updateBookingStatus(id, updateData);
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: 'Cập nhật trạng thái hoặc lịch hẹn thất bại',
      error: error.message,
    });
  }
};


module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByRoom,
  updateBookingStatus,
};
