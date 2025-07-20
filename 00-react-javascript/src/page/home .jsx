import {
  Card,
  Statistic,
  Row,
  Col,
  Divider,
  DatePicker,
  notification,
  
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  GetRoomApi,
  GetUserApi,
  GetBuildingRevenueApi,
  GetDeviceApi,
  GetBookingsApi,
} from "../util/api";
import "../style/home.css";

const ReportPage = () => {
  const [roomData, setRoomData] = useState({
    total: 0,
    rented: 0,
    available: 0,
  });

  const [deviceStats, setDeviceStats] = useState({
    total: 0,
    active: 0,
    broken: 0,
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });
  const [userCount, setUserCount] = useState(0);
  const [userWithRoom, setUserWithRoom] = useState(0);
  const [userWithoutRoom, setUserWithoutRoom] = useState(0);

  const [buildingRevenues, setBuildingRevenues] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const fetchData = async (month, year) => {
    try {
      const [rooms, users, allRevenueData, deviceRes, bookings] = await Promise.all([
        GetRoomApi(),
        GetUserApi(),
        GetBuildingRevenueApi(),
        GetDeviceApi(),
        GetBookingsApi(),
      ]);

      const devices = deviceRes?.data || [];

      if (Array.isArray(devices)) {
        const total = devices.length;
        const active = devices.filter((d) => d.condition === "Tốt").length;
        const broken = devices.filter((d) => d.condition === "Cần sửa").length;
        setDeviceStats({ total, active, broken });
      }

      if (Array.isArray(rooms)) {
        const total = rooms.length;
        const rented = rooms.filter((room) => room.activity === "Đã thuê").length;
        const available = total - rented;
        setRoomData({ total, rented, available });

        const userIdsInRooms = new Set();
        rooms.forEach((room) => {
          (room.users || []).forEach((user) => {
            userIdsInRooms.add(typeof user === "object" ? user._id : user);
          });
        });

        if (Array.isArray(users)) {
          setUserCount(users.length);
          const allUserIds = users.map((user) => user._id);
          const withRoom = allUserIds.filter((id) => userIdsInRooms.has(id)).length;
          const withoutRoom = allUserIds.length - withRoom;
          setUserWithRoom(withRoom);
          setUserWithoutRoom(withoutRoom);
        }
      }

      if (Array.isArray(bookings)) {
        const total = bookings.length;
        const approved = bookings.filter((b) => b.status === "Đã duyệt").length;
        const pending = bookings.filter((b) => b.status === "Đang chờ").length;
        setBookingStats({ total, approved, pending });
      }

      const filtered = (allRevenueData || [])
        .map((building) => {
          const validRevenue = Array.isArray(building.revenue) ? building.revenue : [];
          const matched = validRevenue.find(
            (r) => Number(r.month) === Number(month) && Number(r.year) === Number(year)
          );
          return matched
            ? {
                buildingName: building.name,
                totalRevenue: matched.totalAmount,
              }
            : null;
        })
        .filter(Boolean);

      setBuildingRevenues(filtered);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu báo cáo:", err);
      notification.error({ message: "Không thể tải dữ liệu báo cáo." });
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    const month = selectedDate.month() + 1;
    const year = selectedDate.year();
    fetchData(month, year);
  }, [selectedDate]);

  return (
    <div className="dashboard-container">
      <h2 style={{ fontSize: 24,  marginBottom: 24, color:" #1e3a8a" }}>
        Mời chọn tháng để xem báo cáo{" "}
        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          style={{ marginLeft: 16 }}
        />
      </h2>

      <Divider />

      {/* Booking stats */}
      <Row gutter={24} style={{ marginBottom: 15 }}>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng số lượt đặt lịch"
              value={bookingStats.total}
              prefix={<i className="fas fa-calendar-alt" style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Lượt đã duyệt"
              value={bookingStats.approved}
              valueStyle={{ color: "#52c41a" }}
              prefix={<i className="fas fa-check" style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Lượt đang chờ"
              value={bookingStats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<i className="fas fa-clock" style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Phòng */}
      <Row gutter={24}>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng số phòng"
              value={roomData.total}
              prefix={<i className="fas fa-building" style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Phòng đã thuê"
              value={roomData.rented}
              valueStyle={{ color: "#52c41a" }}
              prefix={<i className="fa-solid fa-person-shelter" style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Phòng trống"
              value={roomData.available}
              valueStyle={{ color: "#faad14" }}
              prefix={<i className="fas fa-door-open" style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Người dùng */}
      <Row gutter={24} style={{ marginTop: 15 }}>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng số người dùng"
              value={userCount}
              prefix={<i className="fas fa-users" style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Đang thuê phòng"
              value={userWithRoom}
              valueStyle={{ color: "#1890ff" }}
              prefix={<i className="fa-solid fa-person-shelter" style={{ color: "#3f8600" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Chưa có phòng"
              value={userWithoutRoom}
              valueStyle={{ color: "#faad14" }}
              prefix={<i className="fas fa-door-open" style={{ color: "#3f8600" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thiết bị */}
      <Row gutter={24} style={{ marginTop: 15 }}>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Tổng số thiết bị"
              value={deviceStats.total}
              prefix={<i className="fas fa-cogs" style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Thiết bị đang hoạt động"
              value={deviceStats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<i className="fas fa-check-circle" style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistic-card">
            <Statistic
              title="Thiết bị cần sửa"
              value={deviceStats.broken}
              valueStyle={{ color: "#fa541c" }}
              prefix={<i className="fas fa-tools" style={{ color: "#fa541c" }} />}
            />
          </Card>
        </Col>
      </Row>
      <Divider/>
      {/* Doanh thu */}
      <h3 style={{ margin: 0 }}>
        Doanh thu theo tòa nhà (
        {selectedDate ? selectedDate.format("MM/YYYY") : "chưa chọn"})
      </h3>

      {buildingRevenues.length === 0 ? (
        <p style={{ marginTop: 12, color: "#999" }}>
          Không có dữ liệu doanh thu trong tháng này.
        </p>
      ) : (
        <Row gutter={24}>
          {buildingRevenues.map((bld, idx) => (
            <Col span={8} key={idx}>
              <Card className="statistic-card">
                <Statistic
                  title={`Tòa: ${bld.buildingName}`}
                  value={bld.totalRevenue}
                  suffix="VNĐ"
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ReportPage;
