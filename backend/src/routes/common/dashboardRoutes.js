const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/common/dashboardController');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.get('/stats', requireAuth, dashboardController.getStats);

module.exports = router;