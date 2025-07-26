const fs = require('fs');
const path = require('path');
const buildingService = require('../services/buildingService');

const buildingController = {
  // Tạo mới tòa nhà
  create: async (req, res) => {
    try {
      const imagePaths = req.files?.map(file => `/uploads/buildings/${file.filename}`) || [];

      const buildingData = {
        ...req.body,
        images: imagePaths
      };

      const building = await buildingService.createBuilding(buildingData);

      if (!building || !building._id) {
        return res.status(400).json({ message: "Tạo tòa nhà thất bại" });
      }

      res.status(201).json(building);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy tất cả tòa nhà
  getAll: async (req, res) => {
    try {
      const buildings = await buildingService.getAllBuildings();
      res.status(200).json(buildings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy tòa nhà theo ID
  getById: async (req, res) => {
    try {
      const building = await buildingService.getBuildingById(req.params.id);
      if (!building) return res.status(404).json({ message: 'Building not found' });

      res.status(200).json(building);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật tòa nhà và xử lý xóa ảnh
  update: async (req, res) => {
    try {
      const id = req.params.id;

      const newImagePaths = req.files?.map(file => `/uploads/buildings/${file.filename}`) || [];
      const existingImages = JSON.parse(req.body.existingImages || '[]');
      const deletedImages = JSON.parse(req.body.deletedImages || '[]');

      // Xóa ảnh cũ khỏi thư mục public
      for (const imagePath of deletedImages) {
        const fullPath = path.join(__dirname, '../public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      // Lấy thông tin tòa nhà
      const existingBuilding = await buildingService.getBuildingById(id);
      if (!existingBuilding) {
        return res.status(404).json({ message: "Building not found" });
      }

      const finalImages = [...existingImages, ...newImagePaths];

      const updatedData = {
        ...req.body,
        images: finalImages
      };

      const updated = await buildingService.updateBuilding(id, updatedData);

      if (!updated) {
        return res.status(404).json({ message: "Update failed. Building not found." });
      }

      res.status(200).json(updated);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa tòa nhà
  delete: async (req, res) => {
    const { id } = req.params;
    const { deleteCode } = req.body; // nhận mã xác thực

    const data = await buildingService.deleteBuilding(id, deleteCode);
    if (data.EC === 0) {
      return res.status(200).json(data);
    } else if (data.EC === 1) {
      return res.status(403).json(data); // mã xác thực sai
    } else if (data.EC === 2) {
      return res.status(404).json(data); // không tìm thấy user
    } else {
      return res.status(500).json(data);
  }
  },

  // Doanh thu theo tòa nhà
  getRevenue: async (req, res) => {
    try {
      const data = await buildingService.getBuildingsWithRevenue();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
};

module.exports = buildingController;
