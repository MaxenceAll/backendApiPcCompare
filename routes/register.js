const express = require('express');
const router = express.Router();

const registerController = require('../controllers/registerController');



router.post('/', async (req, res) => {
    await registerController.sendVerifMail(req,res);
})

router.get('/verify', async (req, res) => {
    await registerController.verifySentMail(req, res);
  });

module.exports = router;
