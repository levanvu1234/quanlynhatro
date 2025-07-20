import { notification, Table, Modal, Form, Input, Button, Select, Divider } from "antd";
import { useEffect, useState } from "react";
import {
  GetUserApi,
  updateUserApi,
  createUserApi
} from "../util/api";
import "../style/userpage.css";
import "../style/button.css";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [form] = Form.useForm();

  const fetchUser = async () => {
    try {
      const usersRes = await GetUserApi();
      if (!Array.isArray(usersRes)) {
        return notification.error({
          message: "Lỗi khi tải dữ liệu",
          description: "Không thể lấy dữ liệu người dùng.",
        });
      }

      const updatedUsers = usersRes.map((user) => ({
        ...user,
        activity:
          Array.isArray(user.rooms) && user.rooms.length > 0
            ? user.rooms.map((r) => r.name).join(", ")
            : "Chưa ở phòng nào",
        roombuilding:
          Array.isArray(user.rooms) && user.rooms.length > 0
            ? [...new Set(user.rooms.map((r) => r.building?.name))].join(", ")
            : "Không ở tòa nào",
      }));

      setDataSource(updatedUsers);
      setFilteredData(updatedUsers);
    } catch (err) {
      console.error("Lỗi fetchUser:", err);
      notification.error({
        message: "Lỗi hệ thống",
        description: "Không thể tải dữ liệu người dùng.",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = (record) => {
    setIsAddMode(false);
    setCurrentUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phonenumber: record.phonenumber,
      role: record.role || "User",
      password: "",
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setIsAddMode(true);
    setCurrentUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "User" });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!isAddMode && currentUser) {
        if (!values.password) delete values.password;
        const res = await updateUserApi(currentUser._id, values);
        if (res.EC === 0) {
          notification.success({ message: res.EM });
        } else {
          notification.error({ message: res.EM || "Cập nhật thất bại" });
        }
      } else {
        const res = await createUserApi(
          values.name,
          values.email,
          values.phonenumber,
          values.password,
          values.role
        );
        if (res) {
          notification.success({ message: "Thêm người dùng thành công" });
        } else {
          notification.error({ message: "Thêm người dùng thất bại" });
        }
      }

      setIsModalOpen(false);
      fetchUser();
    } catch (err) {
      console.error("Lỗi xử lý form:", err);
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "User", value: "User" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Phòng thuê",
      dataIndex: "activity",
      filters: [...new Set(dataSource.map((user) => user.activity))]
        .filter(Boolean)
        .map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.activity === value,
    },
    {
      title: "Tòa nhà",
      dataIndex: "roombuilding",
      filters: [...new Set(dataSource.map((user) => user.roombuilding))]
        .filter(Boolean)
        .map((item) => ({ text: item, value: item })),
      onFilter: (value, record) => record.roombuilding === value,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phonenumber",
    },
    {
      title: "Hành động",
      render: (text, record) => (
        <>
          <Button
            className="action-button edit"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Chỉnh sửa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="user-page-container">
      <div className="user-page-header">
        <div style={{ display: "flex", gap: 16 }}>
          <h2>Quản lý người dùng</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{marginTop: 30}} className="add-button" >
            Thêm User
          </Button>
        </div>
           <Input.Search
            className="user-page-search"
            placeholder="Tìm theo số điện thoại"
            allowClear
            enterButton="Tìm kiếm"
            onSearch={(value) => {
              setSearchText(value);
              const filtered = dataSource.filter((user) =>
                user.phonenumber?.toLowerCase().includes(value.toLowerCase())
              );
              setFilteredData(filtered);
            }}
          /> 

      </div>
      <Divider />
      <Table
        bordered
        className="ant-table user-table"
        dataSource={filteredData}
        columns={columns}
        rowKey={"_id"}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal thêm / sửa */}
      <Modal
        title={isAddMode ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={isAddMode ? "Tạo mới" : "Lưu"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phonenumber"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Chức vụ"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
          >
            <Select placeholder="Chọn chức vụ">
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={
              isAddMode
                ? [{ required: true, message: "Vui lòng nhập mật khẩu" }]
                : []
            }
          >
            <Input.Password placeholder={isAddMode ? "" : "Để trống nếu không đổi"} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
