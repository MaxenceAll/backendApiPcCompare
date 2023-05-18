const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const allUsersDataControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/allUsersDataController`);
const allUsersDataController = require(allUsersDataControllerPath);

// From :root/alluserdata to :
router.get('/', async (req, res) => {
  await allUsersDataController.selectAll(req, res);
});

module.exports = router;