const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Route pour discuter avec l'assistant
router.post('/chat', requireAuth, aiController.chatWithAssistant);

module.exports = router;