const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const authControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/authController`);
const authController = require(authControllerPath);

// From :root/auth to :
router.get('/', async (req, res, next) => {
  await authController.handleAuth(req, res, next);
});

module.exports = router;