const { body, param, query } = require('express-validator');

const STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

exports.courseIdParamValidator = [
  param('courseId').isInt({ min: 1 }).withMessage('courseId invalide'),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.submissionIdParamValidator = [
  param('submissionId').isInt({ min: 1 }),
];

exports.createAssignmentValidator = [
  param('courseId').isInt({ min: 1 }),
  body('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 255 }),
  body('instructions').trim().notEmpty().withMessage('Les instructions sont requises'),
  body('dueDate').notEmpty().isISO8601().withMessage('Date limite invalide'),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }),
  body('status').optional().isIn(STATUSES),
  body('allowLateSubmission').optional().isBoolean(),
  body('allowResubmission').optional().isBoolean(),
  body('attachmentUrl').optional({ nullable: true }).isString(),
  body('attachmentName').optional({ nullable: true }).isString(),
];

exports.updateAssignmentValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 2, max: 255 }),
  body('instructions').optional().trim(),
  body('dueDate').optional().isISO8601(),
  body('maxScore').optional().isInt({ min: 1, max: 1000 }),
  body('status').optional().isIn(STATUSES),
  body('allowLateSubmission').optional().isBoolean(),
  body('allowResubmission').optional().isBoolean(),
];

exports.submitAssignmentValidator = [
  param('id').isInt({ min: 1 }),
  body('content').optional({ nullable: true }).isString(),
  body('fileUrl').optional({ nullable: true }).isString(),
  body('fileName').optional({ nullable: true }).isString(),
  body('fileSize').optional({ nullable: true }).isInt({ min: 0 }),
  body('mimeType').optional({ nullable: true }).isString(),
];

exports.gradeSubmissionValidator = [
  param('submissionId').isInt({ min: 1 }),
  body('score').isFloat({ min: 0 }).withMessage('Note invalide'),
  body('feedback').optional({ nullable: true }).isString().isLength({ max: 5000 }),
];