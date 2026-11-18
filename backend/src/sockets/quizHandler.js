const prisma = require('../config/database');

module.exports = (io, socket) => {
  socket.on('quiz:start', async ({ attemptId }) => {
    socket.join(`quiz:${attemptId}`);
    console.log(`[Socket] Étudiant rejoint quiz ${attemptId}`);
  });

  socket.on('quiz:tab-switch', async ({ attemptId, count, timestamp }) => {
    try {
      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: parseInt(attemptId) },
        include: { quiz: true },
      });

      if (!attempt) return;

      // Mettre à jour le compteur
      const warnings = Array.isArray(attempt.warnings) ? attempt.warnings : [];
      warnings.push({ type: 'TAB_SWITCH', timestamp, count });

      await prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          tabSwitchCount: count,
          warnings,
        },
      });

      // Si max dépassé → verrouiller
      if (count >= attempt.quiz.maxTabSwitches) {
        await prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'SUBMITTED',
            isFlagged: true,
            submittedAt: new Date(),
          },
        });

        io.to(`quiz:${attemptId}`).emit('quiz:locked', {
          count,
          max: attempt.quiz.maxTabSwitches,
        });
        return;
      }

      // Sinon → changer la question
      const newQuestion = await prisma.quizQuestion.findFirst({
        where: { quizId: attempt.quizId },
        orderBy: { orderIndex: 'asc' },
        skip: Math.floor(Math.random() * 3),
      });

      if (newQuestion) {
        io.to(`quiz:${attemptId}`).emit('quiz:question-changed', {
          newQuestion,
          reason: 'TAB_SWITCH_DETECTED',
        });
      }
    } catch (err) {
      console.error('[Socket] Erreur tab-switch:', err);
    }
  });

  socket.on('quiz:auto-submit', async ({ attemptId, reason }) => {
    try {
      await prisma.quizAttempt.update({
        where: { id: parseInt(attemptId) },
        data: {
          status: 'SUBMITTED',
          isFlagged: true,
          submittedAt: new Date(),
        },
      });

      io.to(`quiz:${attemptId}`).emit('quiz:locked', { reason });
    } catch (err) {
      console.error('[Socket] Erreur auto-submit:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Déconnecté: ${socket.id}`);
  });
};