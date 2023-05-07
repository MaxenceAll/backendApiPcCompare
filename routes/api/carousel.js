const express = require('express');
const router = express.Router();
const carouselController = require('../../controllers/api/carouselController');


router.get('/', async (req, res) => {
  await carouselController.selectAll(req, res);
});

module.exports = router;
