const prisma = require('../config/database');
const aiQuizService = require('../services/aiQuizService');

exports.generateQuizFromFile = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, fileUrl, fileName, mimeType, questionCount, difficulty } = req.body;

    if (!fileUrl || !title) {
      return res.status(400).json({
        success: false,
        message: 'Fichier et titre requis',
      });
    }

    const quiz = await aiQuizService.createQuizFromFile({
      courseId: parseInt(courseId),
      title,
      fileUrl,
      fileName,
      mimeType,
      userId: req.user.id,
      options: {
        questionCount: parseInt(questionCount) || 10,
        difficulty: difficulty || 'MEDIUM',
      },
    });

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz en cours de génération par IA',
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz introuvable' });
    }

    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

exports.listQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: parseInt(req.params.courseId) },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
};
/**
 * Publier un quiz (le rendre visible aux étudiants)
 * PATCH /api/quizzes/:id/publish
 */
exports.publishQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { questions: true } } },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz introuvable',
      });
    }

    if (quiz._count.questions === 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de publier un quiz sans questions',
      });
    }

    const updated = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { status: 'PUBLISHED' },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Quiz publié avec succès',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dépublier un quiz (le remettre en brouillon)
 * PATCH /api/quizzes/:id/unpublish
 */
exports.unpublishQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: { status: 'DRAFT' },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Quiz remis en brouillon',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Supprimer un quiz
 * DELETE /api/quizzes/:id
 */
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.quiz.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Quiz supprimé',
    });
  } catch (err) {
    next(err);
  }
};
// module.exports = {
//   generateQuizFromFile,
//   getQuiz,
//   listQuizzesByCourse,
//   publishQuiz,
//   unpublishQuiz,
//   deleteQuiz,
// };