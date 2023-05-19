const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder based on the customer ID
    const customerId = req.params.Id_customer;
    const uploadPath = path.join(__dirname, "..", "uploads", "avatars", customerId);
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the current date and original filename
    const date = new Date().toISOString().replace(/:/g, "-");
    const filename = `${date}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
