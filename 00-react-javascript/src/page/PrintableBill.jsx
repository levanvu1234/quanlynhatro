// src/components/PrintableBill.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Đăng ký font Roboto nếu cần (nếu dùng Google Font host nội bộ)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/font/Roboto-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/font/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Định nghĩa CSS
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: 'Roboto',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    padding: 4,
  },
  col: {
    flex: 1,
    padding: 2,
  },
  header: {
    fontWeight: 700,
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12,
  },
});

const PrintableBill = ({ bill }) => {
  if (!bill) return null;

  const {
    room,
    month,
    year,
    roomPrice = 0,
    totalCost = 0,
    sodienmoi = 0,
    sodiencu = 0,
    sonuocmoi = 0,
    sonuoccu = 0,
  } = bill;
  const electricityUsage = sodienmoi - sodiencu;
  const waterUsage = sonuocmoi - sonuoccu;
  //đơn giá điện và nước từ thông tin tòa nhà
  const electricityUnitPrice = room?.building?.electricityUnitPrice || 0;
  const waterUnitPrice = room?.building?.waterUnitPrice || 0;
  const format = (val) => (typeof val === 'number' ? val.toLocaleString('vi-VN') : val);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PHIẾU THU TIỀN PHÒNG TRỌ</Text>

        <View style={styles.info}>
          <Text>Phòng số: {room?.name || "Không rõ"}</Text>
          <Text>Tháng: {month} / {year}</Text>
          
        </View>

        {/* Header bảng */}
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.col, { flex: 2 }]}>Khoản thu</Text>
          <Text style={styles.col}>Số cũ</Text>
          <Text style={styles.col}>Số mới</Text>
          <Text style={styles.col}>Số lượng</Text>
          <Text style={styles.col}>Đơn giá</Text>
          <Text style={styles.col}>Thành tiền</Text>
        </View>

        {/* Điện */}
        <View style={styles.row}>
          <Text style={[styles.col, { flex: 2 }]}>Tiền điện sinh hoạt</Text>
          <Text style={styles.col}>{sodiencu}</Text>
          <Text style={styles.col}>{sodienmoi}</Text>
          <Text style={styles.col}>{electricityUsage}</Text>
          <Text style={styles.col}>{format(electricityUnitPrice)}</Text>
          <Text style={styles.col}>{format(electricityUsage * electricityUnitPrice)}</Text>
        </View>

        {/* Nước */}
        <View style={styles.row}>
          <Text style={[styles.col, { flex: 2 }]}>Tiền nước sinh hoạt</Text>
          <Text style={styles.col}>{sonuoccu}</Text>
          <Text style={styles.col}>{sonuocmoi}</Text>
          <Text style={styles.col}>{waterUsage}</Text>
          <Text style={styles.col}>{format(waterUnitPrice)}</Text>
          <Text style={styles.col}>{format(waterUsage * waterUnitPrice)}</Text>
        </View>

        {/* Tiền phòng */}
        <View style={styles.row}>
          <Text style={[styles.col, { flex: 2 }]}>Tiền phòng</Text>
          <Text style={styles.col}>-</Text>
          <Text style={styles.col}>-</Text>
          <Text style={styles.col}>-</Text>
          <Text style={styles.col}>{format(roomPrice)}</Text>
          <Text style={styles.col}>{format(roomPrice)}</Text>
        </View>

        {/* Tổng */}
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.col, { flex: 5 }]}>Tổng cộng</Text>
          <Text style={styles.col}>{format(totalCost)} ₫</Text>
        </View>

        {/* Chữ ký */}
        <View style={styles.signature}>
          <Text>Người lập phiếu</Text>
          <Text>Người nộp tiền</Text>
        </View>
        <View style={styles.signature}>
          <Text style={{ marginTop: 1 }}>Vu</Text>
          <Text>Người thuê phòng số: {room?.name || "Không rõ"}</Text>
        </View>
        <View style={styles.signature}>
          <Text style={{ marginTop: 1 }}>Le Van Vu</Text>
       

        </View>
      </Page>
    </Document>
  );

};

export default PrintableBill;
