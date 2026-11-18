const express = require('express');
const router = express.Router();
const examController = require('../../controllers/admin/examController');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Routes spécifiques
router.get('/my-exams', requireAuth, requireRole('STUDENT'), examController.getMyExams);
router.get('/course/:courseId', requireAuth, examController.listExamsByCourse);

// Routes avec paramètres
router.post('/', requireAuth, requireRole('TEACHER', 'ADMIN'), examController.createExam);
router.post('/:examId/questions', requireAuth, requireRole('TEACHER', 'ADMIN'), examController.addQuestion);
router.patch('/:id/publish', requireAuth, requireRole('TEACHER', 'ADMIN'), examController.publishExam);
router.delete('/:id', requireAuth, requireRole('TEACHER', 'ADMIN'), examController.deleteExam);
router.get('/:id/take', requireAuth, requireRole('STUDENT'), examController.getExamForStudent);
router.post('/:id/submit', requireAuth, requireRole('STUDENT'), examController.submitExam);

module.exports = router;