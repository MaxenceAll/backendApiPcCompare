const express = require('express');
const router = express.Router();
const config = require("../../config/config");
const contactLimiter = require('../../Tools/contactLimiter');
const aboutControllerPath = require.resolve(`../../controllers/${config.API.VERSION}/aboutController.js`);
const aboutController = require(aboutControllerPath);

// From :root/about to :
router.post('/contactme', contactLimiter ,  async (req, res) => {
  await aboutController.contactMe(req, res);
});

module.exports = router;