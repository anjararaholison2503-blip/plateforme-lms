const catchAsync = require('../../utils/catchAsync');
const examService = require('../../services/admin/examService');
const prisma = require('../../config/database');

// --- ROUTES ENSEIGNANT ---
exports.createExam = catchAsync(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user.id);
  res.status(201).json({ success: true, data: exam });
});

exports.addQuestion = catchAsync(async (req, res) => {
  const question = await examService.addQuestion(req.params.examId, req.body);
  res.status(201).json({ success: true, data: question });
});

exports.listExamsByCourse = catchAsync(async (req, res) => {
  const exams = await examService.listExamsByCourse(req.params.courseId);
  res.json({ success: true, data: exams });
});

exports.publishExam = catchAsync(async (req, res) => {
  const exam = await examService.publishExam(req.params.id);
  res.json({ success: true, data: exam });
});

// --- ROUTES ÉTUDIANT ---

// 1. Démarrer l'examen (et bloquer si déjà fait)
exports.getExamForStudent = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const examId = parseInt(req.params.id);

  // Vérifier si l'étudiant a déjà une tentative (en cours ou terminée)
//   const existingAttempt = await prisma.examAttempt.findFirst({
//     where: { examId, studentId }
//   });

//   if (existingAttempt) {
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Vous avez déjà passé ou commencé cet examen. Impossible de recommencer.' 
//     });
//   }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { orderIndex: 'asc' } } }
  });

  if (!exam || exam.status !== 'PUBLISHED') {
    return res.status(404).json({ success: false, message: 'Examen introuvable ou non publié' });
  }

  // Créer la tentative "IN_PROGRESS"
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      studentId,
      status: 'IN_PROGRESS'
    }
  });

  const questionsForStudent = exam.questions.map(q => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options,
    points: q.points,
    timeLimit: q.timeLimit // ⬅️ On renvoie le temps
  }));

  res.json({
    success: true,
    data: {
      attemptId: attempt.id, // On renvoie l'ID
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      questions: questionsForStudent
    }
  });
});

// 2. Soumettre l'examen (Mise à jour de la tentative)
exports.submitExam = catchAsync(async (req, res) => {
  const { answers, attemptId, timeout } = req.body; 
  const examId = parseInt(req.params.id);
  
  // Si l'étudiant soumet sans avoir répondu à rien
  const studentAnswers = Array.isArray(answers) ? answers : [];

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: true }
  });

  if (!exam) return res.status(404).json({ success: false, message: 'Examen introuvable' });

  let totalPointsEarned = 0;
  let totalPointsPossible = 0;

  for (const q of exam.questions) {
    totalPointsPossible += q.points;
    const answerObj = studentAnswers.find(a => a.questionId === q.id);
    const studentAns = answerObj ? answerObj.answer : '';
    
    // Vérification "à peu près" (Levenshtein + IA)
    const isCorrect = await examService.evaluateAnswer(studentAns, q.correctAnswer, q.type);
    if (isCorrect) {
      totalPointsEarned += q.points;
    }
  }

  // Calcul de la note sur 20
  const score = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 20 : 0;

  // MISE À JOUR de la tentative (au lieu d'en créer une nouvelle)
  if (attemptId) {
    await prisma.examAttempt.update({
      where: { id: parseInt(attemptId) },
      data: {
        score: parseFloat(score.toFixed(2)),
        status: timeout ? 'TIMEOUT' : 'SUBMITTED',
        submittedAt: new Date()
      }
    });
  }

  res.json({
    success: true,
    data: { score: parseFloat(score.toFixed(2)), totalPointsEarned, totalPointsPossible }
  });
});

// 3. Lister les examens de l'étudiant
exports.getMyExams = catchAsync(async (req, res) => {
  const studentId = req.user.id;

  const exams = await prisma.exam.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      course: { select: { id: true, title: true, code: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: studentId },
        select: { score: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: exams });
});

// Supprimer un examen
exports.deleteExam = catchAsync(async (req, res) => {
  const examId = parseInt(req.params.id);

  // On vérifie que l'examen existe
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return res.status(404).json({ success: false, message: 'Examen introuvable' });

  // On supprime l'examen. 
  // Grâce au "onDelete: Cascade" dans Prisma, les questions et les tentatives seront aussi supprimées.
  await prisma.exam.delete({ where: { id: examId } });

  res.json({ success: true, message: 'Examen supprimé avec succès' });
});