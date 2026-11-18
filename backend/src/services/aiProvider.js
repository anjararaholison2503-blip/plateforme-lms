// ═══════════════════════════════════════════════════════════
// FOURNISSEUR IA — Version simplifiée (SIMULATION uniquement)
// ═══════════════════════════════════════════════════════════

console.log(`[AIProvider] Fournisseur actif : SIMULATION`);

function isSimulation() {
  return true;   // Toujours en simulation pour l'instant
}

function getProviderName() {
  return 'SIMULATION';
}

async function callAI(prompt, options = {}) {
  return { __simulation: true };
}

module.exports = { isSimulation, getProviderName, callAI, PROVIDER: 'SIMULATION' };