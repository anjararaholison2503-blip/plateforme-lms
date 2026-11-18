const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

/**
 * Liste des devoirs d'un cours (pour enseignant/admin)
 */
exports.getCourseAssignments = async (courseId, user) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, code: true },
  });

  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  const where = { courseId };

  // Un étudiant ne voit que les devoirs publiés/fermés/archivés
  if (user.role === 'STUDENT') {
    where.status = { in: ['PUBLISHED', 'CLOSED', 'ARCHIVED'] };
  }

  const assignments = await prisma.assignment.findMany({
    where,
    orderBy: [{ dueDate: 'desc' }],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { submissions: true } },
      submissions:
        user.role === 'STUDENT'
          ? { where: { studentId: user.id } }
          : undefined,
    },
  });

  // Pour les étudiants, ajouter des infos contextuelles
  if (user.role === 'STUDENT') {
    return assignments.map((a) => ({
      ...a,
      mySubmission: a.submissions?.[0] || null,
    }));
  }

  return assignments;
};

/**
 * Détails d'un devoir
 */
exports.getAssignmentById = async (id, user) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      submissions:
        user.role === 'STUDENT'
          ? { where: { studentId: user.id } }
          : {
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    matricule: true,
                  },
                },
                gradedBy: { select: { id: true, firstName: true, lastName: true } },
              },
            },
    },
  });

  if (!assignment) {
    throw new AppError('Devoir introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  // Vérifier l'accès pour les étudiants
  if (user.role === 'STUDENT' && assignment.status === 'DRAFT') {
    throw new AppError('Accès refusé', 403, 'FORBIDDEN');
  }

  return assignment;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION (Enseignant/Admin)
// ═══════════════════════════════════════════════════════════

exports.createAssignment = async (courseId, data, userId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new AppError('Cours introuvable', 404, 'COURSE_NOT_FOUND');
  }

  const dueDate = new Date(data.dueDate);
  if (isNaN(dueDate.getTime())) {
    throw new AppError('Date limite invalide', 400, 'INVALID_DATE');
  }

  return prisma.assignment.create({
    data: {
      courseId,
      title: data.title,
      instructions: data.instructions,
      dueDate,
      maxScore: data.maxScore || 20,
      attachmentUrl: data.attachmentUrl || null,
      attachmentName: data.attachmentName || null,
      attachmentSize: data.attachmentSize || null,
      allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : true,
      allowResubmission: data.allowResubmission || false,
      status: data.status || 'DRAFT',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      createdById: userId,
    },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR
// ═══════════════════════════════════════════════════════════

exports.updateAssignment = async (id, data) => {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Devoir introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  const updateData = { ...data };

  if (data.dueDate) {
    updateData.dueDate = new Date(data.dueDate);
  }

  // Si on publie pour la première fois
  if (data.status === 'PUBLISHED' && existing.status === 'DRAFT' && !existing.publishedAt) {
    updateData.publishedAt = new Date();
  }

  return prisma.assignment.update({
    where: { id },
    data: updateData,
  });
};

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.deleteAssignment = async (id) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });

  if (!assignment) {
    throw new AppError('Devoir introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  if (assignment._count.submissions > 0) {
    throw new AppError(
      `Impossible de supprimer : ${assignment._count.submissions} soumission(s) existent`,
      409,
      'HAS_SUBMISSIONS'
    );
  }

  await prisma.assignment.delete({ where: { id } });
  return { message: 'Devoir supprimé' };
};

// ═══════════════════════════════════════════════════════════
// SOUMISSION (Étudiant)
// ═══════════════════════════════════════════════════════════

exports.submitAssignment = async (assignmentId, data, studentId) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new AppError('Devoir introuvable', 404, 'ASSIGNMENT_NOT_FOUND');
  }

  // Vérifier si déjà soumis
  const existing = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, studentId },
  });

  if (existing && !assignment.allowResubmission) {
    throw new AppError('Vous avez déjà soumis ce devoir', 400, 'ALREADY_SUBMITTED');
  }

  // Vérifier retard
  const isLate = new Date() > new Date(assignment.dueDate);
  if (isLate && !assignment.allowLateSubmission) {
    throw new AppError('Date limite dépassée', 400, 'DEADLINE_PASSED');
  }

  // Créer ou mettre à jour la soumission
  let submission;
  if (existing) {
    submission = await prisma.assignmentSubmission.update({
      where: { id: existing.id },
      data: {
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        isLate,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        aiDetectionStatus: 'PENDING',
        aiDetectionScore: null,
        aiDetectionDetails: null,
      },
    });
  } else {
    submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        isLate,
        status: 'SUBMITTED',
      },
    });
  }

  // ═══ LANCER L'ANALYSE IA EN ARRIÈRE-PLAN ═══
  // const aiDetectionService = require('../aiDetectionService');
  // aiDetectionService
  //   .runDetectionForSubmission(submission.id)
  //   .catch((err) => console.error('[AIDetection] Lancement échoué:', err));
  // ═══ LANCER L'ANALYSE IA EN ARRIÈRE-PLAN ═══
  console.log('🔍 [DEBUG] Lancement IA pour submission', submission.id);
  console.log('🔍 [DEBUG] fileUrl:', submission.fileUrl);
  console.log('🔍 [DEBUG] mimeType:', submission.mimeType);

  const aiDetectionService = require('../aiDetectionService');
  aiDetectionService
    .runDetectionForSubmission(submission.id)
    .then(() => console.log('✅ [DEBUG] IA terminée'))
    .catch((err) => console.error('❌ [DEBUG] IA erreur:', err));

  return submission;
};

// ═══════════════════════════════════════════════════════════
// NOTATION (Enseignant)
// ═══════════════════════════════════════════════════════════

exports.gradeSubmission = async (submissionId, data, teacherId) => {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });

  if (!submission) {
    throw new AppError('Soumission introuvable', 404, 'SUBMISSION_NOT_FOUND');
  }

  if (data.score < 0 || data.score > submission.assignment.maxScore) {
    throw new AppError(
      `La note doit être comprise entre 0 et ${submission.assignment.maxScore}`,
      400,
      'INVALID_SCORE'
    );
  }

  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score: data.score,
      feedback: data.feedback || null,
      gradedAt: new Date(),
      gradedById: teacherId,
      status: 'GRADED',
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      gradedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

/**
 * Retourner le travail à l'étudiant
 */
exports.returnSubmission = async (submissionId) => {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new AppError('Soumission introuvable', 404, 'SUBMISSION_NOT_FOUND');
  }

  if (submission.status !== 'GRADED') {
    throw new AppError(
      'Le travail doit être noté avant d\'être retourné',
      400,
      'NOT_GRADED'
    );
  }

  return prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'RETURNED',
      returnedAt: new Date(),
    },
  });
};

// ═══════════════════════════════════════════════════════════
// MES DEVOIRS (Étudiant)
// ═══════════════════════════════════════════════════════════

exports.getMyAssignments = async (studentId) => {
  // Récupérer les cours de l'étudiant
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { unitId: true },
  });

  if (!student?.unitId) {
    return [];
  }

  // Trouver les cours attribués à la classe de l'étudiant
  const courseClasses = await prisma.courseClass.findMany({
    where: { classId: student.unitId },
    select: { courseId: true },
  });

  const courseIds = courseClasses.map((cc) => cc.courseId);

  if (courseIds.length === 0) {
    return [];
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      courseId: { in: courseIds },
      status: { in: ['PUBLISHED', 'CLOSED', 'ARCHIVED'] },
    },
    orderBy: { dueDate: 'desc' },
    include: {
      course: { select: { id: true, title: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      submissions: { where: { studentId } },
    },
  });

  return assignments.map((a) => ({
    ...a,
    mySubmission: a.submissions[0] || null,
  }));
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getCourseAssignmentStats = async (courseId) => {
  const [total, byStatus, totalSubmissions, gradedSubmissions] = await Promise.all([
    prisma.assignment.count({ where: { courseId } }),
    prisma.assignment.groupBy({
      by: ['status'],
      where: { courseId },
      _count: { _all: true },
    }),
    prisma.assignmentSubmission.count({
      where: { assignment: { courseId } },
    }),
    prisma.assignmentSubmission.count({
      where: {
        assignment: { courseId },
        status: { in: ['GRADED', 'RETURNED'] },
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
    totalSubmissions,
    gradedSubmissions,
    pendingGrading: totalSubmissions - gradedSubmissions,
  };
};