const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/api/favoriteController');

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
