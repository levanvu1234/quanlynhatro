import {
  notification,
  Table,
  Modal,
  Form,
  Input,
  Button,
  Divider,
  Select,
  InputNumber,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import {
  GetBuildingApi,
  CreateBuildingApi,
  updateBuildingApi,
} from "../util/api";
import { PlusOutlined ,DeleteOutlined,EditOutlined} from "@ant-design/icons";
import "../style/room.css";
import "../style/button.css";

const BuildingPage = () => {
  // ảnh mới upload
  const [buildingImages, setBuildingImages] = useState([]);
  // ảnh cũ từ DB (object phù hợp với Upload)
  const [existingImages, setExistingImages] = useState([]);
  // ảnh cũ bị xóa (dạng path string)
  const [deletedImages, setDeletedImages] = useState([]);

  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [viewAllImages, setViewAllImages] = useState([]);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [isEdit, setIsEdit] = useState(false);
  const [editingBuildingId, setEditingBuildingId] = useState(null);

  const [filterAddress, setFilterAddress] = useState(undefined);
  const [filterName, setFilterName] = useState(undefined);
  const [filteredData, setFilteredData] = useState([]);
  const [addressOptions, setAddressOptions] = useState([]);

  const fetchBuildings = async () => {
    try {
      const res = await GetBuildingApi();
      const buildings = Array.isArray(res) ? res : res.data || [];
      setDataSource(buildings);
      setFilteredData(buildings);
      const uniqueAddresses = [
        ...new Set(buildings.map((b) => b.address).filter(Boolean)),
      ];
      setAddressOptions(uniqueAddresses);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tòa nhà:", error);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    const filtered = dataSource.filter((building) => {
      const matchesName = filterName
        ? building.name === filterName
        : true;
      const matchesAddress = filterAddress
        ? building.address?.toLowerCase().includes(filterAddress.toLowerCase())
        : true;
      return matchesName && matchesAddress;
    });
    setFilteredData(filtered);
  }, [filterName, filterAddress, dataSource]);

  const handleAddBuilding = () => {
    form.validateFields().then(async (values) => {
      try {
        const formData = new FormData();

        // Thêm ảnh mới upload
        buildingImages.forEach((file) => {
          formData.append("images", file.originFileObj);
        });

        // Gửi danh sách ảnh cũ còn giữ dưới dạng JSON string
        const existingImagePaths = existingImages.map(img => img.originUrl);
        formData.append("existingImages", JSON.stringify(existingImagePaths));

        // Gửi dữ liệu form
        Object.entries(values).forEach(([key, val]) => {
          formData.append(key, val);
        });

        let res;
        if (isEdit && editingBuildingId) {
          res = await updateBuildingApi(editingBuildingId, formData);
        } else {
          res = await CreateBuildingApi(formData);
        }

        const building = res?.data?.data || res?.data || res;
        if (building && building._id) {
          notification.success({
            message: isEdit
              ? "Cập nhật tòa nhà thành công"
              : "Thêm tòa nhà thành công",
          });
          form.resetFields();
          setIsModalOpen(false);
          setIsEdit(false);
          setEditingBuildingId(null);

          // Reset ảnh
          setBuildingImages([]);
          setExistingImages([]);
          setDeletedImages([]);

          await fetchBuildings();
        } else {
          throw new Error("Không nhận được _id từ server");
        }
      } catch (error) {
        notification.error({
          message: isEdit
            ? "Cập nhật tòa nhà thất bại"
            : "Thêm tòa nhà thất bại",
        });
        console.error(error);
      }
    });
  };

  const handleEditBuilding = (building) => {
    setIsEdit(true);
    setEditingBuildingId(building._id);
    form.setFieldsValue({
      name: building.name,
      activity: building.activity,
      address: building.address,
      electricityUnitPrice: building.electricityUnitPrice,
      waterUnitPrice: building.waterUnitPrice,
      location: building.location,
    });

    // Chuyển ảnh cũ từ DB sang định dạng Upload object
    const oldImages = building.images?.map((url, idx) => ({
      uid: `old-${idx}`, // id riêng biệt
      name: url.split("/").pop(),
      status: "done",
      url: `http://localhost:8080${url}`,
      originUrl: url, // giữ path gốc để gửi lại cho backend
    })) || [];

    setExistingImages(oldImages);
    setBuildingImages([]);
    setDeletedImages([]);
    setIsModalOpen(true);
  };

  // Xử lý khi ảnh bị xóa (cũ hoặc mới)
  const handleImageRemove = (file) => {
    if (file.uid.startsWith("old-")) {
      // Ảnh cũ bị xóa -> lưu vào deletedImages
      setDeletedImages((prev) => [...prev, file.originUrl]);
      setExistingImages((prev) => prev.filter((img) => img.uid !== file.uid));
    } else {
      // Ảnh mới bị xóa
      setBuildingImages((prev) => prev.filter((img) => img.uid !== file.uid));
    }
  };

  // Khi danh sách ảnh thay đổi (upload component gọi)
  const handleUploadChange = ({ fileList }) => {
    // Tách file cũ và mới
    const newFiles = fileList.filter(f => !f.uid.startsWith("old-"));
    const oldFiles = fileList.filter(f => f.uid.startsWith("old-"));

    setBuildingImages(newFiles);
    setExistingImages(oldFiles);
  };

  const handleBuildingImagePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const columns = [
    { title: "Tên tòa nhà", dataIndex: "name" },
    { title: "Hoạt động", dataIndex: "activity" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Khu vực", dataIndex: "location" },
    { title: "Giá điện", dataIndex: "electricityUnitPrice" },
    { title: "Giá nước", dataIndex: "waterUnitPrice" },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      render: (images) =>
        images?.length ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={`http://localhost:8080${images[0]}`}
              alt="building"
              style={{
                width: 60,
                height: 40,
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() => {
                setViewAllImages(images);
                setIsViewAllModalOpen(true);
              }}
            />
          </div>
        ) : (
          "Không có"
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          className="action-button edit"
          onClick={() => handleEditBuilding(record)}
        >
          Chỉnh sửa
        </Button>
      ),
    },
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
          <h2 style={{ color: '#1e3a8a', margin: 0,fontSize: '24px' }}>Quản lý tòa nhà</h2>
          <Button
            className="add-button"
            onClick={() => {
              form.resetFields();
              setIsEdit(false);
              setEditingBuildingId(null);
              setBuildingImages([]);
              setExistingImages([]);
              setDeletedImages([]);
              setIsModalOpen(true);
            }}
            icon={<PlusOutlined />}
          >
            Thêm tòa nhà
          </Button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Select
            placeholder="Lọc theo tên tòa nhà"
            allowClear
            style={{ width: 250 }}
            value={filterName}
            onChange={(value) => setFilterName(value ?? undefined)}
          >
            {[...new Set(dataSource.map((b) => b.name))].map((name) => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo địa chỉ"
            allowClear
            value={filterAddress}
            onChange={(value) => setFilterAddress(value)}
            style={{ width: 250 }}
          >
            {addressOptions.map((addr) => (
              <Select.Option key={addr} value={addr}>
                {addr}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setFilterName(undefined);
              setFilterAddress(undefined);
            }}
          >
            Xóa lọc
          </Button>
        </div>
      </div>
      <Divider />
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={isEdit ? "Chỉnh sửa tòa nhà" : "Thêm tòa nhà mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setEditingBuildingId(null);
          setBuildingImages([]);
          setExistingImages([]);
          setDeletedImages([]);
        }}
        onOk={handleAddBuilding}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên tòa nhà"
            rules={[{ required: true, message: "Vui lòng nhập tên tòa nhà" }]}
          >
            <Input placeholder="VD: Tòa A" />
          </Form.Item>

          <Form.Item
            name="activity"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Tạm dừng">Tạm dừng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input placeholder="VD: 123 Nguyễn Văn Linh, TP.HCM" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Khu vực"
            rules={[{ required: true, message: "Vui lòng nhập khu vực" }]}
          >
            <Input placeholder="Hà Nội, Thanh Hóa" />
          </Form.Item>
          <Form.Item
            name="electricityUnitPrice"
            label="Đơn giá điện (VNĐ/kWh)"
            rules={[{ required: true, message: "Vui lòng nhập đơn giá điện" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="waterUnitPrice"
            label="Đơn giá nước (VNĐ/m³)"
            rules={[{ required: true, message: "Vui lòng nhập đơn giá nước" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Hình ảnh tòa nhà">
            <Upload
              listType="picture-card"
              fileList={[...existingImages, ...buildingImages]}
              onChange={handleUploadChange}
              onPreview={handleBuildingImagePreview}
              onRemove={handleImageRemove}
              multiple
              beforeUpload={() => false}
              accept="image/*"
            >
              {[...existingImages, ...buildingImages].length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tất cả hình ảnh tòa nhà"
        open={isViewAllModalOpen}
        onCancel={() => {
          setIsViewAllModalOpen(false);
          setViewAllImages([]);
        }}
        footer={null}
        width={800}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {viewAllImages.map((imgPath, index) => (
            <img
              key={index}
              src={`http://localhost:8080${imgPath}`}
              alt={`img-${index}`}
              style={{
                width: "calc(25% - 10px)",
                height: 120,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
      </Modal>

      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img
          alt="preview"
          style={{ width: "100%" }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default BuildingPage;
