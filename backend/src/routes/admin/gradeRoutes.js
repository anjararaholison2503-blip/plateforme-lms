const express = require('express');
const router = express.Router();
const gradeController = require('../../controllers/admin/gradeController');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Routes Étudiant
router.get('/me', requireAuth, requireRole('STUDENT'), gradeController.getStudentGradesByCourse);
router.get('/course/:courseId', requireAuth, requireRole('STUDENT'), gradeController.getStudentCourseDetails);

// Routes Enseignant / Admin
router.get('/teacher-courses', requireAuth, requireRole('TEACHER', 'ADMIN'), gradeController.getTeacherCourses);
router.get('/teacher-course/:courseId', requireAuth, requireRole('TEACHER', 'ADMIN'), gradeController.getCourseStudentsGrades);

module.exports = router;