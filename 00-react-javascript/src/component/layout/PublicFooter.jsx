import React from 'react';
import { Row, Col } from 'antd';
import '../../style/footer.css';  // mình tách style ra file css cho dễ

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Logo và slogan */}
        <div className="footer-logo-slogan">
          <img
            src="src/assets/R__2_-removebg-preview-removebg-preview.png"
            alt="logo"
            style={{ height: '100px', width: 'auto' }}
          />
          <p> NhaTroHD cung cấp đa dạng loại phòng, bao gồm phòng trọ, chung cư mini và căn hộ dịch vụ.</p>
        </div>

        {/* Các link thông tin */}
        <Row gutter={24} className="footer-links">
          
          <Col span={10}>
            <h4>CẢM HỨNG</h4>
            <ul>
              <li>Phòng đẹp</li>
              <li>Tiêu chuẩn</li>
              <li>Dự án</li>
            </ul>
          </Col>
          <Col span={14}>
            <h4>LIÊN HỆ</h4>
            <ul>
              <li>Địa chỉ: 140 Lê Huy Toán, phường Quảng Thắng, Thành Phố Thanh Hóa, Thanh Hóa </li>
              <li>Email: nhatrohd@gmail.com</li>
              <li>SĐT liên hệ: 0972868236</li>
            </ul>
          </Col>
          <Col span={6}>
            
          </Col>
        </Row>
      </div>

      <div className="footer-bottom">
        <p>© NhaTroHD trân trọng phục vụ</p>
      </div>
    </footer>
  );
};

export default Footer;
