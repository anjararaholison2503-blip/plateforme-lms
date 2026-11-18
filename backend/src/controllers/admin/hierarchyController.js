const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const prisma = require('../../config/database');
const hierarchyModelsService = require('../../services/admin/hierarchyModelsService');

// ============ LECTURE ============

/**
 * GET /api/hierarchy/presets
 * Retourne les modèles prédéfinis disponibles.
 */
exports.getPresets = catchAsync(async (req, res) => {
  const presets = hierarchyModelsService.getAllPresets();
  res.json({ status: 'success', data: presets });
});

/**
 * GET /api/hierarchy/current
 * Retourne la configuration actuelle (type + labels).
 */
exports.getCurrent = catchAsync(async (req, res) => {
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    throw new AppError('Configuration introuvable', 404, 'SETTINGS_NOT_FOUND');
  }

  const levels = hierarchyModelsService.getLevels(
    settings.institutionType,
    settings.hierarchyModel,
    settings.customLabels
  );

  res.json({
    status: 'success',
    data: {
      institutionType: settings.institutionType,
      customModel: settings.hierarchyModel,
      customLabels: settings.customLabels,
      onboardingDone: settings.onboardingDone,
      model: {
        name: hierarchyModelsService.getModel(
          settings.institutionType,
          settings.hierarchyModel
        ).name,
        description: hierarchyModelsService.getModel(
          settings.institutionType,
          settings.hierarchyModel
        ).description,
        icon: hierarchyModelsService.getModel(
          settings.institutionType,
          settings.hierarchyModel
        ).icon,
      },
      levels,
    },
  });
});

/**
 * GET /api/hierarchy/can-change
 * Vérifie si le modèle peut être changé.
 */
exports.canChange = catchAsync(async (req, res) => {
  const unitsCount = await prisma.institutionUnit.count();
  res.json({
    status: 'success',
    data: {
      canChange: unitsCount === 0,
      reason: unitsCount > 0
        ? `Impossible de changer : ${unitsCount} unité(s) existe(nt) déjà`
        : null,
      unitsCount,
    },
  });
});

// ============ ÉCRITURE ============

/**
 * POST /api/hierarchy/setup
 * Configuration initiale : choisit le type + crée l'établissement.
 * Body : { institutionType, customModel?, customLabels?, establishment: { name, code, ... } }
 */
exports.setup = catchAsync(async (req, res) => {
  const { institutionType, customModel, customLabels, establishment } = req.body;

  if (!institutionType) {
    throw new AppError('Type d\'institution requis', 400, 'MISSING_TYPE');
  }

  if (!establishment || !establishment.name) {
    throw new AppError('Nom de l\'établissement requis', 400, 'MISSING_ESTABLISHMENT_NAME');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Chercher ou CRÉER les settings (au lieu de crasher)
    let settings = await tx.platformSettings.findFirst();
    
    if (!settings) {
      settings = await tx.platformSettings.create({
        data: {
          platformName: establishment.name,
          institutionType,
          hierarchyModel: customModel || null,
          customLabels: customLabels || null,
          onboardingDone: true,
        }
      });
    } else {
      settings = await tx.platformSettings.update({
        where: { id: settings.id },
        data: {
          institutionType,
          hierarchyModel: customModel || null,
          customLabels: customLabels || null,
          onboardingDone: true,
        },
      });
    }

    // 2. Créer l'établissement racine SEULEMENT s'il n'existe pas déjà
    let rootUnit = await tx.institutionUnit.findFirst({
      where: { type: 'ESTABLISHMENT', parentId: null }
    });

    if (!rootUnit) {
      rootUnit = await tx.institutionUnit.create({
        data: {
          name: establishment.name,
          code: establishment.code || 'ROOT',
          type: 'ESTABLISHMENT',
          description: establishment.description || null,
          parentId: null,
        },
      });
    }

    return { settings, rootUnit };
  });

  res.status(201).json({
    status: 'success',
    data: {
      settings: {
        institutionType: result.settings.institutionType,
        onboardingDone: result.settings.onboardingDone,
      },
      rootUnit: result.rootUnit,
    },
  });
});

/**
 * PUT /api/hierarchy/labels
 * Modifie le vocabulaire personnalisé (labels des types).
 * Body : { customLabels: { FACULTY: { label: 'Institut', pluralLabel: 'Instituts' }, ... } }
 */
exports.updateLabels = catchAsync(async (req, res) => {
  const { customLabels } = req.body;

  if (!customLabels || typeof customLabels !== 'object') {
    throw new AppError('customLabels requis', 400, 'MISSING_LABELS');
  }

  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    throw new AppError('Configuration introuvable', 404, 'SETTINGS_NOT_FOUND');
  }

  const updated = await prisma.platformSettings.update({
    where: { id: settings.id },
    data: { customLabels },
  });

  res.json({
    status: 'success',
    data: { customLabels: updated.customLabels },
  });
});

/**
 * PUT /api/hierarchy/model
 * Change le type d'institution (seulement si aucune unité n'existe).
 */
exports.changeModel = catchAsync(async (req, res) => {
  const { institutionType, customModel } = req.body;

  const unitsCount = await prisma.institutionUnit.count();
  if (unitsCount > 0) {
    throw new AppError(
      `Impossible de changer : ${unitsCount} unité(s) existe(nt) déjà. ` +
      `Supprimez-les d'abord.`,
      409,
      'UNITS_EXIST'
    );
  }

  if (!institutionType) {
    throw new AppError('Type requis', 400, 'MISSING_TYPE');
  }

  // Valider le modèle
  hierarchyModelsService.getModel(institutionType, customModel);

  const settings = await prisma.platformSettings.findFirst();
  const updated = await prisma.platformSettings.update({
    where: { id: settings.id },
    data: { institutionType, hierarchyModel: customModel || null },
  });

  res.json({
    status: 'success',
    data: {
      institutionType: updated.institutionType,
      customModel: updated.hierarchyModel,
    },
  });
});