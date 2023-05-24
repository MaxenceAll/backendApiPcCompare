const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const commentsControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/commentsController`);
const commentsController = require(commentsControllerPath);

// From :root/comments to :
router.get('/:Id_customer_to_find', async (req, res ,next) => {
    await commentsController.getAllCommentsByIdCustomer(req, res ,next);
  });
router.put('/', async (req, res ,next) => {
  await commentsController.addComment(req, res ,next);
});
router.delete('/:Id_comment_to_find', async (req, res ,next) => {
  await commentsController.deleteComment(req, res ,next);
});
router.patch('/:Id_comment_to_find', async (req, res ,next) => {
  await commentsController.modifyComment(req, res ,next);
});

module.exports = router;