const { body, param, query } = require('express-validator');

// Types d'unités valides
const VALID_TYPES = [
  'ESTABLISHMENT',
  'FACULTY',
  'DEPARTMENT',
  'PROGRAM',
  'LEVEL',
  'CLASS',
  'GROUP',
];

// ============ CRÉATION ============

exports.createUnitValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 255 })
    .withMessage('Le nom doit contenir entre 2 et 255 caractères'),

  body('code')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le code doit contenir entre 2 et 50 caractères'),

  body('type')
    .notEmpty()
    .withMessage('Le type est requis')
    .isIn(VALID_TYPES)
    .withMessage(`Type invalide. Types autorisés : ${VALID_TYPES.join(', ')}`),

  body('parentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('parentId doit être un entier positif'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 }),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('displayOrder doit être un entier positif ou nul'),
];

// ============ MISE À JOUR ============

exports.updateUnitValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }),

  body('code')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),

  body('type')
    .optional()
    .isIn(VALID_TYPES)
    .withMessage(`Type invalide`),

  body('parentId')
    .optional({ nullable: true })
    .isInt({ min: 1 }),

  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 }),

  body('displayOrder')
    .optional()
    .isInt({ min: 0 }),

  body('isActive')
    .optional()
    .isBoolean(),
];

// ============ DÉPLACEMENT ============

exports.moveUnitValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('parentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('parentId doit être un entier positif'),
];

// ============ PARAM ID ============

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

// ============ QUERY FILTRES ============

exports.listUnitsValidator = [
  query('type').optional().isIn(VALID_TYPES),
  query('parentId').optional().isInt({ min: 1 }),
  query('isActive').optional().isBoolean(),
];