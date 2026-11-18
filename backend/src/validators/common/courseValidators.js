const { body, param, query } = require('express-validator');

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'DROPPED', 'PENDING'];

exports.listCoursesValidator = [
  query('status').optional().isIn(STATUSES),
  query('unitId').optional().isInt({ min: 1 }),
  query('teacherId').optional().isInt({ min: 1 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.sessionIdParamValidator = [
  param('sessionId').isInt({ min: 1 }).withMessage('ID session invalide'),
];

exports.enrollmentIdParamValidator = [
  param('enrollmentId').isInt({ min: 1 }).withMessage('ID inscription invalide'),
];

exports.createCourseValidator = [
  body('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 255 }),
  body('code').trim().notEmpty().withMessage('Le code est requis').isLength({ max: 50 }),
  body('description').optional({ nullable: true }).isString(),
  body('credits').optional().isInt({ min: 0 }),
  body('hours').optional().isInt({ min: 0 }),
  body('status').optional().isIn(STATUSES),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Couleur invalide'),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.updateCourseValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('code').optional().trim().isLength({ min: 1, max: 50 }),
  body('description').optional({ nullable: true }),
  body('credits').optional().isInt({ min: 0 }),
  body('hours').optional().isInt({ min: 0 }),
  body('status').optional().isIn(STATUSES),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.createSessionValidator = [
  param('id').isInt({ min: 1 }),
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('code').trim().notEmpty().withMessage('Le code est requis'),
  body('academicYear').trim().notEmpty().withMessage("L'année académique est requise"),
  body('startDate').notEmpty().withMessage('Date de début requise').isISO8601(),
  body('endDate').notEmpty().withMessage('Date de fin requise').isISO8601(),
  body('capacity').optional().isInt({ min: 1, max: 500 }),
  body('description').optional({ nullable: true }),
  body('isActive').optional().isBoolean(),
];

exports.updateSessionValidator = [
  param('sessionId').isInt({ min: 1 }),
  body('name').optional().trim().isLength({ min: 1 }),
  body('code').optional().trim().isLength({ min: 1 }),
  body('academicYear').optional().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('capacity').optional().isInt({ min: 1, max: 500 }),
  body('description').optional({ nullable: true }),
  body('isActive').optional().isBoolean(),
];

exports.addTeacherValidator = [
  param('id').isInt({ min: 1 }),
  body('teacherId').isInt({ min: 1 }).withMessage('teacherId requis'),
  body('role').optional().isIn(['MAIN', 'ASSISTANT']),
];

exports.removeTeacherValidator = [
  param('id').isInt({ min: 1 }),
  param('teacherId').isInt({ min: 1 }),
];

exports.enrollValidator = [
  param('sessionId').isInt({ min: 1 }),
  body('studentId').isInt({ min: 1 }).withMessage('studentId requis'),
];

exports.updateEnrollmentValidator = [
  param('enrollmentId').isInt({ min: 1 }),
  body('status').optional().isIn(ENROLLMENT_STATUSES),
  body('grade').optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body('notes').optional({ nullable: true }).isString(),
];

exports.addClassValidator = [
  param('id').isInt({ min: 1 }),
  body('classId').isInt({ min: 1 }).withMessage('classId requis'),
];

exports.removeClassValidator = [
  param('id').isInt({ min: 1 }),
  param('classId').isInt({ min: 1 }),
];