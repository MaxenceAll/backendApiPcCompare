const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const favoriteControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/favoriteController`);
const favoriteController = require(favoriteControllerPath);

// From :root/favorite to :
router.get('/:Id_customer_to_find', async (req, res, next) => {
  await favoriteController.getAllFavoriteByIdCustomer(req, res, next);
});
router.get('/:Id_customer_to_find/:Id_article_to_find', async (req, res, next) => {
  await favoriteController.isFavorited(req, res, next);
});
router.delete('/:Id_customer_to_find', async (req, res, next) => {
  await favoriteController.removeFavoriteByIdCustomer(req, res, next);
});
router.put('/:Id_customer_to_find', async (req, res, next) => {
  await favoriteController.addFavoriteByIdCustomer(req, res, next);
});

module.exports = router;