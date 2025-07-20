import { useEffect, useState } from "react";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  notification,
  Divider,
  Modal
} from "antd";
import { pdf } from '@react-pdf/renderer';
import PrintableBill from './PrintableBill';
import dayjs from "dayjs";
import '../style/room.css';
import '../style/button.css';
import {
  GetBillApi,
  CreateBillgApi,
  GetRoomApi,
  updateBillApi
} from "../util/api";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PrinterOutlined
} from "@ant-design/icons";

const MonthlyBillPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterRoom, setFilterRoom] = useState(undefined);
  const [filterMonth, setFilterMonth] = useState(undefined);
  const [filterYear, setFilterYear] = useState(undefined);

  const fetchBills = async () => {
    try {
      const res = await GetBillApi();
      if (Array.isArray(res)) {
        setDataSource(res);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bill:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await GetRoomApi();
      if (Array.isArray(res)) {
        setRooms(res);
      }
    } catch (err) {
      console.error("Lỗi khi lấy phòng:", err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchRooms();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingBill) {
        await updateBillApi(editingBill._id, values);
        notification.success({ message: "Cập nhật hóa đơn thành công!" });
      } else {
        await CreateBillgApi(values);
        notification.success({ message: "Tạo hóa đơn thành công!" });
      }
      form.resetFields();
      setEditingBill(null);
      setIsModalOpen(false);
      fetchBills();
    } catch (err) {
      console.error("Lỗi khi xử lý bill:", err);
      notification.error({ message: "Lỗi khi xử lý hóa đơn" });
    }
  };

  const handlePrintPdf = async (bill) => {
    try {
      const blob = await pdf(<PrintableBill bill={bill} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (err) {
      console.error("❌ Lỗi tạo file PDF:", err);
      notification.error({ message: "Lỗi khi tạo file PDF" });
    }
  };

  const filteredData = dataSource.filter((item) => {
    const roomName = item.room?.name?.toLowerCase() || "";
    const buildingName = item.room?.building?.name?.toLowerCase() || "";
    const search = searchText.toLowerCase();
    const matchesSearch = roomName.includes(search) || buildingName.includes(search);
    const matchesRoom = filterRoom ? item.room?._id === filterRoom : true;
    const matchesMonth = filterMonth ? item.month === filterMonth : true;
    const matchesYear = filterYear ? item.year === filterYear : true;
    return matchesSearch && matchesRoom && matchesMonth && matchesYear;
  });

  const columns = [
    {
      title: "Phòng",
      dataIndex: "room",
      render: (room) => room?.name || "Không rõ",
    },
    {
      title: "Tòa nhà",
      render: (_, record) => record.room?.building?.name || "Không rõ",
    },
    {
      title: "Tháng",
      dataIndex: "month",
    },
    {
      title: "Năm",
      dataIndex: "year",
    },
    {
      title: "Tiền phòng",
      render: (_, record) =>
        record.room?.roomPrice != null
          ? record.room.roomPrice.toLocaleString("vi-VN") + " ₫"
          : "Chưa có",
    },
    {
      title: "Số điện mới",
      dataIndex: "sodienmoi",
    },
    {
      title: "Số điện cũ",
      dataIndex: "sodiencu",
    },
    {
      title: "Số nước mới",
      dataIndex: "sonuocmoi",
    },
    {
      title: "Số nước cũ",
      dataIndex: "sonuoccu",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalCost",
      render: (value) =>
        value != null ? value.toLocaleString("vi-VN") + " ₫" : "Chưa tính",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            className="action-button edit"
            onClick={() => {
              setEditingBill(record);
              form.setFieldsValue({
                ...record,
                room: record.room?._id,
              });
              setIsModalOpen(true);
            }}
            icon={<EditOutlined />}
          >
            Chỉnh sửa
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => handlePrintPdf(record)}>
            In PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="room-page-container">
      <div style={{
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <h2 style={{ color:'#1e3a8a',fontSize: '24px' }}>Quản lý hóa đơn</h2>
          <Button className="add-button" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm hóa đơn
          </Button>
          <Input
            placeholder="Tìm phòng hoặc tòa nhà"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo phòng"
            allowClear
            style={{ width: 180 }}
            value={filterRoom}
            onChange={(value) => setFilterRoom(value ?? undefined)}
          >
            {rooms.map((room) => (
              <Select.Option key={room._id} value={room._id}>
                {room.name} ({room.building?.name || "?"})
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo tháng"
            allowClear
            style={{ width: 150 }}
            value={filterMonth}
            onChange={(value) => setFilterMonth(value ?? undefined)}
          >
            {[...Array(12)].map((_, i) => (
              <Select.Option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo năm"
            allowClear
            style={{ width: 150 }}
            value={filterYear}
            onChange={(value) => setFilterYear(value ?? undefined)}
          >
            {[...new Set(dataSource.map((bill) => bill.year))].map((year) => (
              <Select.Option key={year} value={year}>
                Năm {year}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSearchText("");
              setFilterRoom(undefined);
              setFilterMonth(undefined);
              setFilterYear(undefined);
            }}
          >
            Xóa lọc
          </Button>
        </div>
      </div>

      <Modal
        title={editingBill ? "Sửa hóa đơn" : "Thêm hóa đơn mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBill(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingBill ? "Cập nhật" : "Tạo hóa đơn"}
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="room" label="Phòng" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn phòng"
              onChange={(roomId) => {
                const selectedRoom = rooms.find(r => r._id === roomId);
                form.setFieldsValue({
                  electricityUnitPrice: selectedRoom?.building?.electricityUnitPrice || 0,
                  waterUnitPrice: selectedRoom?.building?.waterUnitPrice || 0,
                  roomPrice: selectedRoom?.roomPrice || 0,
                });
              }}
            >
              {rooms.map((room) => (
                <Select.Option key={room._id} value={room._id}>
                  {room.name} ({room.building?.name || "?"})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="month" label="Tháng" rules={[{ required: true }]}>
              <InputNumber min={1} max={12} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
              <InputNumber min={2020} max={2100} style={{ width: 150 }} />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="sodiencu" label="Số điện cũ" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="sodienmoi" label="Số điện mới" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
          </div>
         <Form.Item name="roomPrice" label="Tiền phòng">
            <InputNumber min={0} disabled />
          </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="sonuoccu" label="Số nước cũ" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="sonuocmoi" label="Số nước mới" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Divider />

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </div>
  );
};

export default MonthlyBillPage;
