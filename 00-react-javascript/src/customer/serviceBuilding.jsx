import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { GetBuildingApi } from '../util/api';

const ServiceBuildingPage = () => {
  const [buildings, setBuildings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await GetBuildingApi();
        const data = Array.isArray(res?.data) ? res.data : res;
        setBuildings(data);
      } catch (err) {
        console.error('Lỗi lấy danh sách tòa nhà:', err);
      }
    };
    fetchBuildings();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {buildings.map((building) => (
          <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{ borderRadius: 12 }}
              cover={
                <img
                  alt="building"
                  src={`http://localhost:8080${building.images?.[0]}`}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12
                  }}
                />
              }
              onClick={() => navigate(`/building/${building._id}`)}
            >
              <h3 style={{ marginBottom: 8 }}>{building.name}</h3>
              <p style={{ marginBottom: 4 }}>{building.address}</p>
              <p style={{ marginBottom: 4 }}>⚡ {building.electricityUnitPrice?.toLocaleString()}đ/kWh</p>
              <p style={{ marginBottom: 4 }}>🚿 {building.waterUnitPrice?.toLocaleString()}đ/m³</p>
              <p style={{ marginBottom: 0 }}>🏘 Phòng trống: {building.rooms?.length || 0}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ServiceBuildingPage;
