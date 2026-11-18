const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/common/courseController');
const {
  listCoursesValidator,
  createCourseValidator,
  updateCourseValidator,
  createSessionValidator,
  updateSessionValidator,
  addTeacherValidator,
  removeTeacherValidator,
  enrollValidator,
  updateEnrollmentValidator,
  idParamValidator,
  sessionIdParamValidator,
  enrollmentIdParamValidator,
  addClassValidator,
  removeClassValidator,
} = require('../../validators/common/courseValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// ============ STATS ============
router.get('/stats', courseController.getStats);

// ═══════════════════════════════════════════════════════════
// CLASSES ATTRIBUÉES AU COURS (ADMIN uniquement)
// ═══════════════════════════════════════════════════════════
router.get('/:id/classes', idParamValidator, courseController.listCourseClasses);
router.post('/:id/classes', requireRole('ADMIN'), addClassValidator, courseController.addClass);
router.delete('/:id/classes/:classId', requireRole('ADMIN'), removeClassValidator, courseController.removeClass);

// ============ COURS ============
router.get('/', listCoursesValidator, courseController.listCourses);
router.get('/:id', idParamValidator, courseController.getCourse);

router.post(
  '/',
  requireRole('ADMIN'),
  createCourseValidator,
  courseController.createCourse
);
router.put(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  updateCourseValidator,
  courseController.updateCourse
);
router.delete('/:id', requireRole('ADMIN'), idParamValidator, courseController.deleteCourse);

// ============ SESSIONS ============
router.get('/:id/sessions', idParamValidator, courseController.listSessions);
router.post(
  '/:id/sessions',
  requireRole('ADMIN', 'TEACHER'),
  createSessionValidator,
  courseController.createSession
);
router.put(
  '/sessions/:sessionId',
  requireRole('ADMIN', 'TEACHER'),
  updateSessionValidator,
  courseController.updateSession
);
router.delete(
  '/sessions/:sessionId',
  requireRole('ADMIN'),
  sessionIdParamValidator,
  courseController.deleteSession
);

// ============ ENSEIGNANTS ============
router.post('/:id/teachers', requireRole('ADMIN'), 
addTeacherValidator, 

courseController.addTeacher);
router.delete(
  '/:id/teachers/:teacherId',
  requireRole('ADMIN'),
  removeTeacherValidator,
  courseController.removeTeacher
);

// ============ INSCRIPTIONS ============
router.get(
  '/sessions/:sessionId/enrollments',
  sessionIdParamValidator,
  courseController.listEnrollments
);
router.post(
  '/sessions/:sessionId/enrollments',
  requireRole('ADMIN', 'TEACHER'),
  enrollValidator,
  courseController.enrollStudent
);
router.put(
  '/enrollments/:enrollmentId',
  requireRole('ADMIN', 'TEACHER'),
  updateEnrollmentValidator,
  courseController.updateEnrollment
);
router.delete(
  '/enrollments/:enrollmentId',
  requireRole('ADMIN', 'TEACHER'),
  enrollmentIdParamValidator,
  courseController.removeEnrollment
);

module.exports = router;