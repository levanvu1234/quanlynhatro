import React, { useEffect, useState } from 'react';
import { GetBookingsApi, UpdateBookingStatusApi } from '../util/api';
import { Modal, DatePicker, notification, Table, Button,Divider,Input, Select, Space } from 'antd';
import dayjs from 'dayjs';
import emailjs from '@emailjs/browser';
import "../style/room.css";
const BookingPage = () => {
  //   dữ liệu
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  //   modal lịch
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  //tìm kiếm/lọc
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const { Search } = Input;
  const { Option } = Select;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await GetBookingsApi();

      let filtered = data;

      if (searchPhone) {
        filtered = filtered.filter(b => b.phone.includes(searchPhone));
      }

      if (filterStatus) {
        filtered = filtered.filter(b => b.status === filterStatus);
      }

      setBookings(filtered);
    } catch (error) {
      console.error("Lỗi khi load bookings:", error);
      notification.error({ message: 'Không thể tải danh sách lịch hẹn' });
    } finally {
      setLoading(false);
    }
  };

   //  Lấy danh sách lịch hẹn khi load
  useEffect(() => {
    fetchBookings();
  }, [searchPhone, filterStatus]);

  //  Cập nhật trạng thái duyệt / từ chối
  const handleUpdateStatus = async (id, status) => {
    try {
      await UpdateBookingStatusApi(id, { status });
      notification.success({ message: `Cập nhật trạng thái thành công: ${status}` });
      fetchBookings();
    } catch (error) {
      console.error(" Lỗi khi cập nhật trạng thái:", error);
      notification.error({ message: 'Cập nhật trạng thái thất bại' });
    }
  };

  //  Mở modal lịch hẹn
  const openScheduleModal = (booking) => {
    setSelectedBooking(booking);
    setScheduleDate(booking.schedule ? dayjs(booking.schedule) : null);
    setScheduleModalOpen(true);
  };

  //  Gửi lịch hẹn + gửi mail
  const handleScheduleSubmit = async () => {
    if (!scheduleDate || !selectedBooking) {
      notification.error({ message: 'Vui lòng chọn thời gian lịch hẹn' });
      return;
    }
    setScheduleLoading(true);

    try {
      await UpdateBookingStatusApi(selectedBooking._id, { schedule: scheduleDate.toISOString() });

      const templateParams = {
        fullName: selectedBooking.fullName,
        email: selectedBooking.email,
        phone: selectedBooking.phone,
        roomName: selectedBooking.roomId?.name || '',
        schedule: dayjs(scheduleDate).format('HH:mm DD/MM/YYYY'),
        to_email: selectedBooking.email,
      };

      await emailjs.send(
        'service_owryey2',
        'template_rud2bop',
        templateParams,
        'E33ENV9NH3p7P3VZ3'
      );

      notification.success({ message: 'Đã gửi lịch hẹn thành công' });
      setScheduleModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Lỗi gửi lịch hẹn:', error);
      notification.error({ message: 'Gửi lịch hẹn thất bại' });
    } finally {
      setScheduleLoading(false);
    }
  };

  // Cột table
  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phòng', render: (_, r) => r.roomId?.name || r.roomId },
    { title: 'Tòa nhà', render: (_, r) => r.roomId?.building?.name || 'Không rõ' },
    { title: 'Trạng thái', dataIndex: 'status' },
    {
      title: 'Lịch hẹn',
      render: (_, r) =>
        r.schedule ? dayjs(r.schedule).format('HH:mm DD/MM/YYYY') : 'Chưa đặt lịch',
    },
    {
      title: 'Thao tác',
      render: (_, r) => (
        <>
          <Button onClick={() => handleUpdateStatus(r._id, 'Đã duyệt')} style={{ marginRight: 8 }}>
            ✔️ Duyệt
          </Button>
          <Button onClick={() => handleUpdateStatus(r._id, 'Đã hủy')} danger style={{ marginRight: 8 }}>
            ❌ Từ chối
          </Button>
          <Button onClick={() => openScheduleModal(r)} type="primary">
            📅 Đặt lịch
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="room-page-container">
      <div style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 10,
        }}>
        <h2 style={{ color: '#1e3a8a',fontSize: '24px' }}>📋 Danh sách đặt lịch xem phòng</h2>
      
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Tìm theo số điện thoại"
          allowClear
          onSearch={() => fetchBookings()}
          onChange={(e) => setSearchPhone(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          onChange={(value) => {
            setFilterStatus(value);
          }}
          onClear={() => setFilterStatus(null)}
          style={{ width: 200 }}
        >
          <Option value="Đã duyệt">Đã duyệt</Option>
          <Option value="Đã hủy">Đã hủy</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
        </Select>
        <Button type="primary" onClick={fetchBookings}>🔍 Tìm kiếm</Button>
      </Space>
      </div>
      <Divider />   
      <Table
        dataSource={bookings}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal đặt lịch hẹn */}
      <Modal
        title={`Đặt lịch hẹn xem phòng cho ${selectedBooking?.fullName || ''}`}
        open={scheduleModalOpen}
        onCancel={() => setScheduleModalOpen(false)}
        onOk={handleScheduleSubmit}
        okText="Gửi lịch hẹn"
        cancelText="Hủy"
        confirmLoading={scheduleLoading}
      >
        <p>Chọn thời gian muốn hẹn xem phòng:</p>
        <DatePicker
          showTime
          format="HH:mm DD/MM/YYYY"
          style={{ width: '100%' }}
          value={scheduleDate}
          onChange={setScheduleDate}
        />
      </Modal>
    </div>
  );
};

export default BookingPage;
