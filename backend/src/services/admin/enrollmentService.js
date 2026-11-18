const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const notificationService = require('../../services/common/notificationService');
const bcrypt = require('bcrypt'); // Ajoute cet import en haut si absent
const { sendApprovalEmail } = require('./emailService'); // Ajoute cet import en haut si absent


// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCE
// ═══════════════════════════════════════════════════════════

const generateEnrollmentReference = async () => {
  const year = new Date().getFullYear();
  const prefix = `INS-${year}-`;

  const lastEnrollment = await prisma.studentEnrollment.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let nextNumber = 1;
  if (lastEnrollment) {
    const lastNumber = parseInt(lastEnrollment.reference.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.getAllEnrollments = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.academicYear) where.academicYear = filters.academicYear;
  if (filters.studentId) where.studentId = parseInt(filters.studentId);
  if (filters.isReenrollment !== undefined) {
    where.isReenrollment = filters.isReenrollment === 'true';
  }
  if (filters.isRepeating !== undefined) {
    where.isRepeating = filters.isRepeating === 'true';
  }

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search } },
      { applicantName: { contains: filters.search } },
      { applicantEmail: { contains: filters.search } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    prisma.studentEnrollment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        desiredClass: {
          select: { id: true, name: true, code: true, type: true },
        },
        desiredProgram: {
          select: { id: true, name: true, code: true, type: true },
        },
        reviewedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { invoices: true } },
      },
    }),
    prisma.studentEnrollment.count({ where }),
  ]);

  return {
    enrollments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getEnrollmentById = async (id) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id },
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
      desiredClass: {
        select: { id: true, name: true, code: true, type: true },
      },
      desiredProgram: {
        select: { id: true, name: true, code: true, type: true },
      },
      reviewedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      finalDecisionBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      previousEnrollment: {
        select: { id: true, reference: true, academicYear: true },
      },
      invoices: {
        include: {
          fee: { include: { feeType: true } },
          payments: { where: { status: 'COMPLETED' } },
        },
      },
    },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  return enrollment;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

/**
 * Créer une demande d'inscription (en ligne ou par admin)
 */
exports.createEnrollment = async (data, userId = null) => {
  const reference = await generateEnrollmentReference();

  // Valider la classe désirée si fournie
  if (data.desiredClassId) {
    const classUnit = await prisma.institutionUnit.findUnique({
      where: { id: data.desiredClassId },
    });
    if (!classUnit) {
      throw new AppError('Classe souhaitée introuvable', 404, 'CLASS_NOT_FOUND');
    }
  }

  // Statut initial
  // - Si créé par admin → directement PENDING_PAYMENT (validation implicite)
  // - Si créé en ligne → PENDING_REVIEW (nécessite validation admin)
  const status = userId ? 'PENDING_PAYMENT' : 'PENDING_REVIEW';

  const enrollment = await prisma.studentEnrollment.create({
    data: {
      reference,
      applicantEmail: data.applicantEmail,
      applicantName: data.applicantName,
      personalInfo: data.personalInfo || {},
      contactInfo: data.contactInfo || {},
      documents: data.documents || null,
      previousEducation: data.previousEducation || null,
      desiredClassId: data.desiredClassId ? parseInt(data.desiredClassId) : null,
      desiredProgramId: data.desiredProgramId || null,
      status,
      academicYear: data.academicYear,
    },
    include: {
      desiredClass: { select: { id: true, name: true, code: true } },
      desiredProgram: { select: { id: true, name: true, code: true } },
    },
  });

  // Si créé par admin, générer immédiatement les factures
  if (userId && status === 'PENDING_PAYMENT') {
    await exports.generateInvoicesForEnrollment(enrollment.id);
  }

  return enrollment;
};

// ═══════════════════════════════════════════════════════════
// VALIDATION / REJET
// ═══════════════════════════════════════════════════════════

/**
 * Valider une inscription (admin)
 */
exports.approveEnrollment = async (id, data, userId) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  let studentId = enrollment.studentId;

  // ═══════════════════════════════════════════════════════════
  // 1. VÉRIFIER SI L'UTILISATEUR EXISTE VRAIMENT
  // ═══════════════════════════════════════════════════════════
  let student = null;
  
  if (studentId) {
    student = await prisma.user.findUnique({ where: { id: studentId } });
  }

  // Si l'étudiant n'existe pas (ou si studentId est null), on le crée
  if (!student) {
    // Chercher par email
    const existingUser = await prisma.user.findUnique({
      where: { email: enrollment.applicantEmail },
    });

    if (existingUser) {
      studentId = existingUser.id;
      student = existingUser;
      console.log(`✅ Utilisateur existant trouvé : ${enrollment.applicantEmail}`);
    } else {
      // Créer l'utilisateur
      const defaultPassword = 'password123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const nameParts = enrollment.applicantName.split(' ');
      const firstName = nameParts[0] || 'Étudiant';
      const lastName = nameParts.slice(1).join(' ') || 'Nouveau';

      const count = await prisma.user.count({ where: { role: 'STUDENT' } });
      const matricule = `ETU-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      student = await prisma.user.create({
        data: {
          email: enrollment.applicantEmail,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'STUDENT',
          status: 'ACTIVE',
          matricule,
          unitId: data.desiredClassId ? parseInt(data.desiredClassId) : null,
        },
      });

      studentId = student.id;
      console.log(`✅ Nouvel utilisateur créé : ${enrollment.applicantEmail} (ID: ${studentId})`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. METTRE À JOUR L'INSCRIPTION
  // ═══════════════════════════════════════════════════════════
  const updated = await prisma.studentEnrollment.update({
    where: { id: parseInt(id) },
    data: {
      status: 'PENDING_PAYMENT',
      studentId: studentId,
      reviewedById: userId,
      reviewedAt: new Date(),
      reviewNotes: data.reviewNotes || null,
      desiredClassId: data.desiredClassId ? parseInt(data.desiredClassId) : null,
    },
  });

  // ═══════════════════════════════════════════════════════════
  // 3. ENVOYER L'EMAIL
  // ═══════════════════════════════════════════════════════════
  await sendApprovalEmail(
    updated.applicantEmail,
    updated.applicantName,
    updated.reference
  );

  return updated;
};
/**
 * Rejeter une inscription (admin)
 */
exports.rejectEnrollment = async (id, reviewerId, reason) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  if (enrollment.status === 'ENROLLED' || enrollment.status === 'COMPLETED') {
    throw new AppError(
      'Impossible de rejeter une inscription déjà validée',
      400,
      'CANNOT_REJECT'
    );
  }

  return prisma.studentEnrollment.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DES FACTURES
// ═══════════════════════════════════════════════════════════

/**
 * Générer les factures pour une inscription
 * - Frais d'inscription (ponctuel)
 * - Frais de scolarité (échéancier mensuel)
 */
exports.generateInvoicesForEnrollment = async (enrollmentId) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { desiredClass: true },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  // L'étudiant doit être créé pour avoir des factures
  if (!enrollment.studentId) {
    console.log(`⏸️  Pas de facture générée pour ${enrollment.reference} (pas encore d'étudiant)`);
    return;
  }

  // Récupérer les frais applicables
  const fees = await prisma.fee.findMany({
    where: {
      academicYear: enrollment.academicYear,
      isActive: true,
      OR: [
        { classId: enrollment.desiredClassId },
        { levelId: enrollment.desiredClassId ? undefined : null }, // Pour plus tard
        { classId: null, levelId: null }, // Frais généraux
      ],
    },
    include: { feeType: true },
  });

  if (fees.length === 0) {
    console.log(`⚠️  Aucun frais défini pour ${enrollment.academicYear}`);
    return;
  }

  // Créer les factures
  const invoices = [];

  for (const fee of fees) {
    // Si le frais est mensuel, créer 10 échéances
    if (fee.feeType.isRecurring) {
      const monthlyAmount = fee.amount / 10; // 10 mensualités
      const startMonth = 9; // Octobre (0-indexé = 9)
      const currentYear = parseInt(enrollment.academicYear.split('-')[0]);

      for (let i = 0; i < 10; i++) {
        const month = (startMonth + i) % 12;
        const year = month < startMonth ? currentYear + 1 : currentYear;
        const dueDate = new Date(year, month, 5); // Le 5 de chaque mois

        const invoice = await prisma.invoice.create({
          data: {
            reference: await generateInvoiceReference(),
            studentId: enrollment.studentId,
            feeId: fee.id,
            enrollmentId: enrollment.id,
            amount: monthlyAmount,
            currency: fee.currency,
            status: 'SENT',
            dueDate,
            installmentNo: i + 1,
            notes: `${fee.feeType.name} - Mensualité ${i + 1}/10`,
          },
        });

        invoices.push(invoice);
      }
    } else {
      // Frais ponctuel
      const invoice = await prisma.invoice.create({
        data: {
          reference: await generateInvoiceReference(),
          studentId: enrollment.studentId,
          feeId: fee.id,
          enrollmentId: enrollment.id,
          amount: fee.amount,
          currency: fee.currency,
          status: 'DRAFT',
          dueDate: fee.dueDate || new Date(),
          notes: fee.feeType.name,
        },
      });

      invoices.push(invoice);
    }
  }

  console.log(`✅ ${invoices.length} facture(s) générée(s) pour ${enrollment.reference}`);
  return invoices;
};

// Génération de référence pour facture
const generateInvoiceReference = async () => {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;

  const last = await prisma.invoice.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let nextNumber = 1;
  if (last) {
    const lastNumber = parseInt(last.reference.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// ═══════════════════════════════════════════════════════════
// LIAISON ÉTUDIANT ↔ INSCRIPTION
// ═══════════════════════════════════════════════════════════

/**
 * Lier un étudiant à une inscription
 */
exports.linkStudentToEnrollment = async (enrollmentId, studentId) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  if (enrollment.studentId) {
    throw new AppError(
      'Cette inscription est déjà liée à un étudiant',
      400,
      'ALREADY_LINKED'
    );
  }

  return prisma.studentEnrollment.update({
    where: { id: enrollmentId },
    data: { studentId },
  });
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getEnrollmentStats = async (academicYear = null) => {
  const where = academicYear ? { academicYear } : {};

  const [
    total,
    byStatus,
    byYear,
    totalReenrollments,
    totalRepeaters,
  ] = await Promise.all([
    prisma.studentEnrollment.count({ where }),
    prisma.studentEnrollment.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.studentEnrollment.groupBy({
      by: ['academicYear'],
      _count: { _all: true },
    }),
    prisma.studentEnrollment.count({
      where: { ...where, isReenrollment: true },
    }),
    prisma.studentEnrollment.count({
      where: { ...where, isRepeating: true },
    }),
  ]);

  return {
    total,
    totalReenrollments,
    totalRepeaters,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
    byYear: byYear.reduce((acc, s) => ({ ...acc, [s.academicYear]: s._count._all }), {}),
  };
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════


/**
 * Supprimer une inscription
 */
exports.deleteEnrollment = async (id) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!enrollment) {
    throw new AppError('Inscription introuvable', 404, 'ENROLLMENT_NOT_FOUND');
  }

  // Optionnel : Empêcher la suppression si l'étudiant est déjà inscrit et a payé
  // if (enrollment.status === 'ENROLLED') {
  //   throw new AppError('Impossible de supprimer une inscription déjà finalisée', 400, 'CANNOT_DELETE');
  // }

  await prisma.studentEnrollment.delete({
    where: { id: parseInt(id) },
  });

  return { message: 'Inscription supprimée avec succès' };
};
module.exports = exports;