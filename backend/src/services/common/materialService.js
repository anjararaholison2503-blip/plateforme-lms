const fs = require('fs').promises;
const path = require('path');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const notificationService = require('./notificationService');

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

/**
 * Détecter le type de matériel à partir du MIME
 */
const detectMaterialType = (mimeType) => {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'].includes(mimeType)) return 'ZIP';
  if (mimeType.startsWith('text/') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint') || mimeType.includes('spreadsheet') || mimeType.includes('presentation')) return 'DOCUMENT';
  return 'OTHER';
};

/**
 * Calculer la date d'expiration
 */
const calculateExpirationDate = (durationValue, durationUnit) => {
  if (!durationValue || !durationUnit || durationUnit === 'never') return null;

  const now = new Date();
  const expiresAt = new Date(now);

  switch (durationUnit) {
    case 'days':
      expiresAt.setDate(expiresAt.getDate() + durationValue);
      break;
    case 'weeks':
      expiresAt.setDate(expiresAt.getDate() + durationValue * 7);
      break;
    case 'months':
      expiresAt.setMonth(expiresAt.getMonth() + durationValue);
      break;
    case 'years':
      expiresAt.setFullYear(expiresAt.getFullYear() + durationValue);
      break;
    default:
      return null;
  }

  return expiresAt;
};

/**
 * Supprimer un fichier physique
 */
const deletePhysicalFile = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    const filePath = path.join(__dirname, '../../', fileUrl);
    await fs.unlink(filePath);
    console.log(`🗑️ Fichier supprimé : ${fileUrl}`);
  } catch (err) {
    console.warn(`⚠️ Impossible de supprimer le fichier ${fileUrl}:`, err.message);
  }
};

// ═══════════════════════════════════════════════════════════
// CRÉATION / UPLOAD
// ═══════════════════════════════════════════════════════════

/**
 * Créer un matériel (upload)
 */
exports.createMaterial = async (file, data, userId) => {
  if (!file) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE');
  }

  // Vérifier que le cours existe
  const course = await prisma.course.findUnique({
    where: { id: parseInt(data.courseId) },
    select: { id: true, title: true, code: true },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  // Vérifier que l'utilisateur est autorisé (admin ou enseignant assigné)
  const isAdmin = data.userRole === 'ADMIN';
  if (!isAdmin) {
    const isTeacher = await prisma.courseTeacher.findUnique({
      where: {
        courseId_teacherId: {
          courseId: course.id,
          teacherId: userId,
        },
      },
    });

    if (!isTeacher) {
      throw new AppError(
        'Vous n\'êtes pas autorisé à déposer un support dans ce cours',
        403,
        'NOT_COURSE_TEACHER'
      );
    }
  }

// Construire l'URL publique du fichier
const relativePath = path.relative(
  path.join(__dirname, '../../'),
  file.path
).replace(/\\/g, '/');

// Nettoyer le chemin : enlever les /../ éventuels
const cleanPath = relativePath.replace(/^(\.\.\/)+/, '');
const fileUrl = `/${cleanPath}`;

  // Calculer la date d'expiration
  const durationValue = parseInt(data.durationValue) || 3;
  const durationUnit = data.durationUnit || 'months';
  const expiresAt = calculateExpirationDate(durationValue, durationUnit);

  // Détecter le type
  const type = data.type || detectMaterialType(file.mimetype);

  // Créer le matériel
  const material = await prisma.courseMaterial.create({
    data: {
      courseId: course.id,
      uploadedById: userId,
      title: data.title,
      description: data.description || null,
      type,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      visibility: data.visibility || 'STUDENTS',
      publishedAt: new Date(),
      expiresAt,
      expirationStatus: expiresAt ? 'ACTIVE' : 'ACTIVE',
    },
    include: {
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true, code: true } },
    },
  });

  // ═══════════════════════════════════════════════════════════
  // NOTIFIER LES ÉTUDIANTS DE LA CLASSE
  // ═══════════════════════════════════════════════════════════

  try {
    // Récupérer les classes attribuées au cours
    const courseClasses = await prisma.courseClass.findMany({
      where: { courseId: course.id },
      select: { classId: true },
    });

    const classIds = courseClasses.map((cc) => cc.classId);

    if (classIds.length > 0) {
      // Récupérer les étudiants de ces classes
      const students = await prisma.user.findMany({
        where: {
          unitId: { in: classIds },
          role: 'STUDENT',
          status: 'ACTIVE',
        },
        select: { id: true, email: true, firstName: true },
      });

      const studentIds = students.map((s) => s.id);

      if (studentIds.length > 0) {
        await notificationService.sendBulkNotifications(studentIds, {
          type: 'COURSE_ANNOUNCEMENT',
          title: `📚 Nouveau support : ${material.title}`,
          message: `Un nouveau support a été ajouté au cours "${course.title}"`,
          data: {
            materialId: material.id,
            courseId: course.id,
            courseCode: course.code,
          },
          materialId: material.id,
          channels: ['IN_APP', 'EMAIL'],
          emailTemplate: 'NEW_MATERIAL',
          emailData: {
            courseName: `${course.code} - ${course.title}`,
            materialTitle: material.title,
            materialType: type,
            uploaderName: `${material.uploadedBy.firstName} ${material.uploadedBy.lastName}`,
            actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/courses/${course.id}`,
          },
        });

        console.log(`📢 ${studentIds.length} étudiant(s) notifié(s)`);
      }
    }
  } catch (notifErr) {
    console.error('⚠️ Erreur notification :', notifErr.message);
    // Ne pas faire échouer l'upload si la notification plante
  }

  return material;
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

/**
 * Liste les matériels d'un cours
 */
exports.getCourseMaterials = async (courseId, user) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  const where = { courseId };

  // Filtrer selon le rôle
  if (user.role === 'STUDENT') {
    where.OR = [
      { visibility: 'STUDENTS' },
      { visibility: 'ALL' },
    ];
  } else if (user.role === 'TEACHER') {
    // Un enseignant voit ses propres brouillons + les supports publics
    where.OR = [
      { visibility: 'STUDENTS' },
      { visibility: 'TEACHERS' },
      { visibility: 'ALL' },
      { uploadedById: user.id },
    ];
  }
  // ADMIN voit tout

  return prisma.courseMaterial.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

/**
 * Détails d'un matériel
 */
exports.getMaterialById = async (id, user) => {
  const material = await prisma.courseMaterial.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true, code: true } },
    },
  });

  if (!material) {
    throw new AppError('Support introuvable', 404, 'MATERIAL_NOT_FOUND');
  }

  // Vérifier la visibilité
  if (user.role === 'STUDENT') {
    if (material.visibility === 'PRIVATE' || material.visibility === 'TEACHERS') {
      throw new AppError('Accès refusé', 403, 'FORBIDDEN');
    }
  }

  return material;
};

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

/**
 * Supprimer un matériel
 */
exports.deleteMaterial = async (id, user) => {
  const material = await prisma.courseMaterial.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!material) {
    throw new AppError('Support introuvable', 404, 'MATERIAL_NOT_FOUND');
  }

  // Vérifier les permissions
  const isAdmin = user.role === 'ADMIN';
  const isOwner = material.uploadedById === user.id;

  if (!isAdmin && !isOwner) {
    throw new AppError(
      'Vous n\'êtes pas autorisé à supprimer ce support',
      403,
      'FORBIDDEN'
    );
  }

  // Supprimer le fichier physique
  await deletePhysicalFile(material.fileUrl);

  // Notifier les étudiants si c'était un support étudiant
  if (material.visibility === 'STUDENTS' || material.visibility === 'ALL') {
    try {
      const courseClasses = await prisma.courseClass.findMany({
        where: { courseId: material.courseId },
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

        await notificationService.sendBulkNotifications(
          students.map((s) => s.id),
          {
            type: 'MATERIAL_DELETED',
            title: `🗑️ Support supprimé : ${material.title}`,
            message: `Le support "${material.title}" a été retiré du cours`,
            data: { courseId: material.courseId },
            channels: ['IN_APP'],
          }
        );
      }
    } catch (err) {
      console.warn('⚠️ Erreur notification suppression :', err.message);
    }
  }

  // Supprimer en base
  await prisma.courseMaterial.delete({ where: { id } });

  return { message: 'Support supprimé avec succès' };
};

// ═══════════════════════════════════════════════════════════
// PROLONGATION
// ═══════════════════════════════════════════════════════════

/**
 * Prolonger la durée d'un matériel
 */
exports.extendMaterial = async (id, user, durationValue, durationUnit) => {
  const material = await prisma.courseMaterial.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!material) {
    throw new AppError('Support introuvable', 404, 'MATERIAL_NOT_FOUND');
  }

  // Vérifier les permissions
  const isAdmin = user.role === 'ADMIN';
  const isOwner = material.uploadedById === user.id;

  if (!isAdmin && !isOwner) {
    throw new AppError('Accès refusé', 403, 'FORBIDDEN');
  }

  // Calculer la nouvelle date d'expiration
  // À partir de maintenant, pas de l'ancienne date
  const newExpiresAt = calculateExpirationDate(durationValue, durationUnit);

  const updated = await prisma.courseMaterial.update({
    where: { id },
    data: {
      expiresAt: newExpiresAt,
      expirationStatus: 'EXTENDED',
      gracePeriodEndsAt: null,
      expirationNotifiedAt: null,
    },
  });

  // Notifier les étudiants de la prolongation
  if (material.visibility === 'STUDENTS' || material.visibility === 'ALL') {
    try {
      const courseClasses = await prisma.courseClass.findMany({
        where: { courseId: material.courseId },
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

        await notificationService.sendBulkNotifications(
          students.map((s) => s.id),
          {
            type: 'MATERIAL_EXTENDED',
            title: `✅ Support prolongé : ${material.title}`,
            message: `Le support est maintenant disponible jusqu'au ${newExpiresAt?.toLocaleDateString('fr-FR') || 'illimité'}`,
            data: { courseId: material.courseId, materialId: material.id },
            channels: ['IN_APP'],
          }
        );
      }
    } catch (err) {
      console.warn('⚠️ Erreur notification prolongation :', err.message);
    }
  }

  return updated;
};

// ═══════════════════════════════════════════════════════════
// MAINTENANCE (utilisé par le CRON)
// ═══════════════════════════════════════════════════════════

/**
 * Supprimer les matériels expirés (appelé par CRON)
 */
exports.cleanupExpiredMaterials = async () => {
  const now = new Date();
  const graceThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // -7 jours

  // Trouver les matériels à supprimer (expirés depuis +7 jours)
  const toDelete = await prisma.courseMaterial.findMany({
    where: {
      expiresAt: { lte: graceThreshold },
      expirationStatus: { in: ['EXPIRED', 'PENDING_REVIEW'] },
    },
  });

  let deleted = 0;
  for (const material of toDelete) {
    await deletePhysicalFile(material.fileUrl);
    await prisma.courseMaterial.delete({ where: { id: material.id } });
    deleted++;
  }

  return { deleted };
};

module.exports = exports;