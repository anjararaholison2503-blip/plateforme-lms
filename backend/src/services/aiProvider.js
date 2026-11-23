// ═══════════════════════════════════════════════════════════
// FOURNISSEUR IA UNIFIÉ — Simulation / OpenAI / Gemini
// ═══════════════════════════════════════════════════════════

const PROVIDER = (process.env.AI_PROVIDER || 'SIMULATION').toUpperCase();

console.log(`[AIProvider] Fournisseur actif : ${PROVIDER}`);

/**
 * Vérifie si on est en mode simulation
 */
function isSimulation() {
  if (PROVIDER === 'SIMULATION') return true;
  if (PROVIDER === 'OPENAI' && !process.env.OPENAI_API_KEY) return true;
  if (PROVIDER === 'GEMINI' && !process.env.GEMINI_API_KEY) return true;
  return false;
}

/**
 * Retourne le nom du provider actif
 */
function getProviderName() {
  if (isSimulation()) return 'SIMULATION';
  return PROVIDER;
}

/**
 * Envoie un prompt à l'IA et retourne la réponse
 */
async function callAI(prompt, options = {}) {
  const { temperature = 0.7 } = options;

  // ═══ MODE SIMULATION ═══
  if (isSimulation()) {
    console.log('[AIProvider] Mode simulation actif');
    return { __simulation: true };
  }

  // ═══ MODE OPENAI ═══
  if (PROVIDER === 'OPENAI') {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return completion.choices[0].message.content;
  }

  // ═══ MODE GEMINI (via compatibilité OpenAI) ═══
  if (PROVIDER === 'GEMINI') {
    const OpenAI = require('openai');
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    const completion = await client.chat.completions.create({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    let content = completion.choices[0].message.content;
    // Nettoyer les balises markdown ```json ... ```
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    return content;
  }

  throw new Error(`AI_PROVIDER inconnu : ${PROVIDER}`);
}

module.exports = { isSimulation, getProviderName, callAI, PROVIDER };