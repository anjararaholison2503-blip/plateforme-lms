const express = require('express');
const router = express.Router();
const courseModuleController = require('../../controllers/common/courseModuleController');
const {
  courseIdParamValidator,
  idParamValidator,
  moduleIdParamValidator,
  createModuleValidator,
  updateModuleValidator,
  reorderModulesValidator,
  createLessonValidator,
  updateLessonValidator,
  reorderLessonsValidator,
} = require('../../validators/common/courseModuleValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

router.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════

// Lecture (tous)
router.get('/course/:courseId', courseIdParamValidator, courseModuleController.listModules);
router.get('/course/:courseId/stats', courseIdParamValidator, courseModuleController.getStats);
router.get('/module/:id', idParamValidator, courseModuleController.getModule);

// Écriture (ADMIN + TEACHER)
router.post(
  '/course/:courseId',
  requireRole('ADMIN', 'TEACHER'),
  createModuleValidator,
  courseModuleController.createModule
);

router.put(
  '/module/:id',
  requireRole('ADMIN', 'TEACHER'),
  updateModuleValidator,
  courseModuleController.updateModule
);

router.delete(
  '/module/:id',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  courseModuleController.deleteModule
);

router.patch(
  '/course/:courseId/reorder',
  requireRole('ADMIN', 'TEACHER'),
  reorderModulesValidator,
  courseModuleController.reorderModules
);

// ═══════════════════════════════════════════════════════════
// LEÇONS
// ═══════════════════════════════════════════════════════════

router.get('/lesson/:id', idParamValidator, courseModuleController.getLesson);

router.post(
  '/module/:moduleId/lessons',
  requireRole('ADMIN', 'TEACHER'),
  createLessonValidator,
  courseModuleController.createLesson
);

router.put(
  '/lesson/:id',
  requireRole('ADMIN', 'TEACHER'),
  updateLessonValidator,
  courseModuleController.updateLesson
);

router.delete(
  '/lesson/:id',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  courseModuleController.deleteLesson
);

router.patch(
  '/module/:moduleId/reorder',
  requireRole('ADMIN', 'TEACHER'),
  reorderLessonsValidator,
  courseModuleController.reorderLessons
);

module.exports = router;