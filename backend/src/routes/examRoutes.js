router.get('/courses/:courseId/exams', requireAuth, examController.listExamsByCourse);
router.patch('/exams/:id/publish', requireAuth, requireRole('TEACHER', 'ADMIN'), examController.publishExam);
router.get('/:id/take', requireAuth, requireRole('STUDENT'), examController.getExamForStudent);
router.post('/:id/submit', requireAuth, requireRole('STUDENT'), examController.submitExam);