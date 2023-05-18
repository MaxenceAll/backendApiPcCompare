const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const compareControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/compareController`);
const compareController = require(compareControllerPath);

// From :root/compare to :
// SHOULD NO LONGER BE USED:
router.get('/gpu', async (req, res) => {
  await compareController.selectAllgpu(req, res);
});
// SHOULD NO LONGER BE USED:
router.get('/cpu', async (req, res) => {
  await compareController.selectAllcpu(req, res);
});
// SHOULD NO LONGER BE USED:
router.get('/mb', async (req, res) => {
  await compareController.selectAllmb(req, res);
});
// SHOULD NO LONGER BE USED:
router.get('/ram', async (req, res) => {
  await compareController.selectAllram(req, res);
});
// TODO Ca bug depuis l'ajout des notes en sql :(
router.get('/:category', async (req, res) => {
  await compareController.selectAllArticleByCategory(req, res);
});
router.get('/product/:Category_to_find/:Id_article_to_find', async (req, res) => {
  await compareController.selectOneArticle(req, res);
});
router.get('/sha/:Id_article_to_find', async (req, res) => {
  await compareController.shaForOneArticle(req, res);
});
router.get('/seller/:Id_article_to_find', async (req, res) => {
  await compareController.sellerForOneArticle(req, res);
});
router.get('/historique/:Id_article_to_find', async (req, res) => {
  await compareController.historiqueForOneArticle(req, res);
});
router.get('/historique/:Id_article/:Id_seller', async (req, res) => {
  await compareController.selectHistoriqueByIdArticleAndIdSeller(req, res);
});
router.get('/comments/:Id_article', async (req, res) => {
  await compareController.selectCommentsByIdArticle(req, res);
});
router.get('/comments/avatar/:Id_comment', async (req, res) => {
  await compareController.selectAvatarByIdComment(req, res);
});

module.exports = router;