const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const avatarControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/avatarController`);
const avatarController = require(avatarControllerPath);

const upload = require("../../../middleware/multerSetup");

// From :root/avatar to :
router.post("/upload/:Id_customer", upload.single("avatar"), async(req, res , next) => {
    await avatarController.uploadAvatarByIdCustomer(req, res , next);
  });  
router.get("/download/:Id_customer", async(req, res , next) => {
    await avatarController.downloadAvatarByIdCustomer(req, res , next);
  });  
router.delete("/delete/:Id_customer", upload.single("avatar"), async(req, res , next) => {
    await avatarController.removeAvatarByIdCustomer(req, res , next);
  });
  

module.exports = router;