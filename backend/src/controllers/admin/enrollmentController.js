const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const enrollmentService = require('../../services/admin/enrollmentService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.listEnrollments = [
  validate,
  catchAsync(async (req, res) => {
    const result = await enrollmentService.getAllEnrollments(req.query);
    res.json({
      status: 'success',
      data: result.enrollments,
      pagination: result.pagination,
    });
  }),
];

exports.getEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.getEnrollmentById(
      parseInt(req.params.id)
    );
    res.json({ status: 'success', data: enrollment });
  }),
];

exports.getStats = catchAsync(async (req, res) => {
  const stats = await enrollmentService.getEnrollmentStats(req.query.academicYear);
  res.json({ status: 'success', data: stats });
});

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

/**
 * Créer une inscription (route publique — depuis le formulaire en ligne)
 */
exports.createEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.createEnrollment(req.body, null);
    res.status(201).json({
      status: 'success',
      data: {
        reference: enrollment.reference,
        status: enrollment.status,
        message: 'Votre demande a été enregistrée. Vous serez contacté par email.',
      },
    });
  }),
];

/**
 * Créer une inscription (route admin — création directe)
 */
exports.createEnrollmentAdmin = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.createEnrollment(
      req.body,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: enrollment });
  }),
];

// ═══════════════════════════════════════════════════════════
// VALIDATION / REJET
// ═══════════════════════════════════════════════════════════

exports.approveEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.approveEnrollment(
      parseInt(req.params.id),  // 1er argument : id
      req.body,                 // 2ème argument : data (les infos du formulaire)
      req.user.id               // 3ème argument : userId (l'admin qui valide)
    );
    res.json({ status: 'success', data: enrollment });
  }),
];

exports.rejectEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.rejectEnrollment(
      parseInt(req.params.id),
      req.user.id,
      req.body.reason
    );
    res.json({ status: 'success', data: enrollment });
  }),
];

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE FACTURES
// ═══════════════════════════════════════════════════════════

exports.generateInvoices = [
  validate,
  catchAsync(async (req, res) => {
    const invoices = await enrollmentService.generateInvoicesForEnrollment(
      parseInt(req.params.id)
    );
    res.json({
      status: 'success',
      data: {
        count: invoices?.length || 0,
        message: `${invoices?.length || 0} facture(s) générée(s)`,
      },
    });
  }),
];

// ═══════════════════════════════════════════════════════════
// LIAISON ÉTUDIANT
// ═══════════════════════════════════════════════════════════

exports.linkStudent = [
  validate,
  catchAsync(async (req, res) => {
    const result = await enrollmentService.linkStudentToEnrollment(
      parseInt(req.params.id),
      parseInt(req.body.studentId)
    );
    res.json({ status: 'success', data: result });
  }),
];


exports.deleteEnrollment = catchAsync(async (req, res) => {
  const result = await enrollmentService.deleteEnrollment(req.params.id);
  res.json({ status: 'success', data: result });
});