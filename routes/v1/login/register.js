const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const registerControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/registerController`);
const registerController = require(registerControllerPath);

// From :root/register to :
router.post('/', async (req, res) => {
    await registerController.sendVerifMail(req,res);
})
router.get('/verify', async (req, res) => {
    await registerController.verifySentMail(req, res);
  });  
router.post('/pseudo', async (req, res) => {
    await registerController.verifyPseudoAvailable(req, res);
  });

module.exports = router;