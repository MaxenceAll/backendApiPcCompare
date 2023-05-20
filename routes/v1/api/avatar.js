const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const avatarControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/avatarController`);
const avatarController = require(avatarControllerPath);

const upload = require("../../../middleware/multerSetup");
const consolelog = require('../../../Tools/consolelog');

// From :root/avatar to :
router.post("/upload/:Id_customer", upload.single("avatar"), async(req, res) => {
    await avatarController.uploadAvatarByIdCustomer(req, res);
  });  
router.get("/download/:Id_customer", async(req, res) => {
    await avatarController.downloadAvatarByIdCustomer(req, res);
  });  
router.delete("/delete/:Id_customer", upload.single("avatar"), async(req, res) => {
    await avatarController.removeAvatarByIdCustomer(req, res);
  });
  

module.exports = router;