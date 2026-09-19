const multer = require("multer");
const { propertyStorage, avatarStorage } = require("../config/cloudinary");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const uploadPropertyImages = multer({
  storage: propertyStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
});

module.exports = { uploadPropertyImages, uploadAvatar };
