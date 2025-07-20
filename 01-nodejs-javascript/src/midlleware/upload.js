const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage cho upload tạm thời khi tạo phòng mới
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = './uploads/temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadTemp = multer({ storage: tempStorage });

// Storage cho upload khi cập nhật phòng (folder riêng từng phòng)
const getRoomStorage = (roomId) => multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./uploads/rooms/${roomId}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
// Upload ảnh cho building
const buildingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./uploads/buildings`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBuildingImages = multer({ storage: buildingStorage });

const uploadForUpdate = (req, res, next) => {
  const roomId = req.params.id;
  if (!roomId) return res.status(400).json({ error: "Missing roomId param" });

  const upload = multer({ storage: getRoomStorage(roomId) });
  const middleware = upload.array('images', 10);

  middleware(req, res, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    next();
  });
};

module.exports = {
  uploadTemp,
  uploadForUpdate,
  uploadBuildingImages
};
