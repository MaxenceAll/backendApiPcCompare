const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const carouselControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/carouselController`);
const carouselController = require(carouselControllerPath);

// From :root/carousel to :
router.get('/', async (req, res ,next) => {
  await carouselController.selectAll(req, res ,next);
});

module.exports = router;