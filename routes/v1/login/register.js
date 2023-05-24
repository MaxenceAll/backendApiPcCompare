const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const registerControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/login/registerController`);
const registerController = require(registerControllerPath);

// From :root/register to :
router.post('/', async (req, res,next) => {
    await registerController.sendVerifMail(req,res,next);
})
router.get('/verify', async (req, res,next) => {
    await registerController.verifySentMail(req, res,next);
  });  
router.post('/pseudo', async (req, res,next) => {
    await registerController.verifyPseudoAvailable(req, res,next);
  });

module.exports = router; 