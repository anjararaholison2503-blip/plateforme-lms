const express = require('express');
const router = express.Router();
const mobileMoneyController = require('../../controllers/admin/mobileMoneyController');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// ═══ ÉTUDIANT UNIQUEMENT ═══
router.post('/pay', requireAuth, requireRole('STUDENT'), mobileMoneyController.createPayment);
router.get('/my-payments', requireAuth, requireRole('STUDENT'), mobileMoneyController.getMyPayments);
router.get('/my-unpaid-invoices', requireAuth, requireRole('STUDENT'), mobileMoneyController.getMyUnpaidInvoices);

module.exports = router;