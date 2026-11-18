const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ============ COURS ============

// Liste des cours avec filtres
// Liste des cours avec filtres ET filtrage par rôle
exports.getCourses = async (filters = {}, currentUser = null) => {
  const where = {};

  // ═══════════════════════════════════════════════════════════
  // FILTRAGE PAR RÔLE (le cœur de la Phase 5.3.2)
  // ═══════════════════════════════════════════════════════════
  if (currentUser) {
    if (currentUser.role === 'TEACHER') {
      // Enseignant : uniquement les cours où il est assigné
      where.teachers = {
        some: { teacherId: currentUser.id },
      };
    } else if (currentUser.role === 'STUDENT') {
      // Étudiant : uniquement les cours attribués à sa classe
      if (currentUser.unitId) {
        where.classes = {
          some: { classId: currentUser.unitId },
        };
      } else {
        // Pas de classe → aucun cours
        where.id = -1;
      }
    }
    // ADMIN : pas de filtre supplémentaire
  }

  // ═══════════════════════════════════════════════════════════
  // FILTRES CLASSIQUES (query params)
  // ═══════════════════════════════════════════════════════════
  if (filters.status) where.status = filters.status;
  if (filters.teachingUnitId) where.teachingUnitId = parseInt(filters.teachingUnitId);
  if (filters.unitId) where.unitId = parseInt(filters.unitId);
  if (filters.teacherId) {
    where.teachers = { some: { teacherId: parseInt(filters.teacherId) } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { code: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        unit: { select: { id: true, name: true, type: true, code: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        teachers: {
          include: {
            teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        classes: {
          include: {
            class: { select: { id: true, name: true, code: true, type: true } },
          },
        },
        sessions: {
          select: {
            id: true,
            name: true,
            code: true,
            capacity: true,
            _count: { select: { enrollments: true } },
          },
        },
        _count: { select: { sessions: true, teachers: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  // Calculer le nombre total d'inscrits par cours
  const coursesWithCounts = courses.map((c) => {
    const enrolledCount = c.sessions.reduce(
      (sum, s) => sum + (s._count?.enrollments || 0),
      0
    );
    return { ...c, enrolledCount };
  });

  return {
    courses: coursesWithCounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Détails d'un cours
// Détails d'un cours (avec vérification des permissions)
exports.getCourseById = async (id, currentUser = null) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      teachers: {
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      classes: {
        include: {
          class: { select: { id: true, name: true, code: true, type: true } },
        },
      },
      sessions: {
        orderBy: { startDate: 'desc' },
        include: {
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  // ═══════════════════════════════════════════════════════════
  // VÉRIFICATION DES PERMISSIONS
  // ═══════════════════════════════════════════════════════════
  if (currentUser) {
    if (currentUser.role === 'TEACHER') {
      const isAssigned = course.teachers.some((t) => t.teacherId === currentUser.id);
      if (!isAssigned) {
        throw new AppError(
          'Vous n\'êtes pas assigné à ce cours',
          403,
          'FORBIDDEN'
        );
      }
    } else if (currentUser.role === 'STUDENT') {
      const classIds = course.classes.map((c) => c.classId);
      if (!classIds.includes(currentUser.unitId)) {
        throw new AppError(
          'Ce cours n\'est pas accessible pour votre classe',
          403,
          'FORBIDDEN'
        );
      }
    }
  }

  const enrolledCount = course.sessions.reduce(
    (sum, s) => sum + (s._count?.enrollments || 0),
    0
  );

  return { ...course, enrolledCount };
};

// Créer un cours
exports.createCourse = async (data, userId) => {
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

  if (data.unitId) {
    const unit = await prisma.institutionUnit.findUnique({ where: { id: data.unitId } });
    if (!unit) {
      throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
    }
  }

  return prisma.course.create({
    data: {
      title: data.title,
      code: data.code,
      description: data.description || null,
      credits: data.credits ?? 0,
      hours: data.hours ?? 0,
      status: data.status || 'DRAFT',
      color: data.color || '#3B82F6',
      coverUrl: data.coverUrl || null,
      unitId: data.unitId || null,
      createdById: userId,
    },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// Modifier un cours
exports.updateCourse = async (id, data) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  if (data.code && data.code !== existing.code) {
    const codeExists = await prisma.course.findUnique({ where: { code: data.code } });
    if (codeExists) {
      throw new AppError('Ce code est déjà utilisé', 409, 'DUPLICATE_COURSE_CODE');
    }
  }

  return prisma.course.update({
    where: { id },
    data,
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// Supprimer un cours
exports.deleteCourse = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sessions: {
        include: { _count: { select: { enrollments: true } } },
      },
    },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  const totalEnrollments = course.sessions.reduce(
    (sum, s) => sum + s._count.enrollments,
    0
  );

  if (totalEnrollments > 0) {
    throw new AppError(
      `Impossible de supprimer : ce cours a ${totalEnrollments} inscription(s)`,
      409,
      'COURSE_HAS_ENROLLMENTS'
    );
  }

  await prisma.course.delete({ where: { id } });
  return { message: 'Cours supprimé avec succès' };
};

// ═══════════════════════════════════════════════════════════
// GESTION DES CLASSES ATTRIBUÉES AU COURS
// ═══════════════════════════════════════════════════════════

/**
 * Attribuer une classe à un cours
 */
exports.addClassToCourse = async (courseId, classId) => {
  const [course, classUnit] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.institutionUnit.findUnique({ where: { id: classId } }),
  ]);

  if (!course) throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  if (!classUnit) throw new AppError('Classe introuvable', 404, 'CLASS_NOT_FOUND');

  if (classUnit.type !== 'CLASS') {
    throw new AppError(
      `L'unité "${classUnit.name}" n'est pas une classe (type: ${classUnit.type})`,
      400,
      'NOT_A_CLASS'
    );
  }

  const existing = await prisma.courseClass.findUnique({
    where: { courseId_classId: { courseId, classId } },
  });
  if (existing) {
    throw new AppError(
      'Cette classe est déjà attribuée à ce cours',
      409,
      'CLASS_ALREADY_ASSIGNED'
    );
  }

  return prisma.courseClass.create({
    data: { courseId, classId },
    include: {
      class: { select: { id: true, name: true, code: true, type: true } },
    },
  });
};

/**
 * Retirer une classe d'un cours
 */
exports.removeClassFromCourse = async (courseId, classId) => {
  const existing = await prisma.courseClass.findUnique({
    where: { courseId_classId: { courseId, classId } },
  });
  if (!existing) {
    throw new AppError('Attribution introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  await prisma.courseClass.delete({
    where: { courseId_classId: { courseId, classId } },
  });

  return { message: 'Classe retirée du cours' };
};

/**
 * Lister les classes attribuées à un cours
 */
exports.getCourseClasses = async (courseId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');

  return prisma.courseClass.findMany({
    where: { courseId },
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

// ============ SESSIONS ============

exports.getSessions = async (courseId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  return prisma.courseSession.findMany({
    where: { courseId },
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { enrollments: true } },
    },
  });
};

exports.createSession = async (courseId, data) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  if (data.code) {
    const existing = await prisma.courseSession.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new AppError(
        `Le code de session "${data.code}" est déjà utilisé`,
        409,
        'DUPLICATE_SESSION_CODE'
      );
    }
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Dates invalides', 400, 'INVALID_DATES');
  }
  if (end < start) {
    throw new AppError('La date de fin doit être après la date de début', 400, 'INVALID_DATE_RANGE');
  }

  return prisma.courseSession.create({
    data: {
      courseId,
      name: data.name,
      code: data.code,
      academicYear: data.academicYear,
      startDate: start,
      endDate: end,
      capacity: data.capacity || 30,
      description: data.description || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
    include: {
      _count: { select: { enrollments: true } },
    },
  });
};

exports.updateSession = async (sessionId, data) => {
  const session = await prisma.courseSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new AppError('Session introuvable', 404, 'SESSION_NOT_FOUND');
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  return prisma.courseSession.update({
    where: { id: sessionId },
    data: updateData,
    include: { _count: { select: { enrollments: true } } },
  });
};

exports.deleteSession = async (sessionId) => {
  const session = await prisma.courseSession.findUnique({
    where: { id: sessionId },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!session) {
    throw new AppError('Session introuvable', 404, 'SESSION_NOT_FOUND');
  }

  if (session._count.enrollments > 0) {
    throw new AppError(
      `Impossible de supprimer : ${session._count.enrollments} étudiant(s) inscrit(s)`,
      409,
      'SESSION_HAS_ENROLLMENTS'
    );
  }

  await prisma.courseSession.delete({ where: { id: sessionId } });
  return { message: 'Session supprimée' };
};

// ============ ENSEIGNANTS ============

exports.addTeacher = async (courseId, teacherId, role = 'MAIN') => {
  const [course, teacher] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: teacherId } }),
  ]);

  if (!course) throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  if (!teacher) throw new AppError('Enseignant introuvable', 404, 'TEACHER_NOT_FOUND');

  const existing = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
  if (existing) {
    throw new AppError(
      'Cet enseignant est déjà assigné à ce cours',
      409,
      'TEACHER_ALREADY_ASSIGNED'
    );
  }

  return prisma.courseTeacher.create({
    data: { courseId, teacherId, role },
    include: {
      teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
};

exports.removeTeacher = async (courseId, teacherId) => {
  const existing = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
  if (!existing) {
    throw new AppError('Assignation introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  await prisma.courseTeacher.delete({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
  return { message: 'Enseignant retiré du cours' };
};

// ============ INSCRIPTIONS ============

exports.getEnrollments = async (sessionId) => {
  const session = await prisma.courseSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new AppError('Session introuvable', 404, 'SESSION_NOT_FOUND');
  }

  return prisma.enrollment.findMany({
    where: { sessionId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  });
};

exports.enrollStudent = async (sessionId, studentId) => {
  const [session, student] = await Promise.all([
    prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.user.findUnique({ where: { id: studentId } }),
  ]);

  if (!session) throw new AppError('Session introuvable', 404, 'SESSION_NOT_FOUND');
  if (!student) throw new AppError('Étudiant introuvable', 404, 'STUDENT_NOT_FOUND');

  if (session._count.enrollments >= session.capacity) {
    throw new AppError(
      `La session est pleine (${session.capacity} places)`,
      409,
      'SESSION_FULL'
    );
  }

  const existing = await prisma.enrollment.findUnique({
    where: { sessionId_studentId: { sessionId, studentId } },
  });
  if (existing) {
    throw new AppError('Cet étudiant est déjà inscrit', 409, 'ALREADY_ENROLLED');
  }

  return prisma.enrollment.create({
    data: { sessionId, studentId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
};

exports.updateEnrollment = async (enrollmentId, data) => {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');

  const updateData = { ...data };
  if (data.status === 'COMPLETED' && !enrollment.completedAt) {
    updateData.completedAt = new Date();
  }

  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: updateData,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
};

exports.removeEnrollment = async (enrollmentId) => {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment) throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');

  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  return { message: 'Inscription supprimée' };
};

// ============ STATS ============

exports.getCourseStats = async () => {
  const [total, byStatus, totalEnrollments, totalSessions] = await Promise.all([
    prisma.course.count(),
    prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enrollment.count(),
    prisma.courseSession.count(),
  ]);

  return {
    total,
    totalEnrollments,
    totalSessions,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
  };
};