const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const notificationService = require('./notificationService');

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

/**
 * Liste des annonces d'un cours
 */
exports.getCourseAnnouncements = async (courseId, user) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, code: true },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  const where = { courseId };

  // Les étudiants ne voient pas les annonces expirées
  if (user.role === 'STUDENT') {
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ];
  }

  const announcements = await prisma.courseAnnouncement.findMany({
    where,
    orderBy: [
      { isPinned: 'desc' },    // épinglées en premier
      { createdAt: 'desc' },   // puis les plus récentes
    ],
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });

  return announcements;
};

/**
 * Récupérer une annonce par ID
 */
exports.getAnnouncementById = async (id, user) => {
  const announcement = await prisma.courseAnnouncement.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
      course: {
        select: { id: true, title: true, code: true },
      },
    },
  });

  if (!announcement) {
    throw new AppError('Annonce introuvable', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  // Les étudiants ne voient pas les annonces expirées
  if (user.role === 'STUDENT' && announcement.expiresAt) {
    if (new Date(announcement.expiresAt) < new Date()) {
      throw new AppError('Annonce expirée', 403, 'ANNOUNCEMENT_EXPIRED');
    }
  }

  return announcement;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

exports.createAnnouncement = async (courseId, data, userId, userRole) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, code: true },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  // Vérifier les permissions
  if (userRole !== 'ADMIN') {
    const isTeacher = await prisma.courseTeacher.findUnique({
      where: {
        courseId_teacherId: {
          courseId,
          teacherId: userId,
        },
      },
    });

    if (!isTeacher) {
      throw new AppError(
        'Vous n\'êtes pas autorisé à publier dans ce cours',
        403,
        'NOT_COURSE_TEACHER'
      );
    }
  }

  // Si épinglée, désépingler l'ancienne
  if (data.isPinned) {
    await prisma.courseAnnouncement.updateMany({
      where: { courseId, isPinned: true },
      data: { isPinned: false },
    });
  }

  // Parser la date d'expiration
  let expiresAt = null;
  if (data.expiresAt) {
    expiresAt = new Date(data.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      throw new AppError('Date d\'expiration invalide', 400, 'INVALID_DATE');
    }
    if (expiresAt < new Date()) {
      throw new AppError(
        'La date d\'expiration doit être dans le futur',
        400,
        'INVALID_EXPIRY_DATE'
      );
    }
  }

  const announcement = await prisma.courseAnnouncement.create({
    data: {
      courseId,
      authorId: userId,
      title: data.title,
      content: data.content,
      priority: data.priority || 'NORMAL',
      isPinned: data.isPinned || false,
      expiresAt,
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });

  // ═══════════════════════════════════════════════════════════
  // NOTIFIER LES ÉTUDIANTS
  // ═══════════════════════════════════════════════════════════
  try {
    const courseClasses = await prisma.courseClass.findMany({
      where: { courseId },
      select: { classId: true },
    });

    const classIds = courseClasses.map((cc) => cc.classId);

    if (classIds.length > 0) {
      const students = await prisma.user.findMany({
        where: {
          unitId: { in: classIds },
          role: 'STUDENT',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      const studentIds = students.map((s) => s.id);

      if (studentIds.length > 0) {
        const priorityLabel = {
          NORMAL: '📢',
          IMPORTANT: '⚠️',
          URGENT: '🚨',
        }[announcement.priority] || '📢';

        await notificationService.sendBulkNotifications(studentIds, {
          type: 'COURSE_ANNOUNCEMENT',
          title: `${priorityLabel} ${announcement.title}`,
          message: `Nouvelle annonce dans "${course.code} - ${course.title}"`,
          data: {
            announcementId: announcement.id,
            courseId,
            priority: announcement.priority,
          },
          channels: ['IN_APP', 'EMAIL'],
        });

        console.log(`📢 ${studentIds.length} étudiant(s) notifié(s) de l'annonce`);
      }
    }
  } catch (notifErr) {
    console.error('⚠️ Erreur notification annonce :', notifErr.message);
  }

  return announcement;
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR
// ═══════════════════════════════════════════════════════════

exports.updateAnnouncement = async (id, data, userId, userRole) => {
  const announcement = await prisma.courseAnnouncement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new AppError('Annonce introuvable', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  // Permissions : auteur ou admin
  if (announcement.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError(
      'Vous ne pouvez modifier que vos propres annonces',
      403,
      'FORBIDDEN'
    );
  }

  const updateData = { ...data };

  // Gérer l'épinglage
  if (data.isPinned === true && !announcement.isPinned) {
    // Désépingler l'ancienne
    await prisma.courseAnnouncement.updateMany({
      where: {
        courseId: announcement.courseId,
        isPinned: true,
        id: { not: id },
      },
      data: { isPinned: false },
    });
  }

  // Parser la date
  if (data.expiresAt !== undefined) {
    if (data.expiresAt === null || data.expiresAt === '') {
      updateData.expiresAt = null;
    } else {
      const expiresAt = new Date(data.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        throw new AppError('Date invalide', 400, 'INVALID_DATE');
      }
      updateData.expiresAt = expiresAt;
    }
  }

  return prisma.courseAnnouncement.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
  });
};

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.deleteAnnouncement = async (id, userId, userRole) => {
  const announcement = await prisma.courseAnnouncement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new AppError('Annonce introuvable', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  // Permissions
  if (announcement.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError(
      'Vous ne pouvez supprimer que vos propres annonces',
      403,
      'FORBIDDEN'
    );
  }

  await prisma.courseAnnouncement.delete({ where: { id } });

  return { message: 'Annonce supprimée' };
};

// ═══════════════════════════════════════════════════════════
// ÉPINGLAGE
// ═══════════════════════════════════════════════════════════

exports.togglePin = async (id, userId, userRole) => {
  const announcement = await prisma.courseAnnouncement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new AppError('Annonce introuvable', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  if (announcement.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('Accès refusé', 403, 'FORBIDDEN');
  }

  const newPinnedState = !announcement.isPinned;

  // Si on épingle, désépingler les autres
  if (newPinnedState) {
    await prisma.courseAnnouncement.updateMany({
      where: {
        courseId: announcement.courseId,
        isPinned: true,
        id: { not: id },
      },
      data: { isPinned: false },
    });
  }

  return prisma.courseAnnouncement.update({
    where: { id },
    data: { isPinned: newPinnedState },
  });
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getCourseAnnouncementStats = async (courseId) => {
  const [total, pinned, urgent, expired] = await Promise.all([
    prisma.courseAnnouncement.count({ where: { courseId } }),
    prisma.courseAnnouncement.count({ where: { courseId, isPinned: true } }),
    prisma.courseAnnouncement.count({ where: { courseId, priority: 'URGENT' } }),
    prisma.courseAnnouncement.count({
      where: {
        courseId,
        expiresAt: { lt: new Date() },
      },
    }),
  ]);

  return { total, pinned, urgent, expired };
};