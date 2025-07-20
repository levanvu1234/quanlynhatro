import React, { useContext, useState } from 'react';
import {
  ContactsOutlined,
  ShopOutlined,
  HomeOutlined,
  LogoutOutlined ,
  BarChartOutlined,
  MailOutlined,
  CalendarOutlined,
  GlobalOutlined,
  SettingOutlined,
  ToolOutlined, 
} from '@ant-design/icons';
import { Menu, Layout } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import '../../style/header.css';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState('home');

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const leftMenuItems = [
    ...(auth.isAuthenticated
      ? [
          // {
          //   label: <Link to="/admin">Trang chủ</Link>,
          //   key: 'home',
          //   icon: <BarChartOutlined />,
          // },
          {
            label: <Link to="/dashboard/user">Danh sách người dùng</Link>,
            key: 'user',
            icon: <ContactsOutlined />,
          },
          {
            label: <Link to="/dashboard/room">Danh sách phòng</Link>,
            key: 'room',
            icon: <HomeOutlined />,
          },
          {
            label: <Link to="/dashboard/building">Danh sách tòa nhà</Link>,
            key: 'building',
            icon: <ShopOutlined />,
          },
          {
            label: <Link to="/dashboard/bill">Danh sách hóa đơn</Link>,
            key: 'bill',
            icon: <CalendarOutlined />,
          },
          {
            label: <Link to="/dashboard/device">Danh sách thiết bị</Link>,
            key: 'device',
            icon: <ToolOutlined />,
          },
          {
            label: <Link to="/dashboard/booking">Danh sách đặt phòng</Link>,
            key: 'booking',
            icon: <GlobalOutlined />,
          },
          {
            label: <Link to="/dashboard/report">Báo cáo</Link>,
            key: 'report',
            icon: <BarChartOutlined />,
          },
          {
            label: (
              <span
                onClick={() => {
                  localStorage.clear('access_token');
                  navigate('/admin');
                  setAuth({
                    isAuthenticated: false,
                    user: { phonenumber: '', name: '' ,role: '', _id: '',},
                  });
                  setCurrent('home');
                }}
              >
                Đăng xuất
              </span>
            ),
            key: 'logout',
            icon: <LogoutOutlined />,
          },
        ]
      : [
          {
            label: <Link to="/admin">Đăng nhập</Link>,
            key: 'login',
            icon: <SettingOutlined />,
          },
          {
            label: <Link to="/register">Đăng ký</Link>,
            key: 'register',
            icon: <SettingOutlined />,
          },
        ]),
  ];

  return (
    <Sider width={230} className="sidebar">
      <div className="logo" style={{ color: '#fff', padding: 16, fontSize: 18 }}>
        {auth?.user?.name ? `Xin chào, ${auth.user.name}` : 'Quản lý nhà trọ'}
      </div>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode="inline"
        theme="dark"
        items={leftMenuItems}
      />
    </Sider>
  );
};

export default Sidebar;
