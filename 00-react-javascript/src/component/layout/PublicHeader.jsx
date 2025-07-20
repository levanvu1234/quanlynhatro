import React, { useContext, useState } from 'react';
import {
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Menu, Dropdown, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const PublicHeader = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [current, setCurrent] = useState('home');

  const dropdownMenuItems = [
   {
    label: (
      <span
        onClick={() => {
        localStorage.clear('access_token');
        navigate('/');
        setAuth({
        isAuthenticated: false,
        user: { phonenumber: '', name: '',role:'', },
        });
        setCurrent('home');
        }}
      >
      Đăng xuất
      </span>
      ),
      key: 'logout',
      icon: <SettingOutlined />,
      },
    {
      label: (
        <Link to={`/user/${auth.user._id}`}>
          Thông tin tài khoản
        </Link>
      ),
      key: 'account',
      icon: <UserOutlined />,
    },

    {
      type: 'divider',
    },
   
  ];

  return (
    <div
      style={{
        backgroundColor: '#1e3a8a',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        color: 'white',
      }}
    >
      {/* Logo */}
      <div style={{ flex: '0 0 auto' }}>
        <Link
          to="/"
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            color: 'white',
            textDecoration: 'none',
          }}
        >
          🏠 NhaTroHD
        </Link>
      </div>

      {/* Menu chính */}
      <Menu
        onClick={(e) => setCurrent(e.key)}
        selectedKeys={[current]}
        mode="horizontal"
        theme="dark"
        style={{
          backgroundColor: 'transparent',
          flex: '1 1 auto',
          justifyContent: 'center',
          display: 'flex',
          lineHeight: '64px',
          borderBottom: 'none',
        }}
      >
        {/* Dropdown dưới dạng Menu.Item */}
      
      </Menu>

      {/* Thông tin người dùng hoặc đăng nhập/đăng ký */}
      <div style={{ flex: '0 0 auto' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          style={{
            backgroundColor: 'transparent',
            lineHeight: '64px',
            borderBottom: 'none',
          }}
        >
          {auth?.isAuthenticated ? (
            <Dropdown menu={{ items: dropdownMenuItems }} >
              <a onClick={e => e.preventDefault()}>
                <Space>
                 <div
                  style={{
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  >
                  <UserOutlined />
                  <span>Xin chào, {auth.user.name}</span>
                  </div>
                </Space>
              </a>
            </Dropdown>
          ) : (
            <Menu.Item key="login">
              <Link to="/admin">Đăng nhập</Link>
            </Menu.Item>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default PublicHeader;
