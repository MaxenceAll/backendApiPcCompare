const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const dropdownmenuControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/dropdownmenuController`);
const dropdownmenuController = require(dropdownmenuControllerPath);

// From :root/dropdownmenu to :
router.get('/', async (req, res) => {
  await dropdownmenuController.selectAll(req, res);
});

module.exports = router;