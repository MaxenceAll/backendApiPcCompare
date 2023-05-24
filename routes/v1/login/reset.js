const express = require("express");
const router = express.Router();
const config = require("../../../config/config")
const resetControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/resetController`);
const resetController = require(resetControllerPath);

// From :root/reset to :
router.post("/", async (req, res, next) => {
  await resetController.resetPassword(req, res, next);
});
router.post("/newpassword", async (req, res, next) => {
  await resetController.newPassword(req, res, next);
});

module.exports = router;