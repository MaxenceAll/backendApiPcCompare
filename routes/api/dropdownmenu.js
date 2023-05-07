const express = require('express');
const router = express.Router();
const dropdownController = require('../../controllers/api/dropdownmenuController');


router.get('/', async (req, res) => {
  await dropdownController.selectAll(req, res);
});

module.exports = router;
