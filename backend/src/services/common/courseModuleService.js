const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════

/**
 * Récupérer tous les modules d'un cours (avec leurs leçons)
 */
exports.getCourseModules = async (courseId, userRole = 'STUDENT') => {
  const where = { courseId };

  // Les étudiants ne voient que les modules publiés
  if (userRole === 'STUDENT') {
    where.isPublished = true;
  }

  const modules = await prisma.courseModule.findMany({
    where,
    orderBy: { orderIndex: 'asc' },
    include: {
      lessons: {
        where: userRole === 'STUDENT' ? { isPublished: true } : {},
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return modules;
};

/**
 * Récupérer un module par ID
 */
exports.getModuleById = async (id) => {
  const module = await prisma.courseModule.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, code: true } },
      lessons: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!module) {
    throw new AppError('Module introuvable', 404, 'MODULE_NOT_FOUND');
  }

  return module;
};

/**
 * Créer un module
 */
exports.createModule = async (courseId, data) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  // Calculer l'ordre si non fourni
  let orderIndex = data.orderIndex;
  if (orderIndex === undefined || orderIndex === null) {
    const last = await prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  return prisma.courseModule.create({
    data: {
      courseId,
      title: data.title,
      description: data.description || null,
      orderIndex,
      duration: data.duration || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
  });
};

/**
 * Mettre à jour un module
 */
exports.updateModule = async (id, data) => {
  const module = await prisma.courseModule.findUnique({ where: { id } });
  if (!module) {
    throw new AppError('Module introuvable', 404, 'MODULE_NOT_FOUND');
  }

  return prisma.courseModule.update({
    where: { id },
    data,
  });
};

/**
 * Supprimer un module
 */
exports.deleteModule = async (id) => {
  const module = await prisma.courseModule.findUnique({
    where: { id },
    include: { _count: { select: { lessons: true } } },
  });

  if (!module) {
    throw new AppError('Module introuvable', 404, 'MODULE_NOT_FOUND');
  }

  await prisma.courseModule.delete({ where: { id } });

  return {
    message: `Module supprimé (${module._count.lessons} leçon(s) supprimée(s))`,
  };
};

/**
 * Réorganiser les modules (drag & drop)
 */
exports.reorderModules = async (courseId, moduleIds) => {
  const updates = moduleIds.map((id, index) =>
    prisma.courseModule.update({
      where: { id: parseInt(id) },
      data: { orderIndex: index },
    })
  );

  await prisma.$transaction(updates);

  return { message: 'Ordre mis à jour' };
};

// ═══════════════════════════════════════════════════════════
// LEÇONS
// ═══════════════════════════════════════════════════════════

/**
 * Récupérer une leçon par ID
 */
exports.getLessonById = async (id) => {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true, code: true } },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Leçon introuvable', 404, 'LESSON_NOT_FOUND');
  }

  return lesson;
};

/**
 * Créer une leçon
 */
exports.createLesson = async (moduleId, data) => {
  const module = await prisma.courseModule.findUnique({ where: { id: moduleId } });
  if (!module) {
    throw new AppError('Module introuvable', 404, 'MODULE_NOT_FOUND');
  }

  // Calculer l'ordre si non fourni
  let orderIndex = data.orderIndex;
  if (orderIndex === undefined || orderIndex === null) {
    const last = await prisma.courseLesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  return prisma.courseLesson.create({
    data: {
      moduleId,
      title: data.title,
      content: data.content || null,
      contentType: data.contentType || 'TEXT',
      videoUrl: data.videoUrl || null,
      duration: data.duration || null,
      orderIndex,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
  });
};

/**
 * Mettre à jour une leçon
 */
exports.updateLesson = async (id, data) => {
  const lesson = await prisma.courseLesson.findUnique({ where: { id } });
  if (!lesson) {
    throw new AppError('Leçon introuvable', 404, 'LESSON_NOT_FOUND');
  }

  return prisma.courseLesson.update({
    where: { id },
    data,
  });
};

/**
 * Supprimer une leçon
 */
exports.deleteLesson = async (id) => {
  const lesson = await prisma.courseLesson.findUnique({ where: { id } });
  if (!lesson) {
    throw new AppError('Leçon introuvable', 404, 'LESSON_NOT_FOUND');
  }

  await prisma.courseLesson.delete({ where: { id } });
  return { message: 'Leçon supprimée' };
};

/**
 * Réorganiser les leçons
 */
exports.reorderLessons = async (moduleId, lessonIds) => {
  const updates = lessonIds.map((id, index) =>
    prisma.courseLesson.update({
      where: { id: parseInt(id) },
      data: { orderIndex: index },
    })
  );

  await prisma.$transaction(updates);

  return { message: 'Ordre mis à jour' };
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getCourseProgramStats = async (courseId) => {
  const [modulesCount, lessonsCount, totalDuration] = await Promise.all([
    prisma.courseModule.count({ where: { courseId } }),
    prisma.courseLesson.count({
      where: { module: { courseId } },
    }),
    prisma.courseLesson.aggregate({
      where: { module: { courseId }, duration: { not: null } },
      _sum: { duration: true },
    }),
  ]);

  return {
    modulesCount,
    lessonsCount,
    totalDurationMinutes: totalDuration._sum.duration || 0,
  };
};