const { body, param } = require('express-validator');

const PRIORITIES = ['NORMAL', 'IMPORTANT', 'URGENT'];

exports.courseIdParamValidator = [
  param('courseId').isInt({ min: 1 }).withMessage('courseId invalide'),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.createAnnouncementValidator = [
  param('courseId').isInt({ min: 1 }),
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 2, max: 255 }),
  body('content')
    .trim()
    .notEmpty().withMessage('Le contenu est requis')
    .isLength({ min: 5 }),
  body('priority').optional().isIn(PRIORITIES).withMessage('Priorité invalide'),
  body('isPinned').optional().isBoolean(),
  body('expiresAt').optional({ nullable: true, checkFalsy: true }).isISO8601(),
];

exports.updateAnnouncementValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 2, max: 255 }),
  body('content').optional().trim().isLength({ min: 5 }),
  body('priority').optional().isIn(PRIORITIES),
  body('isPinned').optional().isBoolean(),
  body('expiresAt').optional({ nullable: true, checkFalsy: true }).isISO8601(),
];