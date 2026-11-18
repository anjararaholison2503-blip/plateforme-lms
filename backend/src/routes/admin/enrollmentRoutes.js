const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/admin/enrollmentController');
const {
  listEnrollmentsValidator,
  idParamValidator,
  createEnrollmentValidator,
  approveEnrollmentValidator,
  rejectEnrollmentValidator,
  linkStudentValidator,
} = require('../../validators/admin/enrollmentValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// ═══════════════════════════════════════════════════════════
// ROUTE PUBLIQUE — INSCRIPTION EN LIGNE
// ═══════════════════════════════════════════════════════════

router.post(
  '/public',
  createEnrollmentValidator,
  enrollmentController.createEnrollment
);

// ═══════════════════════════════════════════════════════════
// ROUTES PROTÉGÉES (ADMIN)
// ═══════════════════════════════════════════════════════════

router.use(requireAuth);

// Statistiques
router.get('/stats', requireRole('ADMIN'), enrollmentController.getStats);

// Liste
router.get(
  '/',
  requireRole('ADMIN'),
  listEnrollmentsValidator,
  enrollmentController.listEnrollments
);

// Détails
router.get(
  '/:id',
  requireRole('ADMIN'),
  idParamValidator,
  enrollmentController.getEnrollment
);

// Création par admin
router.post(
  '/',
  requireRole('ADMIN'),
  createEnrollmentValidator,
  enrollmentController.createEnrollmentAdmin
);

// Validation / Rejet
router.post(
  '/:id/approve',
  requireRole('ADMIN'),
  approveEnrollmentValidator,
  enrollmentController.approveEnrollment
);

router.post(
  '/:id/reject',
  requireRole('ADMIN'),
  rejectEnrollmentValidator,
  enrollmentController.rejectEnrollment
);

// Génération de factures
router.post(
  '/:id/generate-invoices',
  requireRole('ADMIN'),
  idParamValidator,
  enrollmentController.generateInvoices
);

// Liaison étudiant
router.post(
  '/:id/link-student',
  requireRole('ADMIN'),
  linkStudentValidator,
  enrollmentController.linkStudent
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  enrollmentController.deleteEnrollment
);

module.exports = router;