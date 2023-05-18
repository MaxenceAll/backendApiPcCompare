const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const favoriteControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/favoriteController`);
const favoriteController = require(favoriteControllerPath);

// From :root/favorite to :
router.get('/:Id_customer_to_find', async (req, res) => {
  await favoriteController.getAllFavoriteByIdCustomer(req, res);
});
router.get('/:Id_customer_to_find/:Id_article_to_find', async (req, res) => {
  await favoriteController.isFavorited(req, res);
});
router.delete('/:Id_customer_to_find', async (req, res) => {
  await favoriteController.removeFavoriteByIdCustomer(req, res);
});
router.put('/:Id_customer_to_find', async (req, res) => {
  await favoriteController.addFavoriteByIdCustomer(req, res);
});

module.exports = router;