const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const registerController = require('../controllers/registerController');

router.get('/', async (req, res) => {
  await accountController.selectAll(req, res);
});

router.post('/register', async (req, res) => {
    await registerController.sendVerifMail(req,res);
})

router.get('/register/verify', async (req, res) => {
    await registerController.verifySentMail(req, res);
  });

module.exports = router;
