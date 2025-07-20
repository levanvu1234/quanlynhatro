import React, { useContext, useEffect } from 'react';
import axios from './util/axios.customize';
import './style/global.css'
import Sidebar from './component/layout/header';
import { Outlet } from 'react-router-dom';
import { AuthContext } from './component/context/auth.context';
import { Spin, Layout } from 'antd';
import '@fortawesome/fontawesome-free/css/all.min.css';

const { Content } = Layout;

function App() {
  const { setAuth, apploading, SetAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      SetAppLoading(true);
      const res = await axios.get(`/v1/api/account`);
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
        console.log('thử res >>', res);
      }
      SetAppLoading(false);
    };
    fetchAccount();
  }, []);

  return (
    <div>
      {apploading === true ? (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Spin />
        </div>
      ) : (
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar />
          <Layout>
            <Content style={{ margin: 0, padding: 0 }}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      )}
    </div>
  );
}

export default App;
