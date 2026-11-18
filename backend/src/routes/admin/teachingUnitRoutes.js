const express = require('express');
const router = express.Router();
const teachingUnitController = require('../../controllers/admin/teachingUnitController');
const {
  listUnitsValidator,
  createUnitValidator,
  updateUnitValidator,
  addCourseValidator,
  removeCourseValidator,
  createCourseInUnitValidator,
  assignClassesValidator,
  removeClassValidator,
  idParamValidator,
} = require('../../validators/admin/teachingUnitValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// LECTURE (accessible à tous les utilisateurs connectés)
// ═══════════════════════════════════════════════════════════

router.get('/', listUnitsValidator, teachingUnitController.listUnits);
router.get('/stats', requireRole('ADMIN'), teachingUnitController.getStats);
router.get('/:id', idParamValidator, teachingUnitController.getUnit);
router.get('/:id/classes', idParamValidator, teachingUnitController.listUnitClasses);

// ═══════════════════════════════════════════════════════════
// ÉCRITURE (ADMIN uniquement)
// ═══════════════════════════════════════════════════════════

// CRUD UE
router.post('/', requireRole('ADMIN'), createUnitValidator, teachingUnitController.createUnit);
router.put('/:id', requireRole('ADMIN'), updateUnitValidator, teachingUnitController.updateUnit);
router.delete('/:id', requireRole('ADMIN'), idParamValidator, teachingUnitController.deleteUnit);

// Gestion des matières
router.post('/:id/courses', requireRole('ADMIN'), addCourseValidator, teachingUnitController.addCourse);
router.delete('/:id/courses/:courseId', requireRole('ADMIN'), removeCourseValidator, teachingUnitController.removeCourse);
router.post('/:id/courses/new', requireRole('ADMIN'), createCourseInUnitValidator, teachingUnitController.createCourseInUnit);

// Gestion des classes
router.post('/:id/classes', requireRole('ADMIN'), assignClassesValidator, teachingUnitController.assignClasses);
router.delete('/:id/classes/:classId', requireRole('ADMIN'), removeClassValidator, teachingUnitController.removeClass);

module.exports = router;