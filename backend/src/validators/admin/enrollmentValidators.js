const { body, param, query } = require('express-validator');

const ENROLLMENT_STATUSES = [
  'PENDING_DOCUMENTS',
  'PENDING_REVIEW',
  'PENDING_PAYMENT',
  'ENROLLED',
  'COMPLETED',
  'REPEATED',
  'FAILED',
  'WITHDRAWN',
  'CANCELLED',
  'REJECTED',
];

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.listEnrollmentsValidator = [
  query('status').optional().isIn(ENROLLMENT_STATUSES),
  query('academicYear').optional().isString(),
  query('studentId').optional().isInt({ min: 1 }),
  query('isReenrollment').optional().isBoolean(),
  query('isRepeating').optional().isBoolean(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

// ═══════════════════════════════════════════════════════════
// CRÉATION (formulaire en ligne)
// ═══════════════════════════════════════════════════════════

exports.createEnrollmentValidator = [
  body('applicantEmail')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('applicantName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 255 }),
  body('personalInfo')
    .isObject()
    .withMessage('Les informations personnelles sont requises'),
  body('personalInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis'),
  body('personalInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom de famille est requis'),
  body('personalInfo.birthDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Date de naissance invalide'),
  body('contactInfo')
    .isObject()
    .withMessage('Les informations de contact sont requises'),
  body('contactInfo.phone')
    .optional({ nullable: true })
    .isString(),
  body('contactInfo.address')
    .optional({ nullable: true })
    .isString(),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('L\'année académique est requise'),
  body('desiredClassId')
    .optional({ nullable: true })
    .isInt({ min: 1 }),
  body('desiredProgramId')
    .optional({ nullable: true })
    .isInt({ min: 1 }),
];

// ═══════════════════════════════════════════════════════════
// VALIDATION ADMIN
// ═══════════════════════════════════════════════════════════

exports.approveEnrollmentValidator = [
  param('id').isInt({ min: 1 }),
  body('reviewNotes')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 }),
  body('desiredClassId')
    .optional({ nullable: true })
    .isInt({ min: 1 }),
];

exports.rejectEnrollmentValidator = [
  param('id').isInt({ min: 1 }),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La raison du rejet est requise')
    .isLength({ min: 5, max: 2000 }),
];

// ═══════════════════════════════════════════════════════════
// LIAISON ÉTUDIANT
// ═══════════════════════════════════════════════════════════

exports.linkStudentValidator = [
  param('id').isInt({ min: 1 }),
  body('studentId').isInt({ min: 1 }).withMessage('studentId requis'),
];