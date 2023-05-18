const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const loginControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/loginController`);
const loginController = require(loginControllerPath);

// From :root/login to :
router.post('/', async (req, res) => {
  await loginController.handleLogin(req, res);
});
router.post('/logout', async (req, res) => {
  await loginController.handleLogout(req, res);
});

module.exports = router;