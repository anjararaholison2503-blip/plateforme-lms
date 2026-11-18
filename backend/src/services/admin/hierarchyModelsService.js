const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════════
// MODÈLES DE HIÉRARCHIE PRÉDÉFINIS
// ═══════════════════════════════════════════════════════════════

const HIERARCHY_MODELS = {
  // ─────────────── UNIVERSITÉ ───────────────
  UNIVERSITY: {
    name: 'Université',
    description: 'Faculté → Département → Filière → Niveau → Classe → Groupe',
    icon: '🏛️',
    levels: [
      { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
      { type: 'FACULTY',       label: 'Faculté',       pluralLabel: 'Facultés',       icon: '🏫' },
      { type: 'DEPARTMENT',    label: 'Département',   pluralLabel: 'Départements',   icon: '📚' },
      { type: 'PROGRAM',       label: 'Filière',       pluralLabel: 'Filières',       icon: '🎓' },
      { type: 'LEVEL',         label: 'Niveau',        pluralLabel: 'Niveaux',        icon: '📊' },
      { type: 'CLASS',         label: 'Classe',        pluralLabel: 'Classes',        icon: '👥' },
      { type: 'GROUP',         label: 'Groupe',        pluralLabel: 'Groupes',        icon: '👨‍👩‍👧' },
    ],
    allowedChildren: {
      ESTABLISHMENT: ['FACULTY'],
      FACULTY:       ['DEPARTMENT'],
      DEPARTMENT:    ['PROGRAM'],
      PROGRAM:       ['LEVEL'],
      LEVEL:         ['CLASS'],
      CLASS:         ['GROUP'],
      GROUP:         [],
    },
  },

  // ─────────────── LYCÉE ───────────────
  HIGH_SCHOOL: {
    name: 'Lycée',
    description: 'Série → Niveau → Classe → Groupe',
    icon: '🏫',
    levels: [
      { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
      { type: 'PROGRAM',       label: 'Série',         pluralLabel: 'Séries',         icon: '🎓' },
      { type: 'LEVEL',         label: 'Niveau',        pluralLabel: 'Niveaux',        icon: '📊' },
      { type: 'CLASS',         label: 'Classe',        pluralLabel: 'Classes',        icon: '👥' },
      { type: 'GROUP',         label: 'Groupe',        pluralLabel: 'Groupes',        icon: '👨‍👩‍👧' },
    ],
    allowedChildren: {
      ESTABLISHMENT: ['PROGRAM'],
      PROGRAM:       ['LEVEL'],
      LEVEL:         ['CLASS'],
      CLASS:         ['GROUP'],
      GROUP:         [],
    },
  },

  // ─────────────── COLLÈGE ───────────────
  MIDDLE_SCHOOL: {
    name: 'Collège',
    description: 'Niveau → Classe → Groupe',
    icon: '🏢',
    levels: [
      { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
      { type: 'LEVEL',         label: 'Niveau',        pluralLabel: 'Niveaux',        icon: '📊' },
      { type: 'CLASS',         label: 'Classe',        pluralLabel: 'Classes',        icon: '👥' },
      { type: 'GROUP',         label: 'Groupe',        pluralLabel: 'Groupes',        icon: '👨‍👩‍👧' },
    ],
    allowedChildren: {
      ESTABLISHMENT: ['LEVEL'],
      LEVEL:         ['CLASS'],
      CLASS:         ['GROUP'],
      GROUP:         [],
    },
  },

  // ─────────────── PERSONNALISÉ ───────────────
  CUSTOM: {
    name: 'Personnalisé',
    description: 'Structure libre définie par l\'administrateur',
    icon: '⚙️',
    levels: [
      // Tous les types disponibles — l'admin choisit lesquels utiliser
      { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
      { type: 'FACULTY',       label: 'Faculté',       pluralLabel: 'Facultés',       icon: '🏫' },
      { type: 'DEPARTMENT',    label: 'Département',   pluralLabel: 'Départements',   icon: '📚' },
      { type: 'PROGRAM',       label: 'Programme',     pluralLabel: 'Programmes',     icon: '🎓' },
      { type: 'LEVEL',         label: 'Niveau',        pluralLabel: 'Niveaux',        icon: '📊' },
      { type: 'CLASS',         label: 'Classe',        pluralLabel: 'Classes',        icon: '👥' },
      { type: 'GROUP',         label: 'Groupe',        pluralLabel: 'Groupes',        icon: '👨‍👩‍👧' },
    ],
    allowedChildren: null, // ← Sera défini par l'admin dans hierarchyModel
  },
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Récupère le modèle complet en tenant compte du personnalisé.
 * @param {string} institutionType - Le type d'institution
 * @param {object} customModel - Le modèle personnalisé (si CUSTOM)
 * @returns {object} Le modèle complet
 */
const getModel = (institutionType, customModel = null) => {
  if (institutionType === 'CUSTOM') {
    if (!customModel || !customModel.levels) {
      throw new AppError(
        'Le modèle personnalisé n\'est pas configuré',
        400,
        'CUSTOM_MODEL_NOT_CONFIGURED'
      );
    }
    return {
      name: customModel.name || 'Personnalisé',
      description: customModel.description || '',
      icon: '⚙️',
      levels: customModel.levels,
      allowedChildren: customModel.allowedChildren || {},
    };
  }

  const model = HIERARCHY_MODELS[institutionType];
  if (!model) {
    throw new AppError(
      `Type d'institution inconnu : ${institutionType}`,
      400,
      'UNKNOWN_INSTITUTION_TYPE'
    );
  }
  return model;
};

/**
 * Récupère les niveaux disponibles (avec labels éventuellement personnalisés).
 * @param {string} institutionType
 * @param {object} customModel
 * @param {object} customLabels - Vocabulaire personnalisé
 * @returns {Array}
 */
const getLevels = (institutionType, customModel = null, customLabels = null) => {
  const model = getModel(institutionType, customModel);

  // Appliquer les labels personnalisés si fournis
  if (customLabels && typeof customLabels === 'object') {
    return model.levels.map((level) => ({
      ...level,
      label: customLabels[level.type]?.label || level.label,
      pluralLabel: customLabels[level.type]?.pluralLabel || level.pluralLabel,
    }));
  }

  return model.levels;
};

/**
 * Vérifie si un type d'unité peut être enfant d'un autre.
 * @param {string} institutionType
 * @param {object} customModel
 * @param {string} parentType
 * @param {string} childType
 * @returns {boolean}
 */
const isValidParentChild = (institutionType, customModel, parentType, childType) => {
  const model = getModel(institutionType, customModel);
  if (!parentType) return true; // Pas de parent = racine

  const allowed = model.allowedChildren[parentType] || [];
  return allowed.includes(childType);
};

/**
 * Récupère les types d'enfants autorisés pour un type donné.
 */
const getAllowedChildren = (institutionType, customModel, parentType) => {
  const model = getModel(institutionType, customModel);
  return model.allowedChildren[parentType] || [];
};

/**
 * Retourne le label d'un type d'unité selon le modèle.
 */
const getLabelForType = (institutionType, customModel, type) => {
  const levels = getLevels(institutionType, customModel);
  const level = levels.find((l) => l.type === type);
  return level ? level.label : type;
};

/**
 * Liste tous les modèles prédéfinis (pour l'UI).
 */
const getAllPresets = () => {
  return Object.entries(HIERARCHY_MODELS).map(([key, model]) => ({
    key,
    name: model.name,
    description: model.description,
    icon: model.icon,
    levelsCount: model.levels.length,
  }));
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  HIERARCHY_MODELS,
  getModel,
  getLevels,
  isValidParentChild,
  getAllowedChildren,
  getLabelForType,
  getAllPresets,
};