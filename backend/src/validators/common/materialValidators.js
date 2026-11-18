const { body, param, query } = require('express-validator');

const VISIBILITIES = ['STUDENTS', 'TEACHERS', 'ALL', 'PRIVATE'];
const DURATION_UNITS = ['days', 'weeks', 'months', 'years', 'never'];

// ═══════════════════════════════════════════════════════════
// UPLOAD
// ═══════════════════════════════════════════════════════════

exports.uploadMaterialValidator = [
  body('courseId').isInt({ min: 1 }).withMessage('courseId requis'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('visibility').optional().isIn(VISIBILITIES),
  body('durationValue').optional().isInt({ min: 1, max: 999 }),
  body('durationUnit').optional().isIn(DURATION_UNITS),
];

// ═══════════════════════════════════════════════════════════
// PARAMS
// ═══════════════════════════════════════════════════════════

exports.courseIdParamValidator = [
  param('courseId').isInt({ min: 1 }).withMessage('courseId invalide'),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

// ═══════════════════════════════════════════════════════════
// PROLONGATION
// ═══════════════════════════════════════════════════════════

exports.extendMaterialValidator = [
  param('id').isInt({ min: 1 }),
  body('durationValue').isInt({ min: 1, max: 999 }),
  body('durationUnit').isIn(DURATION_UNITS),
];