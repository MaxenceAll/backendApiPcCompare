const express = require('express');
const router = express.Router();
const config = require("../../config/config")
const customerControllerPath = require.resolve(`../../controllers/${config.API.VERSION}/customerController.js`);
const customerController = require(customerControllerPath);

// From :root/customer to :
router.get('/', async (req, res , next) => {
  await customerController.selectAllCustomer(req, res , next);
});
router.get('/:Id_customer', async (req, res , next) => {
  await customerController.selectOneCustomer(req, res , next);
});
router.put('/:Id_customer', async (req, res , next) => {
  await customerController.modifyCustomer(req, res , next);
});

module.exports = router;