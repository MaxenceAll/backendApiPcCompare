const express = require('express');
const router = express.Router();
const compareController = require('../../controllers/api/compareController');


router.get('/gpu', async (req, res) => {
  await compareController.selectAllgpu(req, res);
});
router.get('/product/:Id_article_to_find', async (req, res) => {
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





module.exports = router;
