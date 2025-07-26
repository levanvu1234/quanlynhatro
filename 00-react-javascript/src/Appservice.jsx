import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import PublicHeader from './component/layout/PublicHeader';
import Footer from './component/layout/PublicFooter'; // import footer mới
import { AuthContext } from './component/context/auth.context.jsx';
import axiosInstance from './util/axios.customize.js';
import './style/global.css'
const { Header, Content } = Layout;

const AppService = () => {
  const { setAuth, apploading, SetAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        SetAppLoading(true);
        const res = await axiosInstance.get('/v1/api/account');
        if (res && !res.message) {
          setAuth({
            isAuthenticated: true,
            user: {
              phonenumber: res.phonenumber,
              name: res.name,
              role: res.role,
              _id: res._id,
            },
          });
        } else {
          console.warn('Không có thông tin người dùng:', res.message);
        }
      } catch (error) {
        console.error('Lỗi xác thực người dùng:', error);
      } finally {
        SetAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  if (apploading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu người dùng...">
          <div style={{ width: 0, height: 0 }}></div>
        </Spin>
      </div>
    );
  }

 return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        
        padding: 0,
      }}
    >
      <Layout style={{ flex: 1 }}>
        <Header style={{ padding: 0 }}>
          <PublicHeader />
        </Header>

        <Content style={{  backgroundColor: '#fff' ,overflow: 'auto' , flex: 1 }}>
          <Outlet />
        </Content>
      </Layout>

      <Footer />
    </div>
  );
};

export default AppService;
