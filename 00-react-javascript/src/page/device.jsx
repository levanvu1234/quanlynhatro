import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  message,
} from 'antd';
import { EditOutlined ,IdcardOutlined,PlusOutlined,DeleteOutlined} from '@ant-design/icons'; 
import {
  GetDeviceApi,
  CreateDeviceApi,
  updateDeviceApi,
  GetRoomApi,
} from '../util/api';
import '../style/device.css';
import'../style/button.css';
const { Option } = Select;

const DevicePage = () => {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();
    //lọc
    const [filterRoom, setFilterRoom] = useState(null);
    const [filterBuilding, setFilterBuilding] = useState(null);

  // Lấy danh sách thiết bị
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await GetDeviceApi();
      setDevices(res.data);
    } catch (error) {
      console.error(error);
      message.error('Không lấy được danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách phòng
  const fetchRooms = async () => {
  try {
    const res = await GetRoomApi(); // res là mảng trực tiếp
    console.log("📦 ROOM DATA:", res); // ✅ sẽ thấy array nếu đúng

    if (Array.isArray(res)) {
      setRooms(res);
    } else {
      message.error("Dữ liệu phòng không hợp lệ");
      setRooms([]);
    }
  } catch (error) {
    console.error(error);
    message.error("Không lấy được danh sách phòng");
    setRooms([]);
  }
};


  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, []);

  // Mở modal thêm hoặc sửa
  const handleOpenModal = (device = null) => {
    setEditingDevice(device);
    setIsModalOpen(true);

    if (device) {
      form.setFieldsValue({
        name: device.name,
        quantity: device.quantity,
        condition: device.condition,
        note: device.note,
        room: device.room?._id,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        quantity: 1,
        condition: 'Tốt',
      });
    }
  };

  // Gửi form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.room) {
        message.error('Vui lòng chọn phòng');
        return;
      }

      if (editingDevice) {
        await updateDeviceApi(editingDevice._id, values);
        message.success('Cập nhật thiết bị thành công');
      } else {
        await CreateDeviceApi(values);
        message.success('Tạo thiết bị mới thành công');
      }

      setIsModalOpen(false);
      fetchDevices();
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi lưu thiết bị');
    }
  };
    const getFilteredDevices = () => {
    return devices.filter(device => {
        const roomMatch = filterRoom ? device.room?._id === filterRoom : true;
        const buildingMatch = filterBuilding ? device.room?.building?._id === filterBuilding : true;
        return roomMatch && buildingMatch;
    });
    };
  const columns = [
    { title: 'Tên thiết bị', dataIndex: 'name', key: 'name' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Tình trạng', dataIndex: 'condition', key: 'condition' },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text) => text && text.trim() !== '' ? text : 'Không có',
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_, record) => record.room?.name || 'Không có',
    },
    {
      title: 'Tòa nhà',
      key: 'building',
      render: (_, record) => record.room?.building?.name || 'Không có',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button className="action-button edit"  onClick={() => handleOpenModal(record)} icon={<EditOutlined />}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="device-page-container">
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 16,
        }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ color: '#1e3a8a', margin: 0, fontSize: '24px' }}>Quản lý thiết bị</h2>
        <Button
          className="add-button"
          onClick={() => handleOpenModal()}
          icon={<PlusOutlined />}
        >
          Thêm thiết bị
        </Button>
      </div>
        {/* Bên phải: Bộ lọc */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Select
            placeholder="Lọc theo phòng"
            allowClear
            style={{ width: 200 }}
            value={filterRoom}
            onChange={(value) => setFilterRoom(value)}
            >
            {rooms.map((room) => (
                <Option key={room._id} value={room._id}>
                {room.name}
                </Option>
            ))}
            </Select>

            <Select
            placeholder="Lọc theo tòa nhà"
            allowClear
            style={{ width: 200 }}
            value={filterBuilding}
            onChange={(value) => setFilterBuilding(value)}
            >
            {[
                ...new Map(
                rooms
                    .filter((r) => r.building)
                    .map((room) => [room.building._id, room.building])
                ).values(),
            ].map((building) => (
                <Option key={building._id} value={building._id}>
                {building.name}
                </Option>
            ))}
            </Select>

            <Button
            type="primary"
            danger
             icon={<DeleteOutlined />}
            onClick={() => {
                setFilterRoom(null);
                setFilterBuilding(null);
            }}
            >
            Xóa lọc
            </Button>
        </div>
    </div>

    <Divider />
      <Table
        dataSource={getFilteredDevices()}
        columns={columns}
        rowKey="_id"    
        loading={loading}
        />

      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        title={editingDevice ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị'}
        okText={editingDevice ? 'Cập nhật' : 'Thêm'}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Tên thiết bị"
            rules={[{ required: true, message: 'Nhập tên thiết bị' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Nhập số lượng thiết bị' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="condition" label="Tình trạng">
            <Select>
              <Option value="Tốt">Tốt</Option>
              <Option value="Đang sửa">Đang sửa</Option>
              <Option value="Hư hỏng">Hư hỏng</Option>
            </Select>
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="room" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
            <Select showSearch optionFilterProp="children">
                {rooms.map((room) => {
                console.log('Room option:', room); // ✅ thêm dòng này
                return (
                    <Option key={room._id} value={room._id}>
                    {room.name} - {room.building?.name || 'Không có tòa'}
                    </Option>
                );
                })}
            </Select>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DevicePage;
