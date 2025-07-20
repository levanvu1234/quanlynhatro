const buildingService = require('../services/buildingService');

const buildingController = {
  // Tạo mới tòa nhà
  create: async (req, res) => {
    try {
      const imagePaths = req.files.map(file => `/uploads/buildings/${file.filename}`);
      const buildingData = {
        ...req.body,
        images: imagePaths
      };
      const building = await buildingService.createBuilding(buildingData);
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

  // Lấy tòa nhà theo ID (kèm danh sách phòng)
 getById: async (req, res) => {
  try {
    const building = await buildingService.getBuildingById(req.params.id);
    console.log('Populated rooms:', building.rooms);
    if (!building) return res.status(404).json({ message: 'Building not found' });

    res.json(building); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


  // Cập nhật tòa nhà
  update: async (req, res) => {
  try {
    const imagePaths = req.files?.map(file => `/uploads/buildings/${file.filename}`) || [];

    // Giữ ảnh cũ nếu không gửi ảnh mới
    const existingBuilding = await buildingService.getBuildingById(req.params.id);
    const oldImages = existingBuilding.images || [];

    const updatedData = {
      ...req.body,
      images: imagePaths.length > 0 ? imagePaths : oldImages
    };

    const updated = await buildingService.updateBuilding(req.params.id, updatedData);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


  // Xóa tòa nhà
  delete: async (req, res) => {
    try {
      await buildingService.deleteBuilding(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //  API trả về doanh thu theo tòa nhà và theo tháng
  getRevenue: async (req, res) => {
    try {
      const data = await buildingService.getBuildingsWithRevenue();
      return res.status(200).json(data);
    } catch (err) {
      console.error("Lỗi doanh thu:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
};

module.exports = buildingController;
