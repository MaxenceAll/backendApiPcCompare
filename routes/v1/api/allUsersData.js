const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const allUsersDataControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/allUsersDataController`);
const allUsersDataController = require(allUsersDataControllerPath);

// From :root/alluserdata to :
router.get('/', async (req, res , next) => {
  await allUsersDataController.selectAll(req, res , next);
});

module.exports = router;