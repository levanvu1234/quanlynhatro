import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GetRoomByIdApi, CreateBookingApi ,GetBuildingByIdApi } from '../../util/api';
import {
  Form, Input, message, Tag, Descriptions, Row, Col, Button,Typography,Card, Carousel,Divider,
} from 'antd';
import { EyeOutlined, LeftOutlined,RightOutlined } from '@ant-design/icons';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
const { Title, Text } = Typography;
const RoomDetailPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [openGallery, setOpenGallery] = useState(false);
  const [bookingForm] = Form.useForm();

  const [otherRooms, setOtherRooms] = useState([]);
  const [roomPage, setRoomPage] = useState(0);
  const pageSize = 3; 
  useEffect(() => {
  const fetchRoom = async () => {
    try {
      const roomRes = await GetRoomByIdApi(id);

      if (!roomRes || !roomRes.building || !roomRes.building._id) {
        throw new Error('Không có thông tin phòng hoặc tòa nhà');
      }

      setRoom(roomRes);
      console.log(room.devices);
      const buildingRes = await GetBuildingByIdApi(roomRes.building._id);
      const allRooms = buildingRes.rooms || [];
      const filteredRooms = allRooms
      .filter(room => String(room._id) !== String(id))
      .map(r => ({ ...r, building: buildingRes }));
      setOtherRooms(filteredRooms);
      setRoomPage(0);
    } catch (err) {
      console.error('Lỗi lấy chi tiết phòng hoặc tòa nhà:', err);
    }
  };
  fetchRoom();
}, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);
  const handleBookingSubmit = async () => {
    try {
      const values = await bookingForm.validateFields();
      const payload = {
        roomId: id,
        fullName: values.name,
        phone: values.phonenumber,
        email: values.email,
      };
      await CreateBookingApi(payload);
      message.success('Đặt lịch xem phòng thành công!');
      bookingForm.resetFields();
    } catch (err) {
      console.error('Error booking:', err);
      message.error('Đặt lịch thất bại');
    }
  };

  if (!room) return <p>Đang tải...</p>;
  // Tổng số trang
  const totalPages = Math.ceil(otherRooms.length / pageSize);

  // Phòng của trang hiện tại
  const currentRooms = otherRooms.slice(roomPage * pageSize, roomPage * pageSize + pageSize); 
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: 24,
        background: '#fff', 
      }}>
        <Title level={3}>{room.building?.location}</Title>
        {/* Ảnh ở trên */}
        {room.images?.length > 0 && (
        <div>
          <img
            src={`http://localhost:8080/uploads/${room.images[0]}`}
            alt="main-room"
            style={{ width: '100%', height: 500, objectFit: 'cover', borderRadius: 8 }}
          />
          <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
            {room.images.slice(1, 5).map((img, idx) => (
              <Col xs={6} key={idx}>
                <img
                  src={`http://localhost:8080/uploads/${img}`}
                  alt={`room-thumb-${idx}`}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 6 }}
                />
              </Col>
            ))}
            {room.images.length > 2 && (
              <Col span={24} style={{ textAlign: 'center', marginTop: 8 }}>
                <Button icon={<EyeOutlined />} onClick={() => setOpenGallery(true)}>
                  Xem tất cả ảnh
                </Button>
              </Col>
            )}
          </Row>
        </div>
        )}
      </div>
      <Divider />
      <div style={{
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: 24,
        background: '#fff', 
      }}>
        {/* Thông tin phòng và Form bên dưới cạnh nhau */}
        <Row gutter={32} style={{ marginTop: 32 }}>
          {/* Thông tin phòng */}
          <Col xs={24} md={16}>
            <h2>Phòng {room.name}</h2>
            <Tag color="red">{(room.roomPrice / 1_000_000).toFixed(1)} triệu/tháng</Tag>
            <Tag color={room.activity === 'Đang trống' ? 'green' : 'blue'}>{room.activity}</Tag>
            <Tag>{room.building?.name}</Tag>

            <Descriptions bordered column={1} style={{ marginTop: 24 }}>
              <Descriptions.Item label="Tình trạng">{room.activity || 'Chưa rõ'}</Descriptions.Item>
              <Descriptions.Item label="Giá">{room.roomPrice?.toLocaleString()} VNĐ</Descriptions.Item>
              <Descriptions.Item label="Giá điện">{room.building?.electricityUnitPrice}đ/kWh</Descriptions.Item>
              <Descriptions.Item label="Giá nước">{room.building?.waterUnitPrice}đ/m³</Descriptions.Item>
              <Descriptions.Item label="Diện tích">{room.area} m²</Descriptions.Item>
              <Descriptions.Item label="Khu vực">{room.building?.location}</Descriptions.Item>
              <Descriptions.Item label="Thiết bị trong phòng">
                {(room.devices?.length > 0) ? (
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {room.devices.map(device => (
                      <li key={device._id}>
                        {device.name} - Số lượng: {device.quantity} - Tình trạng: {device.condition}
                      </li>
                    ))}
                  </ul>
                ) : 'Không có thiết bị'}
              </Descriptions.Item>
            </Descriptions>

            {room.description && (
              <div style={{ marginTop: 24 }}>
                <h3>Mô tả</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{room.description}</p>
              </div>
            )}
          </Col>

          {/* Form đặt lịch */}
          <Col xs={24} md={8}>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}>
              <h3>Đặt lịch xem phòng</h3>
              <Form layout="vertical" form={bookingForm} onFinish={handleBookingSubmit}>
                <Form.Item
                  label="Họ tên"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phonenumber"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Gửi đăng ký
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
      <Divider />
      <div style={{
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          borderRadius: 12,
          padding: 24,
          background: '#fff', 
        }}>
          {otherRooms.length > 0 && (
            <>
              <Title level={4} style={{ marginTop: 32 }}>Phòng khác trong tòa nhà</Title>
              {otherRooms.length > 0 && (
                <>
                  <div style={{ position: 'relative', marginBottom: 32 }}>
                      {/* Nút trái */}
                      <Button
                        icon={<LeftOutlined style={{ fontSize: 18 }} />}
                        onClick={() => setRoomPage(prev => Math.max(prev - 1, 0))}
                        disabled={roomPage === 0}
                        style={{
                          position: 'absolute',
                          left: -16,
                          top: '40%',
                          zIndex: 10,
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      />

                      {/* Nút phải */}
                      <Button
                        icon={<RightOutlined style={{ fontSize: 18 }} />}
                        onClick={() => setRoomPage(prev => Math.min(prev + 1, totalPages - 1))}
                        disabled={roomPage >= totalPages - 1}
                        style={{
                          position: 'absolute',
                          right: -16,
                          top: '40%',
                          zIndex: 10,
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      />

                      <Row gutter={[24, 24]}>
                        {currentRooms.map((room) => (
                          <Col key={room._id} xs={24} sm={12} md={8}>
                            <Link to={`/room/${room._id}`}>
                              <Card
                                hoverable
                                style={{
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                                bodyStyle={{
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  padding: 16,
                                }}
                                cover={
                                  <div style={{ height: 180, overflow: 'hidden' }}>
                                    <Carousel autoplay dots={false} autoplaySpeed={3000}>
                                      {(room.images || []).map((img, index) => (
                                        <img
                                          key={index}
                                          src={`http://localhost:8080/uploads/${img}`}
                                          alt={`room-${index}`}
                                          style={{
                                            width: '100%',
                                            height: 180,
                                            objectFit: 'cover',
                                            borderTopLeftRadius: 4,
                                            borderTopRightRadius: 4,
                                          }}
                                        />
                                      ))}
                                    </Carousel>
                                  </div>
                                }
                              >
                                <Title level={5}>Phòng {room.name}</Title>
                                <Text>💰 {room.roomPrice?.toLocaleString() || 'N/A'} đ</Text><br />
                                <Text>⚡ {room.building.electricityUnitPrice?.toLocaleString()} đ/kWh</Text><br />
                                <Text>💧 {room.building.waterUnitPrice?.toLocaleString()} đ/m³</Text><br />
                                <Text>📏 {room.area} m²</Text><br />
                                <Text>🗺️ {room.building.location}</Text><br />
                                <Text>🛠 {room.devices?.length || 0} thiết bị</Text><br />
                                <Tag color="green" style={{ marginTop: 8 }}>{room.activity}</Tag>
                                <div style={{ marginTop: 12 }}>
                                  <Button type="primary" block onClick={() => navigate(`/room/${room._id}`)}>Đăng ký thuê</Button>
                                </div>
                              </Card>
                            </Link>
                          </Col>
                        ))}
                      </Row>
                  </div>
                </>
              )}
            </>
          )}
      </div>
      
          
      {/* Thư viện ảnh mở rộng */}
      {openGallery && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button type="primary" danger onClick={() => setOpenGallery(false)}>Đóng</Button>
            </div>
            <PhotoProvider>
              <Row gutter={[16, 16]}>
                {room.images.map((img, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <PhotoView src={`http://localhost:8080/uploads/${img}`}>
                      <img
                        src={`http://localhost:8080/uploads/${img}`}
                        alt={`gallery-${index}`}
                        style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
                      />
                    </PhotoView>
                  </Col>
                ))}
              </Row>
            </PhotoProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
