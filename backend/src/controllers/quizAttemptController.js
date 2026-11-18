const prisma = require('../config/database');

/**
 * Démarrer une tentative de quiz
 * POST /api/quizzes/:quizId/attempts/start
 */
exports.startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz introuvable',
      });
    }

    // Vérifier le nombre de tentatives
    const attemptCount = await prisma.quizAttempt.count({
      where: { quizId: quiz.id, studentId },
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Nombre maximum de tentatives atteint',
      });
    }

    // Créer la tentative
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId,
        status: 'IN_PROGRESS',
      },
    });

    // Mélanger les questions si demandé
    let questions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Mélanger les réponses dans chaque question QCM
    if (quiz.shuffleAnswers) {
      questions = questions.map((q) => {
        if (q.options && Array.isArray(q.options)) {
          return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
        }
        return q;
      });
    }

    res.json({
      success: true,
      data: {
        attempt,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          duration: quiz.duration,
          maxTabSwitches: quiz.maxTabSwitches,
          shuffleQuestions: quiz.shuffleQuestions,
          shuffleAnswers: quiz.shuffleAnswers,
          questions,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Soumettre une tentative de quiz
 * POST /api/attempts/:attemptId/submit
 */
exports.submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // [{ questionId, answer }]

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        quiz: {
          include: { questions: true },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Tentative introuvable',
      });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Cette tentative est déjà soumise',
      });
    }

    let totalScore = 0;
    let totalPoints = 0;

    for (const q of attempt.quiz.questions) {
      totalPoints += q.points;
      const studentAnswer = (answers || []).find((a) => a.questionId === q.id);
      let isCorrect = false;
      let pointsEarned = 0;

      if (studentAnswer && studentAnswer.answer) {
        if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
          const options = Array.isArray(q.options) ? q.options : [];
          const correctOption = options.find((o) => o.isCorrect);
          isCorrect = correctOption && studentAnswer.answer === correctOption.text;
        } else if (q.type === 'SHORT_ANSWER' || q.type === 'FILL_IN_BLANK') {
          isCorrect =
            studentAnswer.answer.trim().toLowerCase() ===
            (q.correctAnswer || '').trim().toLowerCase();
        }

        pointsEarned = isCorrect ? q.points : 0;
        totalScore += pointsEarned;
      }

      // Enregistrer la réponse
      await prisma.quizAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: q.id,
          },
        },
        create: {
          attemptId: attempt.id,
          questionId: q.id,
          answer: studentAnswer?.answer || null,
          isCorrect,
          pointsEarned,
        },
        update: {
          answer: studentAnswer?.answer || null,
          isCorrect,
          pointsEarned,
        },
      });
    }

    // Score sur 20
    const finalScore = totalPoints > 0 ? (totalScore / totalPoints) * 20 : 0;

    const updated = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        score: finalScore,
        status: 'SUBMITTED',
      },
    });

    res.json({
      success: true,
      data: {
        attempt: updated,
        score: finalScore,
        totalScore,
        totalPoints,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Récupérer une tentative (pour l'enseignant ou l'étudiant)
 * GET /api/attempts/:attemptId
 */
exports.getAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        quiz: {
          select: { id: true, title: true, courseId: true },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Tentative introuvable',
      });
    }

    // Vérifier l'accès
    const isOwner = attempt.studentId === req.user.id;
    const isTeacher = ['ADMIN', 'TEACHER'].includes(req.user.role);

    if (!isOwner && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (err) {
    next(err);
  }
};