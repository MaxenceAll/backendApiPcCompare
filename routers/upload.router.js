const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const consolelog = require("../Tools/consolelog");

// Parse JSON and urlencoded request bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Set up Multer middleware for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let userId = req.currentUser.customer.Id_customer || "unknown";
    userId = userId.toString(); // convert userId to string car faut une string pour le path plus tard
    const folderPath = path.join(__dirname, "../uploads/customer", userId);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Serve images from the uploads directory
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads/customer"))
);

// Handle POST requests to /customer/uploads
router.post("/uploads", upload.single("image"), (req, res, next) => {
  consolelog("// ROUTE Upload POST taken !");
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ result: false, message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/
    ${req.currentUser.customer.Id_customer}/${req.file.filename}`;
    // consolelog("yo le imageUrl est : ", imageUrl);
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle GET requests to /uploads/:userId
router.get("/uploads/:userId", (req, res) => {
  consolelog(`// On rentre dans get /uploads/:${req.params.userId}`)
  const userId = req.params.userId;
  const directoryPath = path.join(__dirname, `../uploads/customer/${userId}`);
  let files = [];
  try {
    files = fs.readdirSync(directoryPath);
  } catch (err) {
    console.error(`Error reading directory: ${err}`);
    res.status(500).json({ error: "Error reading directory" });
    return;
  }
  const filePaths = files.map((file) => path.basename(file));

  res.json(filePaths);
});

//TODO PAS VERIFIE:
// Handle DELETE requests to /uploads/:userId/:filename
router.delete("/uploads/:userId/:filename", (req, res) => {
  console.log("ROUTE Upload DELETE taken !");
  const userId = req.params.userId;
  console.log("the user id received is:", userId);
  const filename = req.params.filename;
  console.log("the filename received is:", filename);
  const filePath = path.join(__dirname,`../uploads/customer/${userId}/${filename}`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.sendStatus(204); // No Content
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    console.error(`Error deleting file: ${err}`);
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
