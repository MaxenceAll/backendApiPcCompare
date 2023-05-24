const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const compareControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/compareController`);
const compareController = require(compareControllerPath);

// From :root/compare to :
// SHOULD NO LONGER BE USED:
router.get('/gpu', async (req, res, next) => {
  await compareController.selectAllgpu(req, res, next);
});
// SHOULD NO LONGER BE USED:
router.get('/cpu', async (req, res, next) => {
  await compareController.selectAllcpu(req, res, next);
});
// SHOULD NO LONGER BE USED:
router.get('/mb', async (req, res, next) => {
  await compareController.selectAllmb(req, res, next);
});
// SHOULD NO LONGER BE USED:
router.get('/ram', async (req, res, next) => {
  await compareController.selectAllram(req, res, next);
});
// TODO Ca bug depuis l'ajout des notes en sql :(
router.get('/:category', async (req, res, next) => {
  await compareController.selectAllArticleByCategory(req, res, next);
});
router.get('/product/:Category_to_find/:Id_article_to_find', async (req, res, next) => {
  await compareController.selectOneArticle(req, res, next);
});
router.get('/sha/:Id_article_to_find', async (req, res, next) => {
  await compareController.shaForOneArticle(req, res, next);
});
router.get('/seller/:Id_article_to_find', async (req, res, next) => {
  await compareController.sellerForOneArticle(req, res, next);
});
router.get('/historique/:Id_article_to_find', async (req, res, next) => {
  await compareController.historiqueForOneArticle(req, res, next);
});
router.get('/historique/:Id_article/:Id_seller', async (req, res, next) => {
  await compareController.selectHistoriqueByIdArticleAndIdSeller(req, res, next);
});
router.get('/comments/:Id_article', async (req, res, next) => {
  await compareController.selectCommentsByIdArticle(req, res, next);
});
router.get('/comments/avatar/:Id_comment', async (req, res, next) => {
  await compareController.selectAvatarByIdComment(req, res, next);
});

module.exports = router;