const multer = require("multer");

const storage = multer.memoryStorage();

const allowedTypes = [
  "application/pdf",

  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, image, Word, and PowerPoint files are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;