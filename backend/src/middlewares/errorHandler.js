const AppError = require('../errors/AppError');

const ERROR_MESSAGES = {
  // Prisma
  P2002: 'Cette ressource existe déjà',
  P2025: 'Ressource introuvable',
  P2003: 'Référence invalide',
  // Métier
  SETTINGS_NOT_FOUND: 'Configuration introuvable',
  INVALID_HIERARCHY: 'Hiérarchie invalide entre ces types d\'unités',
  UNIT_HAS_DEPENDENCIES: 'Cette unité contient des étudiants ou des cours',
  PARENT_NOT_FOUND: 'Unité parente introuvable',
  DUPLICATE_UNIT_CODE: 'Ce code d\'unité est déjà utilisé',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  UNAUTHORIZED: 'Authentification requise',
  FORBIDDEN: 'Accès refusé',
  VALIDATION_ERROR: 'Données invalides',
  INTERNAL_ERROR: 'Une erreur interne est survenue',
};

const errorHandler = (err, req, res, next) => {
  // Erreur Prisma - contrainte unique
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      code: 'P2002',
      message: ERROR_MESSAGES.P2002,
      details: err.meta,
    });
  }

  // Erreur Prisma - ressource introuvable
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      code: 'P2025',
      message: ERROR_MESSAGES.P2025,
    });
  }

  // Erreur de validation express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: err.details,
    });
  }

  // Erreur opérationnelle connue
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.errorCode || 'OPERATIONAL_ERROR',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Erreur inattendue
  console.error('❌ ERREUR INATTENDUE:', err);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: ERROR_MESSAGES.INTERNAL_ERROR,
  });
};

module.exports = errorHandler;