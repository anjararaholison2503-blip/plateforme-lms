const { body, param } = require('express-validator');

const CONTENT_TYPES = ['TEXT', 'VIDEO', 'LINK', 'FILE', 'MIXED'];

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════

exports.courseIdParamValidator = [
  param('courseId').isInt({ min: 1 }).withMessage('courseId invalide'),
];

exports.idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
];

exports.moduleIdParamValidator = [
  param('moduleId').isInt({ min: 1 }).withMessage('moduleId invalide'),
];

exports.createModuleValidator = [
  param('courseId').isInt({ min: 1 }),
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('orderIndex').optional().isInt({ min: 0 }),
  body('duration').optional({ nullable: true }).isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

exports.updateModuleValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }),
  body('orderIndex').optional().isInt({ min: 0 }),
  body('duration').optional({ nullable: true }).isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

exports.reorderModulesValidator = [
  param('courseId').isInt({ min: 1 }),
  body('moduleIds').isArray({ min: 1 }),
  body('moduleIds.*').isInt({ min: 1 }),
];

// ═══════════════════════════════════════════════════════════
// LEÇONS
// ═══════════════════════════════════════════════════════════

exports.createLessonValidator = [
  param('moduleId').isInt({ min: 1 }),
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 2, max: 255 }),
  body('content').optional({ nullable: true }).isString(),
  body('contentType').optional().isIn(CONTENT_TYPES),
  body('videoUrl').optional({ nullable: true }).isString(),
  body('duration').optional({ nullable: true }).isInt({ min: 0 }),
  body('orderIndex').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

exports.updateLessonValidator = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 2, max: 255 }),
  body('content').optional({ nullable: true }),
  body('contentType').optional().isIn(CONTENT_TYPES),
  body('videoUrl').optional({ nullable: true }),
  body('duration').optional({ nullable: true }).isInt({ min: 0 }),
  body('orderIndex').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

exports.reorderLessonsValidator = [
  param('moduleId').isInt({ min: 1 }),
  body('lessonIds').isArray({ min: 1 }),
  body('lessonIds.*').isInt({ min: 1 }),
];