const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const hotdir = path.resolve(__dirname, "hotdir");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, hotdir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use original file name
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({ success: true, filename: req.file.filename, originalname: req.file.originalname });
});

module.exports = router;