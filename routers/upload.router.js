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
    const folderPath = path.join(__dirname, "../customer/uploads", userId);
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
  express.static(path.join(__dirname, "../customer/uploads"))
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
  const directoryPath = path.join(__dirname, `../customer/uploads/${userId}`);
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

// Handle GET requests to /uploads/:userId/:filename
// router.get("/uploads/:userId/:filename", (req, res) => {
//   const userId = req.params.userId;
//   const filename = req.params.filename;
//   const imagePath = path.join(
//     __dirname,
//     `../customer/uploads/${userId}/${filename}`
//   );

//   fs.readFile(imagePath, (err, data) => {
//     if (err) {
//       console.error(`Error reading image file: ${err}`);
//       res.status(500).json({ error: "Error reading image file" });
//       return;
//     }

//     const extname = path.extname(filename);
//     let contentType = "image/jpeg";

//     if (extname === ".png") {
//       contentType = "image/png";
//     } else if (extname === ".gif") {
//       contentType = "image/gif";
//     }

//     res.setHeader("Content-Type", contentType);
//     res.send(data);
//   });
// });

// Other get route :
// router.get('/uploads/:userId/:filename', (req, res) => {
//   consolelog("// Route GET : '/uploads/:userId/:filename' ")
//   const userId = req.params.userId;
//   const filename = req.params.filename;
//   const filePath = path.join(__dirname, `../customer/uploads/${userId}/${filename}`);

//   consolelog("yo le userId:",userId);
//   consolelog("yo le filename:",filename);
//   consolelog("yo le filePath:",filePath);

//   const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:5174',
//   ];

//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }

//   // Set the response headers to indicate that the response contains an image
//   res.setHeader('Content-Type', 'image/png');
//   res.setHeader('Content-Disposition', `inline; filename=${filename}`);

//   // Send the image data as a binary stream
//   const readStream = fs.createReadStream(filePath);
//   readStream.on('error', (err) => {
//     console.error(`Error reading file: ${err}`);
//     res.status(500).json({ error: 'Error reading file' });
//   });
//   readStream.pipe(res);
// });

// Handle DELETE requests to /uploads/:userId/:filename
router.delete("/uploads/:userId/:filename", (req, res) => {
  console.log("ROUTE Upload DELETE taken !");
  const userId = req.params.userId;
  console.log("the user id received is:", userId);
  const filename = req.params.filename;
  console.log("the filename received is:", filename);
  const filePath = path.join(
    __dirname,
    `../customer/uploads/${userId}/${filename}`
  );
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
