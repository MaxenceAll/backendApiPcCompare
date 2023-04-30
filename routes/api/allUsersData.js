const express = require('express');
const router = express.Router();
const allUsersDataController = require('../../controllers/api/allUsersDataController');


router.get('/', async (req, res) => {
  await allUsersDataController.selectAll(req, res);
});

module.exports = router;
