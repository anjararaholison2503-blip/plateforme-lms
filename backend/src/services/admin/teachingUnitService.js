const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

/**
 * Liste toutes les UE avec filtres et statistiques calculées.
 */
exports.getAllTeachingUnits = async (filters = {}) => {
  const where = {};

  if (filters.semester) where.semester = filters.semester;
  if (filters.unitId) where.unitId = parseInt(filters.unitId);

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { code: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [units, total] = await Promise.all([
    prisma.teachingUnit.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
      include: {
        unit: { select: { id: true, name: true, type: true, code: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        courses: {
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
            hours: true,
            coefficient: true,
            status: true,
            color: true,
          },
        },
        classes: {
          include: {
            class: {
              select: { id: true, name: true, code: true, type: true },
            },
          },
        },
      },
    }),
    prisma.teachingUnit.count({ where }),
  ]);

  // Calculer les totaux pour chaque UE
  const unitsWithTotals = units.map((u) => {
    const totalCredits = u.courses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const totalHours = u.courses.reduce((sum, c) => sum + (c.hours || 0), 0);
    const coursesCount = u.courses.length;
    const classesCount = u.classes.length;

    return {
      ...u,
      totalCredits,
      totalHours,
      coursesCount,
      classesCount,
    };
  });

  return {
    units: unitsWithTotals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Récupère une UE par ID avec tous ses détails.
 */
exports.getTeachingUnitById = async (id) => {
  const unit = await prisma.teachingUnit.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      courses: {
        orderBy: { code: 'asc' },
        include: {
          teachers: {
            include: {
              teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      },
      classes: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              _count: { select: { users: true } },
            },
          },
        },
      },
    },
  });

  if (!unit) {
    throw new AppError('Unité d\'enseignement introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');
  }

  const totalCredits = unit.courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalHours = unit.courses.reduce((sum, c) => sum + (c.hours || 0), 0);
  const totalStudents = unit.classes.reduce(
    (sum, cc) => sum + (cc.class._count?.users || 0),
    0
  );

  return {
    ...unit,
    totalCredits,
    totalHours,
    totalStudents,
  };
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

exports.createTeachingUnit = async (data, userId) => {
  // Vérifier que le code est unique
  if (data.code) {
    const existing = await prisma.teachingUnit.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new AppError(
        `Le code "${data.code}" est déjà utilisé`,
        409,
        'DUPLICATE_TEACHING_UNIT_CODE'
      );
    }
  }

  // Vérifier l'unité rattachée si fournie
  if (data.unitId) {
    const unit = await prisma.institutionUnit.findUnique({
      where: { id: data.unitId },
    });
    if (!unit) {
      throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
    }
  }

  return prisma.teachingUnit.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description || null,
      semester: data.semester || null,
      unitId: data.unitId || null,
      createdById: userId,
    },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR
// ═══════════════════════════════════════════════════════════

exports.updateTeachingUnit = async (id, data) => {
  const existing = await prisma.teachingUnit.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Unité d\'enseignement introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');
  }

  // Vérifier l'unicité du code
  if (data.code && data.code !== existing.code) {
    const codeExists = await prisma.teachingUnit.findUnique({
      where: { code: data.code },
    });
    if (codeExists) {
      throw new AppError('Ce code est déjà utilisé', 409, 'DUPLICATE_TEACHING_UNIT_CODE');
    }
  }

  return prisma.teachingUnit.update({
    where: { id },
    data,
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.deleteTeachingUnit = async (id) => {
  const unit = await prisma.teachingUnit.findUnique({
    where: { id },
    include: { _count: { select: { courses: true, classes: true } } },
  });

  if (!unit) {
    throw new AppError('Unité d\'enseignement introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');
  }

  if (unit._count.courses > 0) {
    throw new AppError(
      `Impossible de supprimer : cette UE contient ${unit._count.courses} matière(s). ` +
      `Retirez-les ou changez leur UE d'abord.`,
      409,
      'TEACHING_UNIT_HAS_COURSES'
    );
  }

  await prisma.teachingUnit.delete({ where: { id } });
  return { message: 'Unité d\'enseignement supprimée' };
};

// ═══════════════════════════════════════════════════════════
// GESTION DES MATIÈRES DANS L'UE
// ═══════════════════════════════════════════════════════════

/**
 * Ajouter une matière existante à une UE.
 */
exports.addCourseToUnit = async (teachingUnitId, courseId, coefficient = 1) => {
  const [unit, course] = await Promise.all([
    prisma.teachingUnit.findUnique({ where: { id: teachingUnitId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);

  if (!unit) throw new AppError('UE introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');
  if (!course) throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');

  if (course.teachingUnitId === teachingUnitId) {
    throw new AppError('Cette matière est déjà dans cette UE', 409, 'COURSE_ALREADY_IN_UNIT');
  }

  return prisma.course.update({
    where: { id: courseId },
    data: {
      teachingUnitId,
      coefficient: parseInt(coefficient) || 1,
    },
    select: {
      id: true,
      code: true,
      title: true,
      credits: true,
      hours: true,
      coefficient: true,
    },
  });
};

/**
 * Retirer une matière d'une UE.
 */
exports.removeCourseFromUnit = async (teachingUnitId, courseId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  if (course.teachingUnitId !== teachingUnitId) {
    throw new AppError('Cette matière n\'est pas dans cette UE', 400, 'COURSE_NOT_IN_UNIT');
  }

  return prisma.course.update({
    where: { id: courseId },
    data: { teachingUnitId: null, coefficient: 1 },
    select: { id: true, code: true, title: true },
  });
};

/**
 * Créer une nouvelle matière directement dans une UE.
 */
exports.createCourseInUnit = async (teachingUnitId, data, userId) => {
  const unit = await prisma.teachingUnit.findUnique({ where: { id: teachingUnitId } });
  if (!unit) throw new AppError('UE introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');

  if (data.code) {
    const existing = await prisma.course.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new AppError(
        `Le code "${data.code}" est déjà utilisé`,
        409,
        'DUPLICATE_COURSE_CODE'
      );
    }
  }

  return prisma.course.create({
    data: {
      title: data.title,
      code: data.code,
      description: data.description || null,
      credits: parseInt(data.credits) || 0,
      hours: parseInt(data.hours) || 0,
      coefficient: parseInt(data.coefficient) || 1,
      status: data.status || 'DRAFT',
      color: data.color || '#3B82F6',
      unitId: data.unitId || null,
      teachingUnitId,
      createdById: userId,
    },
    select: {
      id: true,
      code: true,
      title: true,
      credits: true,
      hours: true,
      coefficient: true,
      status: true,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// ATTRIBUTION UE → CLASSES
// ═══════════════════════════════════════════════════════════

/**
 * Attribuer une ou plusieurs classes à une UE.
 */
exports.assignClassesToUnit = async (teachingUnitId, classIds) => {
  const unit = await prisma.teachingUnit.findUnique({ where: { id: teachingUnitId } });
  if (!unit) throw new AppError('UE introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');

  // Vérifier que toutes les classes existent et sont bien de type CLASS
  const classes = await prisma.institutionUnit.findMany({
    where: { id: { in: classIds.map((id) => parseInt(id)) } },
  });

  if (classes.length !== classIds.length) {
    throw new AppError('Une ou plusieurs classes sont introuvables', 404, 'CLASSES_NOT_FOUND');
  }

  const notClass = classes.find((c) => c.type !== 'CLASS');
  if (notClass) {
    throw new AppError(
      `L'unité "${notClass.name}" n'est pas une classe`,
      400,
      'NOT_A_CLASS'
    );
  }

  // Créer les liens (ignorer les doublons)
  const results = [];
  for (const classId of classIds) {
    try {
      const link = await prisma.teachingUnitClass.create({
        data: {
          teachingUnitId,
          classId: parseInt(classId),
        },
        include: {
          class: { select: { id: true, name: true, code: true } },
        },
      });
      results.push(link);
    } catch (err) {
      if (err.code === 'P2002') {
        // Déjà attribué, on ignore
        continue;
      }
      throw err;
    }
  }

  return {
    message: `${results.length} classe(s) attribuée(s)`,
    assignments: results,
  };
};

/**
 * Retirer une classe d'une UE.
 */
exports.removeClassFromUnit = async (teachingUnitId, classId) => {
  const link = await prisma.teachingUnitClass.findUnique({
    where: {
      teachingUnitId_classId: {
        teachingUnitId,
        classId: parseInt(classId),
      },
    },
  });

  if (!link) {
    throw new AppError('Attribution introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  await prisma.teachingUnitClass.delete({
    where: {
      teachingUnitId_classId: {
        teachingUnitId,
        classId: parseInt(classId),
      },
    },
  });

  return { message: 'Classe retirée de l\'UE' };
};

/**
 * Lister les classes attribuées à une UE.
 */
exports.getUnitClasses = async (teachingUnitId) => {
  const unit = await prisma.teachingUnit.findUnique({ where: { id: teachingUnitId } });
  if (!unit) throw new AppError('UE introuvable', 404, 'TEACHING_UNIT_NOT_FOUND');

  return prisma.teachingUnitClass.findMany({
    where: { teachingUnitId },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          _count: { select: { users: true } },
        },
      },
    },
  });
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getTeachingUnitStats = async () => {
  const [total, bySemester, totalCourses, totalClasses] = await Promise.all([
    prisma.teachingUnit.count(),
    prisma.teachingUnit.groupBy({
      by: ['semester'],
      _count: { _all: true },
    }),
    prisma.course.count({ where: { teachingUnitId: { not: null } } }),
    prisma.teachingUnitClass.count(),
  ]);

  return {
    total,
    totalCourses,
    totalClasses,
    bySemester: bySemester.reduce(
      (acc, s) => ({ ...acc, [s.semester || 'NON_DEFINI']: s._count._all }),
      {}
    ),
  };
};