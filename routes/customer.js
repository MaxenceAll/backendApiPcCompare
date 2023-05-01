const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');


router.get('/', async (req, res) => {
  await customerController.selectAllCustomer(req, res);
});
router.get('/:Id_customer', async (req, res) => {
  await customerController.selectOneCustomer(req, res);
});

router.put('/:Id_customer', async (req, res) => {
  await customerController.modifyCustomer(req, res);
});



module.exports = router;
