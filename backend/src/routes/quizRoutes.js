const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const quizAttemptController = require('../controllers/quizAttemptController');

router.post(
  '/courses/:courseId/quizzes/generate',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),
  quizController.generateQuizFromFile
);

router.get('/quizzes/:id', requireAuth, quizController.getQuiz);
router.get('/courses/:courseId/quizzes', requireAuth, quizController.listQuizzesByCourse);

router.post('/quizzes/:quizId/attempts/start', requireAuth, quizAttemptController.startAttempt);
router.post('/attempts/:attemptId/submit', requireAuth, quizAttemptController.submitAttempt);
router.get('/attempts/:attemptId', requireAuth, quizAttemptController.getAttempt);


// ═══ PUBLICATION / SUPPRESSION ═══
router.patch(
  '/quizzes/:id/publish',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),
  quizController.publishQuiz
);

router.patch(
  '/quizzes/:id/unpublish',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),
  quizController.unpublishQuiz
);

router.delete(
  '/quizzes/:id',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),
  quizController.deleteQuiz
);

module.exports = router;