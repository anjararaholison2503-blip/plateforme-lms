// ═══════════════════════════════════════════════════════════
// SERVICE DE GÉNÉRATION IA DE QUIZ
// ═══════════════════════════════════════════════════════════

const prisma = require('../config/database');
const AppError = require('../errors/AppError'); 

const USE_REAL_AI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
const SIMULATION_MODE = !USE_REAL_AI;

console.log(`[AIQuiz] Mode: ${SIMULATION_MODE ? 'SIMULATION' : 'OPENAI REEL'}`);

/**
 * Génère des questions à partir d'un texte de cours
 */
async function generateQuestions(text, options = {}) {
  const { questionCount = 10, difficulty = 'MEDIUM', types = null } = options;

  if (SIMULATION_MODE) {
    return simulateQuestions(text, questionCount, difficulty);
  }

  return realQuestions(text, questionCount, difficulty, types);
}

function simulateQuestions(text, count, difficulty) {
  // Extraire des phrases clés du texte
  const sentences = text
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 200);

  const questions = [];
  const types = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'];

  for (let i = 0; i < Math.min(count, 15); i++) {
    const type = types[i % types.length];
    const source = sentences[i % sentences.length] || `Concept important numéro ${i + 1}`;

    if (type === 'MULTIPLE_CHOICE') {
      questions.push({
        question: `Concernant "${source.substring(0, 80)}...", quelle affirmation est correcte ?`,
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: 'Affirmation A (correcte)', isCorrect: true },
          { text: 'Affirmation B', isCorrect: false },
          { text: 'Affirmation C', isCorrect: false },
          { text: 'Affirmation D', isCorrect: false },
        ],
        explanation: 'Réponse générée en mode simulation.',
        points: 1,
        difficulty,
      });
    } else if (type === 'TRUE_FALSE') {
      questions.push({
        question: `Vrai ou Faux : ${source.substring(0, 120)}`,
        type: 'TRUE_FALSE',
        options: [
          { text: 'Vrai', isCorrect: i % 2 === 0 },
          { text: 'Faux', isCorrect: i % 2 !== 0 },
        ],
        explanation: 'Réponse générée en mode simulation.',
        points: 1,
        difficulty,
      });
    } else {
      questions.push({
        question: `Expliquez brièvement : ${source.substring(0, 100)}`,
        type: 'SHORT_ANSWER',
        correctAnswer: 'Réponse attendue générée en simulation.',
        explanation: 'Réponse générée en mode simulation.',
        points: 2,
        difficulty,
      });
    }
  }

  return questions;
}

async function realQuestions(text, count, difficulty) {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Tu es un enseignant expert. Génère ${count} questions de quiz à partir du cours ci-dessous.
Difficulté : ${difficulty}

COURS :
${text.substring(0, 8000)}

Réponds UNIQUEMENT en JSON :
{
  "questions": [
    {
      "question": "...",
      "type": "MULTIPLE_CHOICE|TRUE_FALSE|SHORT_ANSWER",
      "options": [{"text": "...", "isCorrect": true}],
      "correctAnswer": "...",
      "explanation": "...",
      "points": 1,
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.questions || [];
  } catch (err) {
    console.error('[AIQuiz] Erreur OpenAI:', err.message);
    return simulateQuestions(text, count, difficulty);
  }
}

/**
 * Crée un quiz complet en base à partir d'un fichier
 */
async function createQuizFromFile({ courseId, title, fileUrl, fileName, mimeType, userId, options }) {
  const aiDetectionService = require('./aiDetectionService');

  // Créer le quiz en DRAFT
  const quiz = await prisma.quiz.create({
    data: {
      courseId,
      title,
      description: 'Quiz généré automatiquement par IA',
      sourceFileUrl: fileUrl,
      sourceFileName: fileName,
      aiGenerated: true,
      aiGenerationStatus: 'PROCESSING',
      status: 'DRAFT',
      createdById: userId,
    },
  });

  // Lancer la génération en arrière-plan
  generateQuizQuestions(quiz.id, fileUrl, mimeType, options).catch((err) =>
    console.error('[AIQuiz] Erreur génération:', err)
  );

  return quiz;
}

// async function generateQuizQuestions(quizId, fileUrl, mimeType, options) {
//   try {
//     const aiDetectionService = require('./aiDetectionService');

//     // Extraire le texte
//     let text = '';
//     if (fileUrl && mimeType) {
//       text = (await aiDetectionService.extractTextFromFile(fileUrl, mimeType)) || '';
//     }

//     if (!text || text.length < 100) {
//       await prisma.quiz.update({
//         where: { id: quizId },
//         data: { aiGenerationStatus: 'FAILED' },
//       });
//       return;
//     }

//     // Générer les questions
//     const questions = await generateQuestions(text, options);

//     // Sauvegarder
//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       await prisma.quizQuestion.create({
//         data: {
//           quizId,
//           question: q.question,
//           type: q.type,
//           options: q.options || null,
//           correctAnswer: q.correctAnswer || null,
//           explanation: q.explanation || null,
//           points: q.points || 1,
//           difficulty: q.difficulty || 'MEDIUM',
//           orderIndex: i,
//         },
//       });
//     }

//     await prisma.quiz.update({
//       where: { id: quizId },
//       data: { aiGenerationStatus: 'COMPLETED' },
//     });

//     console.log(`[AIQuiz] Quiz ${quizId} — ${questions.length} questions générées`);
//   } catch (err) {
//     console.error(`[AIQuiz] Erreur quiz ${quizId}:`, err);
//     await prisma.quiz
//       .update({ where: { id: quizId }, data: { aiGenerationStatus: 'FAILED' } })
//       .catch(() => {});
//   }
// }
async function generateQuizQuestions(quizId, fileUrl, mimeType, options) {
  try {
    const aiDetectionService = require('./aiDetectionService');

    console.log(`\n🔍 [AIQuiz] ═══════════════════════════════════`);
    console.log(`🔍 [AIQuiz] Début génération quiz ${quizId}`);
    console.log(`🔍 [AIQuiz] fileUrl = ${fileUrl}`);
    console.log(`🔍 [AIQuiz] mimeType = ${mimeType}`);
    console.log(`🔍 [AIQuiz] ═══════════════════════════════════\n`);

    let text = '';
    if (fileUrl && mimeType) {
      text = (await aiDetectionService.extractTextFromFile(fileUrl, mimeType)) || '';
    }

    console.log(`🔍 [AIQuiz] Texte extrait : ${text.length} caractères`);

    if (!text || text.length < 100) {
      console.warn(`❌ [AIQuiz] Texte trop court (${text.length} < 100)`);
      await prisma.quiz.update({
        where: { id: quizId },
        data: { aiGenerationStatus: 'FAILED' },
      });
      return;
    }

    console.log(`✅ [AIQuiz] Texte OK (${text.length} car.), génération en cours...`);

    const questions = await generateQuestions(text, options);

    console.log(`✅ [AIQuiz] ${questions.length} questions générées, sauvegarde...`);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId,
          question: q.question,
          type: q.type,
          options: q.options || null,
          correctAnswer: q.correctAnswer || null,
          explanation: q.explanation || null,
          points: q.points || 1,
          difficulty: q.difficulty || 'MEDIUM',
          orderIndex: i,
        },
      });
    }

    await prisma.quiz.update({
      where: { id: quizId },
      data: { aiGenerationStatus: 'COMPLETED' },
    });

    console.log(`\n✅ [AIQuiz] ═══════════════════════════════════`);
    console.log(`✅ [AIQuiz] Quiz ${quizId} — ${questions.length} questions en base`);
    console.log(`✅ [AIQuiz] ═══════════════════════════════════\n`);
  } catch (err) {
    console.error(`\n❌ [AIQuiz] ═══════════════════════════════════`);
    console.error(`❌ [AIQuiz] Erreur quiz ${quizId}:`, err);
    console.error(`❌ [AIQuiz] ═══════════════════════════════════\n`);
    await prisma.quiz
      .update({ where: { id: quizId }, data: { aiGenerationStatus: 'FAILED' } })
      .catch(() => {});
  }
}
module.exports = {
  generateQuestions,
  createQuizFromFile,
  SIMULATION_MODE,
};