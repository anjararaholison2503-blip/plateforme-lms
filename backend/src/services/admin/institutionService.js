const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

const {
  assertValidHierarchy,
  assertNoCircularReference,
  assertSingleEstablishment,
} = require('../../utils/hierarchyRules');

// ============ LECTURE ============

/**
 * Récupère toutes les unités actives (à plat, sans hiérarchie).
 */
exports.getAllUnits = async (filters = {}) => {
  const where = {};

  if (filters.type) where.type = filters.type;
  if (filters.parentId !== undefined) where.parentId = filters.parentId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.institutionUnit.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { children: true },
      },
    },
  });
};

/**
 * Récupère une unité par son ID avec ses relations.
 */
exports.getUnitById = async (id) => {
  const unit = await prisma.institutionUnit.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, type: true, code: true } },
      children: {
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      },
      _count: {
        select: { children: true },
      },
    },
  });

  if (!unit) {
    throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
  }

  return unit;
};

/**
 * Construit l'arbre hiérarchique complet.
 */
exports.getTree = async () => {
  const units = await prisma.institutionUnit.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      parentId: true,
      name: true,
      code: true,
      type: true,
      description: true,
      displayOrder: true,
      isActive: true,
      metadata: true,
    },
  });

  return buildTree(units);
};

/**
 * Fonction récursive interne pour construire l'arbre.
 */
function buildTree(units, parentId = null) {
  return units
    .filter((u) => u.parentId === parentId)
    .map((u) => ({
      ...u,
      children: buildTree(units, u.id),
    }));
}

// ============ CRÉATION ============

/**
 * Crée une nouvelle unité.
 */
exports.createUnit = async ({ name, code, type, parentId, description, displayOrder, metadata }) => {
  // 1. Vérifier que le code est unique (si fourni)
  if (code) {
    const existing = await prisma.institutionUnit.findUnique({
      where: { code },
    });
    if (existing) {
      throw new AppError(
        `Le code "${code}" est déjà utilisé par "${existing.name}"`,
        409,
        'DUPLICATE_UNIT_CODE'
      );
    }
  }

  // 2. Vérifier qu'un seul ESTABLISHMENT existe
  await assertSingleEstablishment(prisma, type);

  // 3. Vérifier la hiérarchie si un parent est fourni
  if (parentId) {
    const parent = await prisma.institutionUnit.findUnique({
      where: { id: parentId },
      select: { id: true, type: true, name: true },
    });

    if (!parent) {
      throw new AppError('Unité parente introuvable', 404, 'PARENT_NOT_FOUND');
    }

  await assertValidHierarchy(parent.type, type);
  }

  // 4. Créer l'unité
  return prisma.institutionUnit.create({
    data: {
      name,
      code: code || null,
      type,
      parentId: parentId || null,
      description: description || null,
      displayOrder: displayOrder ?? 0,
      metadata: metadata || null,
    },
  });
};

// ============ MISE À JOUR ============

/**
 * Met à jour une unité.
 */
exports.updateUnit = async (id, data) => {
  const existing = await prisma.institutionUnit.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
  }

  // Vérifier l'unicité du code si modifié
  if (data.code && data.code !== existing.code) {
    const codeExists = await prisma.institutionUnit.findUnique({
      where: { code: data.code },
    });
    if (codeExists) {
      throw new AppError(
        `Le code "${data.code}" est déjà utilisé`,
        409,
        'DUPLICATE_UNIT_CODE'
      );
    }
  }

  // Vérifier la hiérarchie si le parent change
  if (data.parentId !== undefined && data.parentId !== existing.parentId) {
    if (data.parentId) {
      const parent = await prisma.institutionUnit.findUnique({
        where: { id: data.parentId },
        select: { id: true, type: true },
      });

      if (!parent) {
        throw new AppError('Unité parente introuvable', 404, 'PARENT_NOT_FOUND');
      }

      assertNoCircularReference(id, data.parentId);

      // Vérifier que le nouveau parent n'est pas un descendant
      const isDescendant = await checkIsDescendant(id, data.parentId);
      if (isDescendant) {
        throw new AppError(
          'Impossible de déplacer une unité sous l\'un de ses propres descendants',
          400,
          'CIRCULAR_REFERENCE'
        );
      }

      assertValidHierarchy(parent.type, data.type || existing.type);
    }
  }

  return prisma.institutionUnit.update({
    where: { id },
    data,
  });
};

// ============ SUPPRESSION ============

/**
 * Vérifie les dépendances avant suppression.
 */
exports.checkDependencies = async (unitId) => {
  const descendants = await getDescendantIds(unitId);

  const [studentCount, courseCount, childrenCount] = await Promise.all([
    prisma.user.count({ where: { unitId: { in: descendants } } }),
    prisma.course ? prisma.course.count({ where: { unitId: { in: descendants } } }).catch(() => 0) : Promise.resolve(0),
    prisma.institutionUnit.count({ where: { parentId: { in: descendants } } }),
  ]);

  return {
    hasStudents: studentCount > 0,
    hasCourses: courseCount > 0,
    hasChildren: childrenCount > 0,
    studentCount,
    courseCount,
    childrenCount,
  };
};

/**
 * Supprime une unité (avec vérification des dépendances).
 */
exports.deleteUnit = async (id) => {
  const unit = await prisma.institutionUnit.findUnique({
    where: { id },
  });

  if (!unit) {
    throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
  }

  // Interdire la suppression de la racine
  if (unit.type === 'ESTABLISHMENT') {
    throw new AppError(
      'Impossible de supprimer l\'établissement racine',
      403,
      'CANNOT_DELETE_ROOT'
    );
  }

  const deps = await exports.checkDependencies(id);

  if (deps.hasStudents || deps.hasCourses || deps.hasChildren) {
    throw new AppError(
      `Impossible de supprimer : cette unité contient ` +
      `${deps.childrenCount} sous-unité(s), ` +
      `${deps.studentCount} étudiant(s) et ` +
      `${deps.courseCount} cours.`,
      409,
      'UNIT_HAS_DEPENDENCIES',
      deps
    );
  }

  await prisma.institutionUnit.delete({ where: { id } });

  return { message: 'Unité supprimée avec succès' };
};

// ============ DÉPLACEMENT ============

/**
 * Déplace une unité vers un nouveau parent.
 */
exports.moveUnit = async (id, newParentId) => {
  const unit = await prisma.institutionUnit.findUnique({
    where: { id },
  });

  if (!unit) {
    throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
  }

  if (unit.type === 'ESTABLISHMENT') {
    throw new AppError(
      'Impossible de déplacer l\'établissement racine',
      403,
      'CANNOT_MOVE_ROOT'
    );
  }

  if (newParentId) {
    const parent = await prisma.institutionUnit.findUnique({
      where: { id: newParentId },
      select: { id: true, type: true },
    });

    if (!parent) {
      throw new AppError('Nouveau parent introuvable', 404, 'PARENT_NOT_FOUND');
    }

    assertNoCircularReference(id, newParentId);

    const isDescendant = await checkIsDescendant(id, newParentId);
    if (isDescendant) {
      throw new AppError(
        'Impossible de déplacer une unité sous l\'un de ses descendants',
        400,
        'CIRCULAR_REFERENCE'
      );
    }

    assertValidHierarchy(parent.type, unit.type);
  }

  return prisma.institutionUnit.update({
    where: { id },
    data: { parentId: newParentId || null },
  });
};

// ============ STATISTIQUES ============

/**
 * Récupère des statistiques sur une unité.
 */
exports.getUnitStats = async (id) => {
  const unit = await prisma.institutionUnit.findUnique({
    where: { id },
    select: { id: true, name: true, type: true, code: true },
  });

  if (!unit) {
    throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
  }

  const descendants = await getDescendantIds(id);

  const [studentCount, teacherCount, childrenCount] = await Promise.all([
    prisma.user.count({ where: { unitId: { in: descendants }, role: 'STUDENT' } }),
    prisma.user.count({ where: { unitId: { in: descendants }, role: 'TEACHER' } }),
    prisma.institutionUnit.count({ where: { parentId: { in: descendants } } }),
  ]);

  return {
    unit,
    stats: {
      studentCount,
      teacherCount,
      childrenCount,
      totalUnits: descendants.length,
    },
  };
};

// ============ UTILITAIRES INTERNES ============

/**
 * Récupère tous les IDs descendants d'une unité (BFS).
 */
async function getDescendantIds(unitId) {
  const ids = [unitId];
  const queue = [unitId];

  while (queue.length > 0) {
    const current = queue.shift();
    const children = await prisma.institutionUnit.findMany({
      where: { parentId: current },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    ids.push(...childIds);
    queue.push(...childIds);
  }

  return ids;
}

/**
 * Vérifie si `potentialDescendantId` est un descendant de `unitId`.
 */
async function checkIsDescendant(unitId, potentialDescendantId) {
  const descendants = await getDescendantIds(unitId);
  return descendants.includes(potentialDescendantId);
}