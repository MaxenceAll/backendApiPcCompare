const express = require("express");
const router = express.Router();
const config = require("../../../config/config")
const resetControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/resetController`);
const resetController = require(resetControllerPath);

// From :root/reset to :
router.post("/", async (req, res) => {
  await resetController.resetPassword(req, res);
});
router.post("/newpassword", async (req, res) => {
  await resetController.newPassword(req, res);
});

module.exports = router;