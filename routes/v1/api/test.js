const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const testControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/testController`);
const testController = require(testControllerPath);

// From :root/test to :
router.get('/:Id_article_to_find', async (req, res) => {
    await testController.getAllCommentsByIdCustomer(req, res);
  });

module.exports = router;