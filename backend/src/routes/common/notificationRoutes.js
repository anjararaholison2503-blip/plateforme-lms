const express = require('express');
const router = express.Router();
const catchAsync = require('../../utils/catchAsync');
const notificationService = require('../../services/common/notificationService');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.use(requireAuth);

// Liste des notifications
router.get('/', catchAsync(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user.id, req.query);
  res.json({ status: 'success', data: result });
}));

// Marquer une comme lue
router.patch('/:id/read', catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead(parseInt(req.params.id), req.user.id);
  res.json({ status: 'success', data: result });
}));

// Marquer toutes comme lues
router.patch('/read-all', catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.json({ status: 'success', data: result });
}));

module.exports = router;