const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', async (req, res) => {
  await loginController.handleLogin(req, res);
});

module.exports = router;
