const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/admin/financeController');
const exportController = require('../../controllers/admin/exportController');
const paymentGatewayController = require('../../controllers/admin/paymentGatewayController');
const {
  idParamValidator,
  studentIdParamValidator,
  invoiceIdParamValidator,
  listFeeTypesValidator,
  createFeeTypeValidator,
  updateFeeTypeValidator,
  listFeesValidator,
  createFeeValidator,
  updateFeeValidator,
  listInvoicesValidator,
  createInvoiceValidator,
  updateInvoiceValidator,
  bulkGenerateValidator,
  overdueValidator,
  listPaymentsValidator,
  createPaymentValidator,
  listRemindersValidator,
  createReminderValidator,
} = require('../../validators/admin/financeValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Rôles autorisés : ADMIN + ACCOUNTANT
const financeRoles = requireRole('ADMIN', 'ACCOUNTANT');

// ═══════════════════════════════════════════════════════════
// TYPES DE FRAIS
// ═══════════════════════════════════════════════════════════

router.get('/fee-types', financeRoles, listFeeTypesValidator, financeController.listFeeTypes);
router.get('/fee-types/:id', financeRoles, idParamValidator, financeController.getFeeType);
router.post('/fee-types', financeRoles, createFeeTypeValidator, financeController.createFeeType);
router.put('/fee-types/:id', financeRoles, updateFeeTypeValidator, financeController.updateFeeType);
router.delete('/fee-types/:id', requireRole('ADMIN'), idParamValidator, financeController.deleteFeeType);

// ═══════════════════════════════════════════════════════════
// FRAIS
// ═══════════════════════════════════════════════════════════

router.get('/fees/stats', financeRoles, financeController.getFeeStats);
router.get('/fees', financeRoles, listFeesValidator, financeController.listFees);
router.get('/fees/:id', financeRoles, idParamValidator, financeController.getFee);
router.post('/fees', financeRoles, createFeeValidator, financeController.createFee);
router.put('/fees/:id', financeRoles, updateFeeValidator, financeController.updateFee);
router.delete('/fees/:id', requireRole('ADMIN'), idParamValidator, financeController.deleteFee);

// ═══════════════════════════════════════════════════════════
// FACTURES
// ═══════════════════════════════════════════════════════════

router.get('/invoices/stats', financeRoles, financeController.getInvoiceStats);
router.get('/invoices/overdue', financeRoles, overdueValidator, financeController.getOverdueInvoices);
router.get('/invoices', financeRoles, listInvoicesValidator, financeController.listInvoices);
router.get('/invoices/:id', financeRoles, idParamValidator, financeController.getInvoice);
router.post('/invoices', financeRoles, createInvoiceValidator, financeController.createInvoice);
router.put('/invoices/:id', financeRoles, updateInvoiceValidator, financeController.updateInvoice);
router.delete('/invoices/:id', requireRole('ADMIN'), idParamValidator, financeController.deleteInvoice);
router.post('/invoices/bulk-generate', financeRoles, bulkGenerateValidator, financeController.bulkGenerateInvoices);

// Factures d'un étudiant (accessible par l'étudiant lui-même, l'admin, ou le comptable)
router.get('/invoices/student/:studentId', studentIdParamValidator, financeController.getStudentInvoices);

// ═══════════════════════════════════════════════════════════
// PAIEMENTS
// ═══════════════════════════════════════════════════════════

router.get('/payments/stats', financeRoles, financeController.getPaymentStats);
router.get('/payments', financeRoles, listPaymentsValidator, financeController.listPayments);
router.get('/payments/:id', financeRoles, idParamValidator, financeController.getPayment);
router.post('/payments', financeRoles, createPaymentValidator, financeController.createPayment);
router.post('/payments/:id/cancel', financeRoles, idParamValidator, financeController.cancelPayment);

// Paiements d'un étudiant
router.get('/payments/student/:studentId', studentIdParamValidator, financeController.getStudentPayments);

// ═══════════════════════════════════════════════════════════
// RAPPELS
// ═══════════════════════════════════════════════════════════

router.get('/reminders', financeRoles, listRemindersValidator, financeController.listReminders);
router.post(
  '/reminders/invoice/:invoiceId',
  financeRoles,
  createReminderValidator,
  financeController.createReminder
);
router.post('/reminders/:id/send', financeRoles, idParamValidator, financeController.sendReminder);
router.post('/reminders/send-automatic', requireRole('ADMIN'), financeController.sendAutomaticReminders);

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

router.get('/exports/overdue/excel', financeRoles, exportController.exportOverdueExcel);
router.get('/exports/overdue/pdf', financeRoles, exportController.exportOverduePDF);
router.get('/exports/payments/excel', financeRoles, exportController.exportPaymentsExcel);

// ═══════════════════════════════════════════════════════════
// PAIEMENT EN LIGNE
// ═══════════════════════════════════════════════════════════

router.post('/payments/stripe/checkout', requireAuth, paymentGatewayController.stripeCheckout);
router.post('/payments/mobile-money/initiate', requireAuth, paymentGatewayController.mobileMoneyInitiate);
router.post('/payments/mobile-money/:paymentId/confirm', financeRoles, paymentGatewayController.mobileMoneyConfirm);

// ═══════════════════════════════════════════════════════════
// PAIEMENT MULTIPLE + REÇU
// ═══════════════════════════════════════════════════════════

router.post(
  '/payments/bulk',
  financeRoles,
  financeController.createBulkPayments
);

router.get(
  '/receipts/:reference/pdf',
  financeRoles,
  financeController.downloadReceipt
);

module.exports = router;