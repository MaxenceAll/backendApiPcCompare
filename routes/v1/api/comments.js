const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const commentsControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/commentsController`);
const commentsController = require(commentsControllerPath);

// From :root/comments to :
router.put('/add', async (req, res) => {
  await commentsController.addComment(req, res);
});
router.delete('/remove/:Id_comment_to_find', async (req, res) => {
  await commentsController.deleteComment(req, res);
});

module.exports = router;