import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Select, Button, Typography, Pagination,Carousel,Tag } from 'antd';
import { useNavigate,Link } from 'react-router-dom';
import { GetBuildingApi, GetRoomApi } from '../util/api';
import img1 from '../assets/anh-dep-3.jpg';
import { SearchOutlined } from '@ant-design/icons';
const { Option } = Select;
const { Title } = Typography;

const ServiceBuildingPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [roomPage, setRoomPage] = useState(1);
  const pageSize = 8;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBuildings, resRooms] = await Promise.all([
          GetBuildingApi(),
          GetRoomApi(),
        ]);
        const buildingData = Array.isArray(resBuildings?.data) ? resBuildings.data : resBuildings;
        const roomData = Array.isArray(resRooms?.data) ? resRooms.data : resRooms;

        setBuildings(buildingData);
        setFilteredBuildings(buildingData);

        setRooms(roomData);
        //Lọc phòng đang trống ban đầu
        const availableRooms = roomData.filter(r => r.activity === 'Đang trống');
        setFilteredRooms(availableRooms);

        const uniqueLocations = Array.from(new Set(buildingData.map(item => item.location)));
        setLocations(uniqueLocations);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu:', err);
      }
    };
    fetchData();
  }, []);

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    setRoomPage(1); // reset page

    if (value) {
      const filtered = buildings.filter(b => b.location === value);
      setFilteredBuildings(filtered);

      const buildingIds = filtered.map(b => b._id);
      const filteredR = rooms.filter(
       r => buildingIds.includes(r.building?._id) && r.activity === 'Đang trống'
      );
      setFilteredRooms(filteredR);
    } else {
      setFilteredBuildings(buildings);
      const allAvailable = rooms.filter(r => r.activity === 'Đang trống');
      setFilteredRooms(rooms);
    }
  };

  const paginatedRooms = filteredRooms.slice(
    (roomPage - 1) * pageSize,
    roomPage * pageSize
  );

  return (
    <> 
    <div style={{ width: '100%',alignItems: 'center', overflow: 'hidden',boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1)', }}>
      <Carousel
        autoplay
        dots={true}
        effect="fade"
        autoplaySpeed={3000}
        pauseOnHover={false}
      >
        <img
          style={{ width: '100vw', height: '100px', objectFit: 'cover' }}
          src='src/assets/anh-dep-3.jpg'
          alt="Slide 1"
        />
        <img
          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
          src='/src/assets/anh-dep-8.jpg'
          alt="Slide 2"
        />
        <img
          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
          src='src/assets/anh-dep-16.jpg'
          alt="Slide 3"
        />
        <img
          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
          src='src/assets/anh-dep-27.jpg'
          alt="Slide 3"
        />
      </Carousel>
    </div>
    <div style={{ background: '#f9fbff', padding: '50px 200px 0 150px' }}>
      
      {/*  Bộ lọc khu vực */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 60, background: '#f5faff' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 40,
          padding: '20px 60px',
          minWidth: 100,
        }}>
          <div style={{ textAlign: 'center', paddingRight: 20, borderRight: '1px solid #eee' }}>
            <div style={{ fontWeight: 500 }}>Khu vực</div>
            <Select
              allowClear
              placeholder="Chọn khu vực"
              style={{ width: 300 }}
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {locations.map(loc => (
                <Option key={loc} value={loc}>{loc}</Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/*  Danh sách tòa nhà  */}
      <Row gutter={[24, 24]}>
        {filteredBuildings.map((building) => (
          <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                background: '#fff',
                cursor: 'pointer',
              }}
              cover={
                <img
                  alt="building"
                  src={`http://localhost:8080${building.images?.[0]}`}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
              }
              onClick={() => navigate(`/building/${building._id}`)}
            >
              <div style={{ padding: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {building.name} - {building.location}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{building.address}</p>
                <p style={{ margin: '8px 0 4px', fontSize: 13 }}>⚡ {building.electricityUnitPrice?.toLocaleString()}đ/kWh</p>
                <p style={{ margin: '0 0 4px', fontSize: 13 }}>🚿 {building.waterUnitPrice?.toLocaleString()}đ/m³</p>
                <p style={{ margin: 0, fontSize: 13 }}>🏘 Phòng trống: <strong>{building.rooms?.length || 0}</strong></p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/*  Danh sách phòng  */}
      <div style={{ marginTop: 60 }}>
        <Title level={3}>Danh sách phòng trong khu vực</Title>
        <Row gutter={[16, 16]}>
          {paginatedRooms.map(room => (
            <Col key={room._id} xs={24} sm={12} md={8} lg={6}>
              <Link to={`/room/${room._id}`}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 16
                  }}
                  cover={
                    <div style={{ height: 160, overflow: 'hidden' }}>
                      <Carousel autoplay>
                        {(room.images || []).map((img, index) => (
                          <img
                            key={index}
                            src={`http://localhost:8080/uploads/${img}`}
                            alt={`room-${index}`}
                            style={{
                              width: '100%',
                              height: 160,
                              objectFit: 'cover',
                              borderTopLeftRadius: 12,
                              borderTopRightRadius: 12,
                            }}
                          />
                        ))}
                      </Carousel>
                    </div>
                  }
                >
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>Phòng {room.name} - {room.building?.name}</h4>
                  <p>💰 Giá: {room.roomPrice?.toLocaleString()}đ</p>
                  <p>🗺️ {room.building?.location}</p>
                  <p>📏 {room.area} m²</p> 
                  <p>🛠 {room.devices?.length || 0} thiết bị</p>
                  <Tag color="green" style={{ marginTop: 8,width:200 }}>{room.activity}</Tag>
                  <div style={{ marginTop: 12 }}>
                    <Button type="primary" block onClick={() => navigate(`/room/${r._id}`)}>Đăng ký thuê</Button>
                  </div>
                </Card>
              </Link>

            </Col>
          ))}
        </Row>

        {filteredRooms.length > pageSize && (
          <Pagination
            current={roomPage}
            pageSize={pageSize}
            total={filteredRooms.length}
            onChange={page => setRoomPage(page)}
            style={{ marginTop: 20, textAlign: 'center' }}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default ServiceBuildingPage;
