const express = require('express');
const router = express.Router();
const allRoleDataController = require('../../controllers/api/allRoleDataController');


router.get('/', async (req, res) => {
  await allRoleDataController.selectAll(req, res);
});

module.exports = router;
