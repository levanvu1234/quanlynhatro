import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetBuildingByIdApi } from '../../util/api';
import { Card, Divider, Spin, Typography, Carousel, Row, Col, Tag, Button,Descriptions } from 'antd';
import { EnvironmentOutlined, ThunderboltOutlined, RestOutlined,LeftOutlined, RightOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;
import { Link } from 'react-router-dom';

import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
const BuildingDetailPage = () => {
  const { id } = useParams();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  //chuyển hướng trang
  const navigate = useNavigate();
  //modal
  const [openGallery, setOpenGallery] = useState(false);
  //
  const [roomPage, setRoomPage] = useState(0);
  const pageSize = 3;


  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const res = await GetBuildingByIdApi(id);
        const data = res?.data || res;
        setBuilding(data);
      } catch (err) {
        console.error('Lỗi lấy chi tiết tòa nhà:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuilding();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" tip="Đang tải...">
          <div style={{ height: 200 }}></div> {/* hoặc nội dung bạn muốn loading */}
        </Spin>
      </div>
    );
  }

  if (!building) {
    return <p>Không tìm thấy tòa nhà</p>;
  }
  const availableRooms = (building.rooms || []).filter(room => room.activity === 'Đang trống');
  const totalPages = Math.ceil(availableRooms.length / pageSize);
  const currentRooms = availableRooms.slice(roomPage * pageSize, (roomPage + 1) * pageSize);
  return (
     <>
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={3}>{building.location}</Title>
      {/* Carousel ảnh to */}
      {building.images?.length > 0 && (
  <Row gutter={[16, 16]}>
    {/* Ảnh lớn bên trái */}
    <Col xs={24} md={16}>
      <img
        src={`http://localhost:8080${building.images[0]}`}
        alt="main-building"
        style={{
          width: '100%',
          height: 480,
          objectFit: 'cover',
          borderRadius: 8,
        }}
      />
    </Col>

    {/* Nhóm 4 ảnh nhỏ bên phải */}
    <Col xs={24} md={8}>
      <Row gutter={[8, 8]}>
        {building.images.slice(1, 7).map((img, idx) => (
          <Col span={12} key={idx}>
            <img
              src={`http://localhost:8080${img}`}
              alt={`thumb-${idx}`}
              style={{
                width: '100%',
                height: 115,
                objectFit: 'cover',
                borderRadius: 6,
              }}
            />
          </Col>
        ))}
      </Row>

      {/* Nút xem tất cả ảnh nếu có nhiều hơn 5 ảnh */}
      {building.images.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button icon={<EyeOutlined />} onClick={() => setOpenGallery(true)}>
            Xem tất cả ảnh
          </Button>
        </div>
      )}
    </Col>
  </Row>
)}
      
         
      <Divider />

    <Row gutter={32} style={{ marginTop: 32 }}>
      {/* Cột trái - Thông tin tòa nhà */}
      <Col xs={24} md={14}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tên tòa nhà">{building.name}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{building.address}</Descriptions.Item>
          <Descriptions.Item label="Khu vực">{building.location}</Descriptions.Item>
          <Descriptions.Item label="Giá điện">{building.electricityUnitPrice?.toLocaleString()} đ/kWh</Descriptions.Item>
          <Descriptions.Item label="Giá nước">{building.waterUnitPrice?.toLocaleString()} đ/m³</Descriptions.Item>
          <Descriptions.Item label="Phòng trống">{building.rooms?.length || 0} </Descriptions.Item>
        </Descriptions>
          {/* Tiện ích */}
          <div style={{ marginTop: 24 }}>
            <Title level={4}>Tiện ích</Title>
            {building.utilities?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {building.utilities.map((util, idx) => (
                  <Tag key={idx} color="blue">{util}</Tag>
                ))}
              </div>
            ) : (
              <Text>Chưa có tiện ích</Text>
            )}
          </div>

        {/* Ưu đãi */}
        <div style={{ marginTop: 24 }}>
          <Card style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a' }}>
            <Text strong>🎁 Ưu đãi:</Text> <Text>Nhận ưu đãi cho thuê khi đăng ký trực tuyến tại hệ thống!</Text>
            <Tag color="gold" style={{ marginLeft: 10 }}>SALE</Tag>
          </Card>
        </div>
      </Col>  
    </Row>
      {/* Danh sách phòng trống */}
      <Title level={4}>Phòng trống</Title>
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
                      padding: 16, // padding tùy chỉnh
                    }}
                  cover={
                    <div style={{ height: 180, overflow: 'hidden' }}>

                    
                    <Carousel autoplay>
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
                  <Title level={5}>{room.name}</Title>
                  <Text>💰 {room.roomPrice?.toLocaleString() || 'N/A'} đ</Text><br />
                  <Text>📏 {room.area} m²</Text><br />
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
  </div>
  {openGallery && (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, overflow: 'auto' }}>
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button type="primary" danger onClick={() => setOpenGallery(false)}>
            Đóng bộ sưu tập
          </Button>
        </div>
        <PhotoProvider
          onVisibleChange={(visible) => {
            if (!visible) setOpenGallery(false);
          }}
          toolbarRender={({ index, images }) => (
            <div style={{ color: '#fff', padding: '0 16px' }}>
              {index + 1} / {images.length}
            </div>
          )}
        >
          <Row gutter={[16, 16]}>
            {building.images.map((img, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <PhotoView src={`http://localhost:8080${img}`}>
                  <img
                    src={`http://localhost:8080${img}`}
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
  </>
  );
};

export default BuildingDetailPage;
