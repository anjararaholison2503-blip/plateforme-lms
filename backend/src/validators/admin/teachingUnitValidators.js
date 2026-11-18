const { body, param, query } = require('express-validator');

const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
const COURSE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

// ═══════════════════════════════════════════════════════════
// CRUD UE
// ═══════════════════════════════════════════════════════════

exports.listUnitsValidator = [
  query('semester').optional().isIn(SEMESTERS),
  query('unitId').optional().isInt({ min: 1 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.createUnitValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Le code est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le code doit contenir entre 2 et 50 caractères')
    .matches(/^[A-Z0-9\-_]+$/i)
    .withMessage('Le code doit contenir uniquement des lettres, chiffres, tirets et underscores'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('semester').optional({ nullable: true }).isIn(SEMESTERS).withMessage('Semestre invalide'),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.updateUnitValidator = [
  param('id').isInt({ min: 1 }),
  body('code').optional().trim().isLength({ min: 2, max: 50 }),
  body('name').optional().trim().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('semester').optional({ nullable: true }).isIn(SEMESTERS),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

// ═══════════════════════════════════════════════════════════
// GESTION DES MATIÈRES
// ═══════════════════════════════════════════════════════════

exports.addCourseValidator = [
  param('id').isInt({ min: 1 }),
  body('courseId').isInt({ min: 1 }).withMessage('courseId requis'),
  body('coefficient').optional().isInt({ min: 1, max: 10 }),
];

exports.removeCourseValidator = [
  param('id').isInt({ min: 1 }),
  param('courseId').isInt({ min: 1 }),
];

exports.createCourseInUnitValidator = [
  param('id').isInt({ min: 1 }),
  body('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 255 }),
  body('code').trim().notEmpty().withMessage('Le code est requis').isLength({ max: 50 }),
  body('description').optional({ nullable: true }).isString(),
  body('credits').optional().isInt({ min: 0 }),
  body('hours').optional().isInt({ min: 0 }),
  body('coefficient').optional().isInt({ min: 1, max: 10 }),
  body('status').optional().isIn(COURSE_STATUSES),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

// ═══════════════════════════════════════════════════════════
// GESTION DES CLASSES
// ═══════════════════════════════════════════════════════════

exports.assignClassesValidator = [
  param('id').isInt({ min: 1 }),
  body('classIds')
    .isArray({ min: 1 })
    .withMessage('classIds doit être un tableau avec au moins un élément'),
  body('classIds.*').isInt({ min: 1 }),
];

exports.removeClassValidator = [
  param('id').isInt({ min: 1 }),
  param('classId').isInt({ min: 1 }),
];