const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const refreshTokenControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/refreshTokenController`);
const refreshTokenController = require(refreshTokenControllerPath);

// From :root/refresh to :
router.get('/', refreshTokenController.handleRefreshToken);

module.exports = router;