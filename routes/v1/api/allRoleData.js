const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const allRoleDataControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/allRoleDataController`);
const allRoleDataController = require(allRoleDataControllerPath);

// From :root/allroledata to :
router.get('/', async (req, res, next) => {
  await allRoleDataController.selectAll(req, res, next);
});

module.exports = router;
