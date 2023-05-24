const express = require('express');
const router = express.Router();
const config = require("../../config/config")
const accountControllerPath = require.resolve(`../../controllers/${config.API.VERSION}/accountController.js`);
const accountController = require(accountControllerPath);

// From :root/account to :
router.get('/', async (req, res, next) => {
  await accountController.selectAllAccount(req, res, next);
});

module.exports = router;