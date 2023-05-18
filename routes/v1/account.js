const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/accountController');

// From :root/account to :
router.get('/', async (req, res) => {
  await accountController.selectAllAccount(req, res);
});

module.exports = router;