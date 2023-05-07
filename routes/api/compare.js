const express = require('express');
const router = express.Router();
const compareController = require('../../controllers/api/compareController');


router.get('/gpu', async (req, res) => {
  await compareController.selectAllgpu(req, res);
});

module.exports = router;
