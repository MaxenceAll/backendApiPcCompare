const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const loginControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/loginController`);
const loginController = require(loginControllerPath);

// From :root/login to :
router.post('/', async (req, res, next) => {
  await loginController.handleLogin(req, res, next);
});
router.post('/logout', async (req, res, next) => {
  await loginController.handleLogout(req, res, next);
});

module.exports = router;