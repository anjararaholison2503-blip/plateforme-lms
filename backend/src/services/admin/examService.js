const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// 1. Créer un examen
exports.createExam = async (data, userId) => {
  return await prisma.exam.create({
    data: {
      courseId: parseInt(data.courseId),
      title: data.title,
      description: data.description || '',
      duration: parseInt(data.duration) || 60,
      passingScore: parseInt(data.passingScore) || 10,
      createdById: userId,
      status: 'DRAFT'
    }
  });
};

// 2. Ajouter une question
// exports.addQuestion = async (examId, data) => {
//   const count = await prisma.examQuestion.count({ where: { examId: parseInt(examId) } });
//   return await prisma.examQuestion.create({
//     data: {
//       examId: parseInt(examId),
//       question: data.question,
//       correctAnswer: data.correctAnswer,
//       points: parseInt(data.points) || 1,
//       type: 'SHORT_ANSWER',
//       orderIndex: count
//     }
//   });
// };
exports.addQuestion = async (examId, data) => {
  const count = await prisma.examQuestion.count({ where: { examId: parseInt(examId) } });
  return await prisma.examQuestion.create({
    data: {
      examId: parseInt(examId),
      question: data.question,
      type: data.type || 'SHORT_ANSWER', // ⬅️ NOUVEAU
      options: data.options || null,     // ⬅️ NOUVEAU
      correctAnswer: data.correctAnswer,
      points: parseInt(data.points) || 1,
      timeLimit: parseInt(data.timeLimit) || 30, // ⬅️ NOUVEAU
      orderIndex: count
    }
  });
};

// 3. Lister les examens d'un cours
exports.listExamsByCourse = async (courseId) => {
  return await prisma.exam.findMany({
    where: { courseId: parseInt(courseId) },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

// 4. Publier un examen
exports.publishExam = async (examId) => {
  return await prisma.exam.update({
    where: { id: parseInt(examId) },
    data: { status: 'PUBLISHED' }
  });
};

// 5. ALGORITHME DE CORRECTION (LE VOICI !)
exports.evaluateAnswer = async (studentAnswer, correctAnswer, questionType) => {
  if (!studentAnswer || !correctAnswer) return false;

  const cleanStudent = String(studentAnswer).trim().toLowerCase();
  const cleanCorrect = String(correctAnswer).trim().toLowerCase();

  // Vérification stricte
  if (cleanStudent === cleanCorrect) return true;

  // Si c'est un QCM ou Vrai/Faux
  if (questionType === 'MULTIPLE_CHOICE' || questionType === 'TRUE_FALSE') {
    return cleanStudent.includes(cleanCorrect) || cleanCorrect.includes(cleanStudent);
  }

  // Similarité de texte (Distance de Levenshtein)
  const similarity = calculateSimilarity(cleanStudent, cleanCorrect);
  if (similarity > 0.8) {
    console.log(`[Exam] Réponse acceptée par similarité (${Math.round(similarity * 100)}%)`);
    return true;
  }

  // Vérification par IA (Si la similarité est faible)
  try {
    const aiProvider = require('../aiProvider');
    if (aiProvider && !aiProvider.isSimulation()) {
      const prompt = `L'enseignant attend la réponse : "${correctAnswer}". L'étudiant a répondu : "${studentAnswer}". Est-ce que le sens est identique ? Réponds UNIQUEMENT par OUI ou NON.`;
      const aiResponse = await aiProvider.callAI(prompt, { json: false });
      if (aiResponse && String(aiResponse).toUpperCase().includes('OUI')) {
        console.log(`[Exam] Réponse acceptée par IA`);
        return true;
      }
    }
  } catch (e) {
    console.error("Erreur IA:", e);
  }

  return false;
};

// Fonctions utilitaires pour la similarité
function calculateSimilarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const editDistance = getEditDistance(longer, shorter);
  return (longerLength - editDistance) / parseFloat(longerLength);
}

function getEditDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}