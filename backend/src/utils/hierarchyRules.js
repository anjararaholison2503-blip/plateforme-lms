const AppError = require('../errors/AppError');
const prisma = require('../config/database');
const hierarchyModelsService = require('../services/admin/hierarchyModelsService');

/**
 * Récupère la configuration actuelle (modèle + labels personnalisés).
 */
async function getActiveModel() {
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    throw new AppError(
      'Configuration de la plateforme introuvable',
      500,
      'SETTINGS_NOT_FOUND'
    );
  }

  return {
    institutionType: settings.institutionType,
    customModel: settings.hierarchyModel,
    customLabels: settings.customLabels,
  };
}

/**
 * Vérifie si un type d'unité enfant peut être placé sous un type parent.
 */
async function isValidParentChild(parentType, childType) {
  const config = await getActiveModel();
  return hierarchyModelsService.isValidParentChild(
    config.institutionType,
    config.customModel,
    parentType,
    childType
  );
}

/**
 * Lance une erreur si la hiérarchie parent/enfant est invalide.
 */
async function assertValidHierarchy(parentType, childType) {
  const config = await getActiveModel();
  const isValid = hierarchyModelsService.isValidParentChild(
    config.institutionType,
    config.customModel,
    parentType,
    childType
  );

  if (!isValid) {
    const allowed = hierarchyModelsService.getAllowedChildren(
      config.institutionType,
      config.customModel,
      parentType
    );

    const allowedLabels = allowed
      .map((t) => hierarchyModelsService.getLabelForType(config.institutionType, config.customModel, t))
      .join(', ');

    const childLabel = hierarchyModelsService.getLabelForType(
      config.institutionType,
      config.customModel,
      childType
    );
    const parentLabel = hierarchyModelsService.getLabelForType(
      config.institutionType,
      config.customModel,
      parentType
    );

    throw new AppError(
      `Un(e) "${childLabel}" ne peut pas être placé(e) sous un(e) "${parentLabel}". ` +
      `Types autorisés : ${allowedLabels || 'aucun'}`,
      400,
      'INVALID_HIERARCHY'
    );
  }
}

/**
 * Vérifie qu'une unité n'est pas en train de devenir son propre descendant.
 */
function assertNoCircularReference(unitId, newParentId) {
  if (!newParentId) return;
  if (unitId === newParentId) {
    throw new AppError(
      'Une unité ne peut pas être son propre parent',
      400,
      'CIRCULAR_REFERENCE'
    );
  }
}

/**
 * Vérifie qu'un établissement (ESTABLISHMENT) est unique.
 */
async function assertSingleEstablishment(prismaClient, type) {
  if (type !== 'ESTABLISHMENT') return;

  const existing = await prismaClient.institutionUnit.findFirst({
    where: { type: 'ESTABLISHMENT' },
    select: { id: true, name: true },
  });

  if (existing) {
    throw new AppError(
      `Un établissement existe déjà : "${existing.name}". ` +
      `Un seul établissement racine est autorisé.`,
      409,
      'ESTABLISHMENT_ALREADY_EXISTS'
    );
  }
}

/**
 * Récupère le label d'un type d'unité selon le modèle actif.
 */
async function getTypeLabel(type) {
  const config = await getActiveModel();
  return hierarchyModelsService.getLabelForType(
    config.institutionType,
    config.customModel,
    type
  );
}

module.exports = {
  getActiveModel,
  isValidParentChild,
  assertValidHierarchy,
  assertNoCircularReference,
  assertSingleEstablishment,
  getTypeLabel,
};