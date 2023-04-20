const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', async (req, res) => {
  await loginController.loginUser(req, res);
});

router.post('/refresh', async (req, res) => {
  await loginController.refreshToken(req, res);
});




module.exports = router;
