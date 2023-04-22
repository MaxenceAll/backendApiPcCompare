const express = require("express");
const router = express.Router();

const resetController = require("../controllers/resetController");

router.post("/", async (req, res) => {
  await resetController.resetPassword(req, res);
});

router.post("/newpassword", async (req, res) => {
  await resetController.newPassword(req, res);
});







module.exports = router;


