import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Card, message, List, Row, Col, Descriptions, Divider, Typography } from 'antd';
import { GetUserByIdApi } from '../../util/api';
import '../../style/userdetail.css'
const { Title } = Typography;

const UserDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await GetUserByIdApi(id);
        if (res && res.EC === 0) {
          setUser(res.user);
        } else {
          message.error(res.EM || 'Không thể lấy thông tin người dùng');
        }
      } catch (error) {
        message.error('Lỗi kết nối server');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin size="large" tip="Đang tải thông tin người dùng..." />
      </div>
    );
  }

  if (!user) {
    return <p>Không tìm thấy thông tin người dùng.</p>;
  }

  return (
  <div style={{ position: 'relative', padding: 24 }}>
    <div className="rotate-shape"></div>
    <div className="rotate-square"></div>

    <Card
      title={`Chi tiết người dùng: ${user.name}`}
      style={{ position: 'relative', zIndex: 1 }}
    >
      <p><strong>ID:</strong> {user._id}</p>
      <p><strong>Tên:</strong> {user.name}</p>
      <p><strong>Số điện thoại:</strong> {user.phonenumber}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Vai trò:</strong> {user.role}</p>

      <p><strong>Phòng thuê:</strong></p>
      {user.rooms && user.rooms.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={user.rooms}
          renderItem={(room) => (
            <List.Item>
              <div>
                <div><strong>Phòng:</strong> {room.name || 'Không rõ'}</div>
                <div><strong>Tòa nhà:</strong> {room.building?.name || 'Không rõ'}</div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <p>Không có phòng nào</p>
      )}
    </Card>
  </div>
);

};

export default UserDetailPage;
