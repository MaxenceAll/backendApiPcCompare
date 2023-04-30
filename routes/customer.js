const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');


router.get('/', async (req, res) => {
  await customerController.selectAllCustomer(req, res);
});

module.exports = router;
