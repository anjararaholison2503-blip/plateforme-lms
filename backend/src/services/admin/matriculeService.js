const prisma = require('../../config/database');

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DU MATRICULE
// Format : ETU-2026-0042
//   ETU  = Préfixe (Étudiant)
//   2026 = Année d'inscription
//   0042 = Numéro séquentiel (4 chiffres)
// ═══════════════════════════════════════════════════════════

/**
 * Génère un matricule unique pour un étudiant
 * @param {number} year - Année d'inscription (ex: 2026)
 * @returns {string} Le matricule (ex: ETU-2026-0042)
 */
exports.generateMatricule = async (year = null) => {
  const currentYear = year || new Date().getFullYear();
  const prefix = `ETU-${currentYear}-`;

  // Chercher le dernier matricule de l'année
  const lastUser = await prisma.user.findFirst({
    where: {
      matricule: { startsWith: prefix },
    },
    orderBy: { matricule: 'desc' },
    select: { matricule: true },
  });

  let nextNumber = 1;
  if (lastUser?.matricule) {
    const lastNumber = parseInt(lastUser.matricule.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  // Formatter sur 4 chiffres (0042)
  const number = String(nextNumber).padStart(4, '0');

  return `${prefix}${number}`;
};

/**
 * Génère un matricule en masse (pour import Excel)
 * @param {number} count - Nombre de matricules à générer
 * @param {number} year - Année d'inscription
 * @returns {string[]} Liste des matricules
 */
exports.generateBulkMatricules = async (count, year = null) => {
  const currentYear = year || new Date().getFullYear();
  const prefix = `ETU-${currentYear}-`;

  const lastUser = await prisma.user.findFirst({
    where: {
      matricule: { startsWith: prefix },
    },
    orderBy: { matricule: 'desc' },
    select: { matricule: true },
  });

  let startNumber = 1;
  if (lastUser?.matricule) {
    startNumber = parseInt(lastUser.matricule.replace(prefix, ''), 10) + 1;
  }

  const matricules = [];
  for (let i = 0; i < count; i++) {
    const number = String(startNumber + i).padStart(4, '0');
    matricules.push(`${prefix}${number}`);
  }

  return matricules;
};

/**
 * Vérifier si un matricule existe déjà
 */
exports.matriculeExists = async (matricule) => {
  const user = await prisma.user.findUnique({
    where: { matricule },
    select: { id: true },
  });
  return !!user;
};