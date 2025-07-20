import React from 'react';

function Hello() {
  return (
    <div style={{
      minHeight: '80vh', // full chiều cao màn hình
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: 'linear-gradient(to bottom right, #e0f2ff, #f5faff)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Hệ thống Quản lý Nhà trọ</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          Chào mừng bạn đến với nền tảng quản lý nhà trọ thông minh – giải pháp toàn diện giúp chủ trọ theo dõi và vận hành hệ thống phòng trọ một cách dễ dàng và hiệu quả.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          Ứng dụng hỗ trợ quản lý thông tin người thuê, tình trạng phòng, hóa đơn tiền phòng, điện, nước, cùng nhiều chức năng tiện ích khác. Giao diện thân thiện, tốc độ nhanh, phù hợp với cả thiết bị di động và máy tính.
        </p>
        <p style={{ fontSize: '1.1rem', marginTop: '30px', fontStyle: 'italic' }}>
          Được phát triển bằng ReactJS cho frontend và Node.js cho backend.
        </p>
      </div>
    </div>
  );
}

export default Hello;
