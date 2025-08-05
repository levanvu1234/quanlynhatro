import {
  notification,
  Table,
  Modal,
  Form,
  Input,
  Button,
  Select,
  Divider,
  Upload,
  DatePicker,
  
} from "antd";
import { useEffect, useState } from "react";
import {
  GetRoomApi,
  CreateRoomApi,
  GetBuildingApi,
  updateRoomApi,
  GetUserApi,
  GetDeviceApi,
} from "../util/api";
import {
  EditOutlined,
  IdcardOutlined,
  PlusOutlined,
  DeleteOutlined,
  ToolOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../style/room.css"; // Import CSS styles for room page
import "../style/button.css"; // Import CSS styles for buttons

const RoomPage = () => {
  // Quản lý file upload
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedRoomImages, setSelectedRoomImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // ảnh cũ giữ lại
  const [deletedImages, setDeletedImages] = useState([]);   // ảnh cũ bị xóa
  //
  const [dataSource, setDataSource] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [users, setUsers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [isEdit, setIsEdit] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRoomUsers, setSelectedRoomUsers] = useState([]);

  const selectedUsers = Form.useWatch("users", form);

  // Filter & search states
  const [filterActivity, setFilterActivity] = useState(undefined);
  const [filterBuilding, setFilterBuilding] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  //modal thietbij
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedRoomDevices, setSelectedRoomDevices] = useState([]); 
  //loadding
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  // API fetch
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await GetRoomApi();
      if (Array.isArray(res)) {
        await fetchDevicesForRooms(res);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phòng:", err);
    }finally {
      setLoading(false);
    }
  };
  //thiết bị
  const fetchDevicesForRooms = async (rooms) => {
  try {
    const res = await GetDeviceApi();
    const allDevices = Array.isArray(res?.data) ? res.data : [];
    const updatedRooms = rooms.map(room => {
      const devicesForRoom = allDevices.filter(d => {
        if (!d.room) return false;
        if (typeof d.room === 'string') return d.room === room._id;
        if (typeof d.room === 'object') return d.room._id === room._id;
        return false;
      });
      
      return { ...room, devices: devicesForRoom };
    });

    setDataSource(updatedRooms);
    setFilteredData(updatedRooms);
  } catch (err) {
    console.error("Lỗi lấy thiết bị:", err);
    setDataSource(rooms);
    setFilteredData(rooms);
  }
  };

//tòa nhà
  const fetchBuildings = async () => {
    try {
      const res = await GetBuildingApi();
      setBuildings(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Lỗi khi lấy tòa nhà:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await GetUserApi();
      setUsers(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Lỗi khi lấy user:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBuildings();
    fetchUsers();
  }, []);

  // Filter & search data
  useEffect(() => {
  const filtered = dataSource.filter((room) => {
    // Tự gán activity tạm thời nếu chưa có
    const activity =
      room.activity ||
      (room.users && room.users.length > 0 ? "Đã thuê" : "Đang trống");

    const matchesName = room.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesActivity = filterActivity
      ? activity === filterActivity
      : true;

    const matchesBuilding = filterBuilding
      ? room.building?._id === filterBuilding
      : true;

    return matchesName && matchesActivity && matchesBuilding;
  });

  setFilteredData(filtered);
  }, [searchText, filterActivity, filterBuilding, dataSource]);


  // Xử lý submit form (thêm / sửa)
  const handleSubmitRoom = () => {
  form
    .validateFields()
    .then(async (values) => {
      try {
        setSaving(true); // Bắt đầu loading
        const formData = new FormData();
        // Tính activity dựa trên users
        const activity = values.users && values.users.length > 0 ? "Đã thuê" : "Đang trống";
        formData.append("activity", activity);
        
        // Các trường text, ngày tháng
        for (const key in values) {
          if (key === "startDate" || key === "endDate") {
            if (values[key]) {
              formData.append(key, values[key].toISOString());
            } else {
              formData.append(key, "");
            }
          } else if (key !== "users") {
            formData.append(key, values[key]);
          }
        }

        // Xử lý mảng users
        if (values.users && values.users.length > 0) {
          values.users
            .filter((userId) => !!userId && userId.trim() !== "")
            .forEach((userId) => formData.append("users[]", userId));
        }

        // Gửi ảnh mới (file thật)
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });

        // Gửi ảnh cũ còn giữ (danh sách tên file)
        formData.append("existingImages", JSON.stringify(existingImages.map(img => img.originUrl)));

        // Gửi danh sách ảnh bị xóa (tên file)
        formData.append("deletedImages", JSON.stringify(deletedImages));

        let res;
        if (isEdit) {
          res = await updateRoomApi(editingRoomId, formData);
        } else {
          res = await CreateRoomApi(formData);
        }

        const newRoom = res?.data || res;
        if (newRoom && newRoom._id) {
          notification.success({
            message: isEdit ? "Cập nhật phòng thành công" : "Thêm phòng thành công",
          });
          await fetchRooms();
        } else {
          throw new Error("Không nhận được _id từ server");
        }

        form.resetFields();
        setFileList([]);
        setExistingImages([]);
        setDeletedImages([]);
        setIsModalOpen(false);
        setIsEdit(false);
        setEditingRoomId(null);
      } catch (error) {
        notification.error({
          message: isEdit ? "Cập nhật thất bại" : "Thêm phòng thất bại",
          description: error.message,
        });
      }finally {
        setSaving(false); // Dừng loading
      }
    })
    .catch((err) => {
      console.log("Validate Failed:", err);
    });
};


  // Mở modal sửa phòng, điền form + fileList ảnh
  const handleEditRoom = (room) => {
  setIsEdit(true);
  setEditingRoomId(room._id);
  setIsModalOpen(true);

  form.setFieldsValue({
    name: room.name,
    activity: room.activity,
    building: room.building?._id || room.building,
    users: room.users?.map((user) => user._id),
    startDate: room.startDate ? dayjs(room.startDate) : null,
    endDate: room.endDate ? dayjs(room.endDate) : null,
    roomPrice: room.roomPrice,
    area: room.area,
    description: room.description,
  });

  // Tạo danh sách ảnh cũ dạng object có url và originUrl
  if (room.images && Array.isArray(room.images)) {
    const oldImages = room.images.map((img, index) => ({
      uid: `old-${index}`,
      name: img,
      status: "done",
      url: `http://localhost:8080/uploads/${img}`, // URL ảnh hiển thị
      originUrl: img, // tên file gốc để backend nhận diện ảnh cũ
    }));
    setExistingImages(oldImages);
    setFileList(oldImages); // fileList gồm ảnh cũ + ảnh mới (lúc này mới có ảnh cũ)
  } else {
    setExistingImages([]);
    setFileList([]);
  }
  setDeletedImages([]);
};


  // Xem chi tiết người thuê
  const handleViewUsers = (room) => {
    setSelectedRoomUsers(room.users || []);
    setIsViewModalOpen(true);
  };

  // Xử lý upload ảnh
  const handleUploadChange = ({ fileList: newFileList, file }) => {
    if (file.status === "removed" && file.originUrl) {
      setDeletedImages((prev) => [...prev, file.originUrl]);
      setExistingImages((prev) =>
        prev.filter((img) => img.originUrl !== file.originUrl)
      );
    }

    // Gộp lại: giữ url cho ảnh cũ
    const mergedList = newFileList.map((f) => {
      if (f.originFileObj) return f; // ảnh mới
      return {
        ...f,
        url: f.url, // giữ nguyên
        status: "done",
      };
    });

    setFileList(mergedList);
  };



  // Xem preview ảnh
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf("/") + 1));
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
//modal thiet bị
  const handleViewDevices = (room) => {
    setSelectedRoomDevices(room.devices || []);
    setIsDeviceModalOpen(true);
  };
  useEffect(() => {
  if (!selectedUsers || selectedUsers.length === 0) {
    form.setFieldsValue({
      startDate: null,
      endDate: null,
    });
  }
  }, [selectedUsers, form]);

  // Columns bảng
  const columns = [
    { title: "Tên phòng", dataIndex: "name" },
    {
      title: "Hoạt động",
      render: (_, record) => {
        const isOccupied = record.users && record.users.length > 0;
        const color = isOccupied ? "green" : "red";
        const text = isOccupied ? "Đã thuê" : "Đang trống";

        return (
          <span style={{ color}}>
            {text}
          </span>
        );
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY ") : "---"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY ") : "---"),
    },
    {
      title: "Diện tích",
      dataIndex: "area",
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
    },
    {
      title: "Giá phòng",
      dataIndex: "roomPrice",
      render: (value) => (value ? value.toLocaleString("vi-VN") + " VNĐ" : "---"),
    },
    {
      title: "Tòa nhà",
      dataIndex: "building",
      render: (building) => building?.name || "---",
    },
    {
      title: "Khu vực",
      dataIndex: "building",
      render: (building) => building?.location || "---",
    },
    {
      title: "Ảnh phòng",
      dataIndex: "images",
      render: (images) =>
        images && images.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={`http://localhost:8080/uploads/${images[0]}`}
              alt="room"
              style={{
                width: 60,
                height: 40,
                objectFit: "cover",
                cursor: "pointer",
                borderRadius: 4,
              }}
              onClick={() => {
                setSelectedRoomImages(images);
                setImageModalVisible(true);
              }}
            />
            
          </div>
        ) : (
          "---"
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              className="action-button edit"
              onClick={() => handleEditRoom(record)}
              icon={<EditOutlined />}
            >
              Chỉnh sửa
            </Button>

            {record.users && record.users.length > 0 && (
              <Button
                className="action-button view"
                onClick={() => handleViewUsers(record)}
                icon={<IdcardOutlined />}
              >
                Người thuê
              </Button>
            )}
          </div>
          {record.devices && record.devices.length > 0 && (
          <Button
            className="action-button device"
            onClick={() => handleViewDevices(record)}
            icon={ <ToolOutlined />}
          >
            Xem thiết bị
          </Button>
          )}
          
        </div>
      ),
    }


  ];

  return (
    <div className="room-page-container">
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ color: "#1e3a8a",fontSize: '24px' }}>Quản lý phòng</h2>
          {/* Nút thêm phòng */}
          <Button
            className="add-button"
            onClick={() => {
              setIsModalOpen(true);
              setIsEdit(false);
              form.resetFields();
              setFileList([]);
            }}
            icon={<PlusOutlined />}
          >
            Thêm phòng
          </Button>
        </div>
       

        {/* Bộ lọc và tìm kiếm */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Input
            placeholder="Tìm theo tên phòng"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />

          <Select
            placeholder="Lọc theo hoạt động"
            allowClear
            value={filterActivity}
            onChange={(value) => setFilterActivity(value ?? undefined)}
            style={{ width: 250 }}
          >
            <Select.Option value="Đã thuê">Đã thuê</Select.Option>
            <Select.Option value="Đang trống">Đang trống</Select.Option>
          </Select>

          <Select
            placeholder="Lọc theo tòa nhà"
            allowClear
            value={filterBuilding}
            onChange={(value) => setFilterBuilding(value ?? undefined)}
            style={{ width: 200 }}
          >
            {buildings.map((b) => (
              <Select.Option key={b._id} value={b._id}>
                {b.name}
              </Select.Option>
            ))}
          </Select>

          <Button
            type="primary"
            danger
            onClick={() => {
              setSearchText("");
              setFilterActivity(undefined);
              setFilterBuilding(undefined);
            }}
            icon={<DeleteOutlined />}
          >
            Xóa lọc
          </Button>
        </div>
      </div>

      <Divider />

      {/* Bảng danh sách phòng */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 4 }}
        loading={loading}
      />

      {/* Modal thêm / sửa phòng */}
      <Modal
        title={isEdit ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setEditingRoomId(null);
          form.resetFields();
          setFileList([]);
        }}
        onOk={handleSubmitRoom}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose={true}
        confirmLoading={saving} 
        loading={loading}
      >
        <Form form={form} layout="vertical" encType="multipart/form-data">
          <Form.Item
            name="name"
            label="Tên phòng"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
          >
            <Input placeholder="VD: Phòng 101" />
          </Form.Item>

         <Form.Item shouldUpdate={(prev, curr) => prev.users !== curr.users}>
            {({ getFieldValue }) => {
              const users = getFieldValue("users");
              const required = users && users.length > 0;

              return (
                <Form.Item
                  name="startDate"
                  label="Ngày bắt đầu"
                  rules={required ? [{ required: true, message: "Vui lòng nhập ngày bắt đầu" }] : []}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item shouldUpdate={(prev, curr) => prev.users !== curr.users}>
            {({ getFieldValue }) => {
              const users = getFieldValue("users");
              const required = users && users.length > 0;

              return (
                <Form.Item
                  name="endDate"
                  label="Ngày kết thúc"
                  rules={required ? [{ required: true, message: "Vui lòng nhập ngày kết thúc" }] : []}
                >
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              );
            }}
          </Form.Item>


          <Form.Item
            name="roomPrice"
            label="Giá phòng (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá phòng" }]}
          >
            <Input type="number" min={0} placeholder="Nhập giá phòng (VD: 2500000)" />
          </Form.Item>
             

          <Form.Item
            name="area"
            label="diện tích (m2)"
            rules={[{ required: true, message: "Vui lòng nhập diện phòng" }]}
          >
            <Input type="number" min={0} placeholder="Nhập diện tích phòng (VD: 25m2)" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Ghi chú"
          >
            <Input placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item
            name="building"
            label="Tòa nhà"
            rules={[{ required: true, message: "Vui lòng chọn tòa nhà" }]}
          >
            <Select placeholder="Chọn tòa nhà">
              {buildings.map((b) => (
                <Select.Option key={b._id} value={b._id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="users" label="Người dùng trong phòng">
            <Select mode="multiple" placeholder="Chọn người dùng" optionFilterProp="label" showSearch>
              {users
              .filter((user) => user.condition === "Hoạt động")
              .map((user) => (
                <Select.Option
                  key={user._id}
                  value={user._id}
                  label={`${user.name} (${user.phonenumber})`}
                >
                  {user.name} ({user.phonenumber})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Upload hình ảnh phòng */}
          <Form.Item label="Hình ảnh phòng">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              multiple
              beforeUpload={() => false} // không tự động upload
              accept="image/*"
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem ảnh preview */}
      <Modal
        title="Ảnh phòng"
        open={imageModalVisible}
        onCancel={() => {
          setImageModalVisible(false);
          setSelectedRoomImages([]);
        }}
        footer={null}
        width={800}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {selectedRoomImages.map((imgPath, index) => (
            <img
              key={index}
              src={`http://localhost:8080/uploads/${imgPath}`}
              alt={`room-${index}`}
              style={{
                width: "calc(25% - 12px)",
                height: 120,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      </Modal>

      {/* Modal xem chi tiết người thuê */}
      <Modal
        title="Chi tiết người thuê"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        className="user-view-modal"
      >
        {selectedRoomUsers.length > 0 ? (
          <ul className="user-list">
            {selectedRoomUsers.map((user) => (
              <li key={user._id} className="user-item">
                <strong>{user.name}</strong> – {user.email} – {user.phonenumber}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-user">Không có người thuê nào trong phòng này.</p>
        )}
      </Modal>
      <Modal
        title="Danh sách thiết bị"
        open={isDeviceModalOpen}
        onCancel={() => setIsDeviceModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedRoomDevices.length > 0 ? (
          <ul style={{ paddingLeft: 20 }}>
            {selectedRoomDevices.map((device) => (
              <li key={device._id} className="user-item">
                <strong>{device.name}</strong> — Số lượng: {device.quantity} — Tình trạng: {device.condition} — Hoạt động: {device.activity} 
              </li>
            ))}
          </ul>
        ) : (
          <p><em>Không có thiết bị trong phòng này.</em></p>
        )}
      </Modal>

    </div>
  );
};

export default RoomPage;
