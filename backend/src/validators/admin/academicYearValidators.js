const { body, param, query } = require('express-validator');

const STATUSES = ['PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED'];

exports.listValidator = [
  query('status').optional().isIn(STATUSES),
  query('search').optional().isString(),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.createValidator = [
  body('label')
    .trim()
    .notEmpty().withMessage('Le libellé est requis')
    .matches(/^\d{4}-\d{4}$/).withMessage('Format attendu : 2025-2026'),
  body('startDate').notEmpty().isISO8601().withMessage('Date de début requise'),
  body('endDate').notEmpty().isISO8601().withMessage('Date de fin requise'),
  body('status').optional().isIn(STATUSES),
  body('description').optional({ nullable: true }).isString(),
  body('hasSemesters').optional().isBoolean(),
  body('semester1Start').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('semester1End').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('semester2Start').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('semester2End').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('registrationOpenDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('registrationCloseDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('reenrollmentDeadline').optional({ nullable: true, checkFalsy: true }).isISO8601(),
];

exports.updateValidator = [
  param('id').isInt({ min: 1 }),
  body('label').optional().matches(/^\d{4}-\d{4}$/),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(STATUSES),
  body('description').optional({ nullable: true }).isString(),
  body('hasSemesters').optional().isBoolean(),
];

exports.duplicateValidator = [
  param('id').isInt({ min: 1 }),
  body('newLabel')
    .trim()
    .notEmpty().withMessage('Le nouveau libellé est requis')
    .matches(/^\d{4}-\d{4}$/).withMessage('Format attendu : 2026-2027'),
];