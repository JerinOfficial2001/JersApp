const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload subdirectories exist inside the server directory
const baseDir = path.join(__dirname, "../uploads");
const subDirs = ["profile", "group", "status", "messages"];
subDirs.forEach((dir) => {
  const fullPath = path.join(baseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure local disk storage generator
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(baseDir, folderName);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      // Generate secure unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "") || "file";
      cb(null, `${folderName}-${baseName}-${uniqueSuffix}${ext}`);
    },
  });
};

// File validation logic for security
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = allowedExtensions.test(ext);

  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|quicktime|x-msvideo|x-matroska)/;
  const isMimeAllowed = allowedMimeTypes.test(file.mimetype);

  if (isExtAllowed && isMimeAllowed) {
    return cb(null, true);
  } else {
    cb(new Error("Only image formats (JPEG, JPG, PNG, GIF, WEBP) and video formats (MP4, MOV, AVI, MKV) are allowed!"));
  }
};

const messageFileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|mp3|m4a|wav|aac|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = allowedExtensions.test(ext);
  if (isExtAllowed) {
    return cb(null, true);
  } else {
    cb(new Error("File format not supported!"));
  }
};

const uploadProfile = multer({
  storage: createStorage("profile"),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadGroup = multer({
  storage: createStorage("group"),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadStatus = multer({
  storage: createStorage("status"),
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for statuses
});

const uploadMessageMedia = multer({
  storage: createStorage("messages"),
  fileFilter: messageFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = {
  uploadProfile,
  uploadGroup,
  uploadStatus,
  uploadMessageMedia,
};
