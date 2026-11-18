// ═══════════════════════════════════════════════════════════
// SERVICE DE DÉTECTION IA
// Mode simulation par défaut — bascule sur OpenAI si clé dispo
// ═══════════════════════════════════════════════════════════

const prisma = require('../config/database');
const aiProvider = require('./aiProvider');

console.log(`[AIDetection] Mode: ${aiProvider.isSimulation() ? 'SIMULATION' : aiProvider.getProviderName()}`);

/**
 * Analyse un texte et retourne un score de probabilité IA (0-100)
 */
async function analyzeText(text) {
  if (!text || text.trim().length < 50) {
    return {
      score: 0,
      details: { message: 'Texte trop court pour analyse', passages: [] },
    };
  }

  if (aiProvider.isSimulation()) {
    return simulateAnalysis(text);
  }

  return realAnalysis(text);
}

/**
 * MODE SIMULATION — Score aléatoire + passages fictifs
 */
function simulateAnalysis(text) {
  const score = Math.round(5 + Math.random() * 80);

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
  const passages = [];
  const nbPassages = Math.min(paragraphs.length, 3);

  for (let i = 0; i < nbPassages; i++) {
    const idx = Math.floor(Math.random() * paragraphs.length);
    const passageScore = Math.round(score + (Math.random() * 20 - 10));
    passages.push({
      paragraphIndex: idx + 1,
      preview: paragraphs[idx].substring(0, 150) + '...',
      score: Math.max(0, Math.min(100, passageScore)),
    });
  }

  return {
    score,
    details: {
      mode: 'SIMULATION',
      analyzedAt: new Date().toISOString(),
      wordCount: text.split(/\s+/).length,
      passages,
      disclaimer:
        "Ce score est un INDICATEUR, pas une preuve. L'enseignant garde le contrôle final.",
    },
  };
}

/**
 * MODE RÉEL — Appel via aiProvider
 */
async function realAnalysis(text) {
  try {
    const prompt = `Analyse ce texte et estime la probabilité qu'il ait été généré par une IA.
Retourne UNIQUEMENT un JSON valide :
{
  "score": <nombre 0-100>,
  "passages": [{"paragraphIndex": <int>, "preview": "<extrait 150 char>", "score": <0-100>}]
}

TEXTE :
${text.substring(0, 6000)}`;

    const result = await aiProvider.callAI(prompt, { temperature: 0.3 });
    if (result.__simulation) return simulateAnalysis(text);

    return {
      score: result.score || 0,
      details: {
        mode: aiProvider.getProviderName(),
        analyzedAt: new Date().toISOString(),
        wordCount: text.split(/\s+/).length,
        passages: result.passages || [],
        disclaimer:
          "Ce score est un INDICATEUR, pas une preuve. L'enseignant garde le contrôle final.",
      },
    };
  } catch (err) {
    console.error('[AIDetection] Erreur provider :', err.message);
    return simulateAnalysis(text);
  }
}

/**
 * Lance l'analyse IA en arrière-plan pour une soumission
 */
async function runDetectionForSubmission(submissionId) {
  try {
    await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { aiDetectionStatus: 'PROCESSING' },
    });

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) return;

    let text = submission.content || '';

    if (submission.fileUrl && submission.mimeType) {
      const extracted = await extractTextFromFile(submission.fileUrl, submission.mimeType);
      if (extracted) text += '\n' + extracted;
    }

    if (!text || text.trim().length < 50) {
      await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          aiDetectionStatus: 'FAILED',
          aiDetectionDetails: { error: 'Aucun texte exploitable' },
        },
      });
      return;
    }

    const result = await analyzeText(text);

    await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        aiDetectionScore: result.score,
        aiDetectionDetails: result.details,
        aiDetectionStatus: 'COMPLETED',
      },
    });

    console.log(`[AIDetection] Soumission ${submissionId} — Score: ${result.score}%`);
  } catch (err) {
    console.error(`[AIDetection] Erreur soumission ${submissionId}:`, err);
    await prisma.assignmentSubmission
      .update({
        where: { id: submissionId },
        data: {
          aiDetectionStatus: 'FAILED',
          aiDetectionDetails: { error: err.message },
        },
      })
      .catch(() => {});
  }
}

/**
 * ═══════════════════════════════════════════════════════════
 * EXTRACTION DE TEXTE — MULTI-MÉTHODES AVEC FALLBACK
 * ═══════════════════════════════════════════════════════════
 */
async function extractTextFromFile(fileUrl, mimeType) {
  try {
    const fs = require('fs');
    const path = require('path');

    const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const fullPath = path.join(__dirname, '../../', relativePath);

    console.log('🔍 [AIDetection] Lecture fichier:', fullPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`[AIDetection] Fichier introuvable: ${fullPath}`);
      return null;
    }

    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    // ═══════════════════════════════════════════════════════
    // PDF — Méthode 1 : pdf-parse, Méthode 2 : pdfjs-dist
    // ═══════════════════════════════════════════════════════
    if (ext === '.pdf') {
      // ═══ Méthode 1 : pdf-parse ═══
      try {
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        if (data.text && data.text.trim().length > 50) {
          console.log(`[AIDetection] ✅ pdf-parse : ${data.text.length} car.`);
          return data.text;
        }
        console.warn(`[AIDetection] pdf-parse a extrait trop peu de texte (${data.text?.length || 0} car.)`);
      } catch (err1) {
        console.warn(`[AIDetection] pdf-parse échoué : ${err1.message}`);
      }

      // ═══ Méthode 2 : pdfjs-dist (fallback) ═══
      try {
        const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
        const uint8Array = new Uint8Array(buffer);
        const pdf = await pdfjsLib.getDocument({
          data: uint8Array,
          disableWorker: true,
        }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }

        if (fullText.trim().length > 50) {
          console.log(`[AIDetection] ✅ pdfjs-dist : ${fullText.length} car.`);
          return fullText;
        }
        console.warn(`[AIDetection] pdfjs-dist a extrait trop peu de texte (${fullText.length} car.)`);
      } catch (err2) {
        console.warn(`[AIDetection] pdfjs-dist échoué : ${err2.message}`);
      }

      console.error(`[AIDetection] ❌ PDF illisible (toutes méthodes échouées)`);
      return null;
    }

    // ═══════════════════════════════════════════════════════
    // DOCX — mammoth
    // ═══════════════════════════════════════════════════════
    if (ext === '.docx' || ext === '.doc') {
      try {
        const mammoth = require('mammoth');
        const data = await mammoth.extractRawText({ buffer });
        console.log(`[AIDetection] ✅ mammoth : ${data.value.length} car.`);
        return data.value;
      } catch (docErr) {
        console.warn(`[AIDetection] mammoth échoué : ${docErr.message}`);
        return null;
      }
    }

    // ═══════════════════════════════════════════════════════
    // TXT — lecture directe
    // ═══════════════════════════════════════════════════════
    if (ext === '.txt' || ext === '.md' || ext === '.csv') {
      const text = buffer.toString('utf-8');
      console.log(`[AIDetection] ✅ TXT : ${text.length} car.`);
      return text;
    }

    // ═══ Fallback : essayer en UTF-8 ═══
    console.warn(`[AIDetection] Extension non reconnue (${ext}), essai en UTF-8`);
    return buffer.toString('utf-8');
  } catch (err) {
    console.warn('[AIDetection] Extraction échouée:', err.message);
    return null;
  }
}

module.exports = {
  analyzeText,
  runDetectionForSubmission,
  extractTextFromFile,
};