const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', async (req, res) => {
  await authController.handleAuth(req, res);
});

module.exports = router;
