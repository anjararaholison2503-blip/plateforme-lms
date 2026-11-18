const { body, param, query } = require('express-validator');

const VALID_TYPES = ['COURSE', 'EXAM', 'HOLIDAY', 'MEETING', 'DEADLINE', 'OTHER'];
const VALID_VISIBILITY = ['PUBLIC', 'PRIVATE', 'UNIT'];

exports.createEventValidator = [
  body('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('type').optional().isIn(VALID_TYPES).withMessage('Type invalide'),
  body('visibility').optional().isIn(VALID_VISIBILITY),
  body('startDate').notEmpty().withMessage('La date de début est requise').isISO8601(),
  body('endDate').notEmpty().withMessage('La date de fin est requise').isISO8601(),
  body('allDay').optional().isBoolean(),
  body('location').optional({ nullable: true }).isString().isLength({ max: 255 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Couleur invalide'),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.updateEventValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional({ nullable: true }),
  body('type').optional().isIn(VALID_TYPES),
  body('visibility').optional().isIn(VALID_VISIBILITY),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('allDay').optional().isBoolean(),
  body('location').optional({ nullable: true }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.idParamValidator = [param('id').isInt({ min: 1 })];

exports.listEventsValidator = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isIn(VALID_TYPES),
  query('unitId').optional().isInt({ min: 1 }),
];