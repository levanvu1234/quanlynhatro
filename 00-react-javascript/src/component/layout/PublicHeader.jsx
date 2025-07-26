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
import "../../style/global.css"
import logo from "../../assets/R__2_-removebg-preview-removebg-preview.png"
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
        background: ' white',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        color: 'brown',
      }}
    >
      {/* Logo */}
       <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            fontWeight: 'bold',
            fontSize: 20,
            color: 'brown',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {[logo].map((src) => (
            <img
              src={src} 
              alt="logo"
              style={{ height: '70px', width: 'auto' }}
            />
          ))}
          
          <span>NhaTroHD</span>
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
                    color: 'brown',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  >
                  <UserOutlined />
                  <h3>Xin chào, {auth.user.name}</h3>
                  </div>
                </Space>
              </a>
            </Dropdown>
          ) : (
            <Menu.Item key="login" style={{ 
                    color: 'brown',
                  }}>
              <Link to="/login">Đăng nhập</Link>
            </Menu.Item>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default PublicHeader;
