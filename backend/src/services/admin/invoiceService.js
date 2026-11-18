const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCE
// ═══════════════════════════════════════════════════════════

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
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.getAllInvoices = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.studentId) where.studentId = parseInt(filters.studentId);
  if (filters.feeId) where.feeId = parseInt(filters.feeId);
  if (filters.enrollmentId) where.enrollmentId = parseInt(filters.enrollmentId);

  // Filtres par date
  if (filters.dueBefore || filters.dueAfter) {
    where.dueDate = {};
    if (filters.dueBefore) where.dueDate.lte = new Date(filters.dueBefore);
    if (filters.dueAfter) where.dueDate.gte = new Date(filters.dueAfter);
  }

  // Impayés
  if (filters.overdue === 'true') {
    where.status = { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] };
    where.dueDate = { lt: new Date() };
  }

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search } },
      { student: { firstName: { contains: filters.search } } },
      { student: { lastName: { contains: filters.search } } },
      { student: { email: { contains: filters.search } } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fee: {
          include: {
            feeType: { select: { id: true, code: true, name: true } },
          },
        },
        _count: { select: { payments: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getInvoiceById = async (id) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      fee: {
        include: {
          feeType: true,
        },
      },
      enrollment: {
        select: { id: true, reference: true, academicYear: true },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          receipt: true,
        },
      },
      reminders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  return invoice;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

exports.createInvoice = async (data) => {
  const [student, fee] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.studentId } }),
    prisma.fee.findUnique({ where: { id: data.feeId } }),
  ]);

  if (!student) throw new AppError('Étudiant introuvable', 404, 'STUDENT_NOT_FOUND');
  if (!fee) throw new AppError('Frais introuvable', 404, 'FEE_NOT_FOUND');

  const reference = await generateInvoiceReference();

  return prisma.invoice.create({
    data: {
      reference,
      studentId: data.studentId,
      feeId: data.feeId,
      enrollmentId: data.enrollmentId || null,
      amount: data.amount || fee.amount,
      currency: data.currency || fee.currency,
      status: data.status || 'DRAFT',
      dueDate: data.dueDate ? new Date(data.dueDate) : fee.dueDate || new Date(),
      notes: data.notes || null,
      installmentNo: data.installmentNo || null,
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      fee: { include: { feeType: true } },
    },
  });
};

/**
 * Génération de factures en masse pour une classe
 */
exports.bulkGenerateInvoices = async (classId, feeId, academicYear) => {
  const [classUnit, fee, settings] = await Promise.all([
    prisma.institutionUnit.findUnique({ where: { id: classId } }),
    prisma.fee.findUnique({ where: { id: feeId }, include: { feeType: true } }),
    prisma.platformSettings.findFirst(),
  ]);

  if (!classUnit) throw new AppError('Classe introuvable', 404, 'CLASS_NOT_FOUND');
  if (!fee) throw new AppError('Frais introuvable', 404, 'FEE_NOT_FOUND');

  // Trouver tous les étudiants de cette classe
  const students = await prisma.user.findMany({
    where: {
      unitId: classId,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  const invoices = [];
  const monthsCount = settings?.academicMonthsCount || 9;
  const startMonth = settings?.academicStartMonth || 10;

  for (const student of students) {
    if (fee.feeType.isRecurring) {
      // ═══════════════ FRAIS MENSUELS ═══════════════
      const monthlyAmount = Number(fee.amount) / monthsCount;
      const currentYear = parseInt(academicYear.split('-')[0]);

      for (let i = 0; i < monthsCount; i++) {
        const month = ((startMonth - 1 + i) % 12) + 1;
        const year = month < startMonth ? currentYear + 1 : currentYear;

        // Le 5 de chaque mois
        const dueDate = new Date(year, month - 1, 5);

        // Vérifier si la facture existe déjà
        const existing = await prisma.invoice.findFirst({
          where: {
            studentId: student.id,
            feeId,
            installmentNo: i + 1,
          },
        });

        if (existing) continue;

        const reference = await generateInvoiceReference();
        const invoice = await prisma.invoice.create({
          data: {
            reference,
            studentId: student.id,
            feeId,
            amount: monthlyAmount,
            currency: fee.currency,
            status: 'DRAFT',
            dueDate,
            installmentNo: i + 1,
            notes: `${fee.feeType.name} — Mois ${i + 1}/${monthsCount}`,
          },
        });

        invoices.push(invoice);
      }
    } else {
      // ═══════════════ FRAIS PONCTUEL ═══════════════
      const existing = await prisma.invoice.findFirst({
        where: {
          studentId: student.id,
          feeId,
        },
      });

      if (existing) continue;

      const reference = await generateInvoiceReference();
      const invoice = await prisma.invoice.create({
        data: {
          reference,
          studentId: student.id,
          feeId,
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

  return {
    count: invoices.length,
    total: students.length,
    monthsCount: fee.feeType.isRecurring ? monthsCount : 1,
    message: `${invoices.length} facture(s) générée(s) sur ${students.length} étudiant(s)`,
  };
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR
// ═══════════════════════════════════════════════════════════

exports.updateInvoice = async (id, data) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  const updateData = { ...data };
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

  return prisma.invoice.update({ where: { id }, data: updateData });
};

exports.updateInvoiceStatus = async (id, status) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  return prisma.invoice.update({
    where: { id },
    data: { status },
  });
};

exports.deleteInvoice = async (id) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { _count: { select: { payments: true } } },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  if (invoice._count.payments > 0) {
    throw new AppError(
      `Impossible de supprimer : ${invoice._count.payments} paiement(s) enregistré(s).`,
      409,
      'INVOICE_HAS_PAYMENTS'
    );
  }

  await prisma.invoice.delete({ where: { id } });
  return { message: 'Facture supprimée' };
};

// ═══════════════════════════════════════════════════════════
// FACTURES D'UN ÉTUDIANT
// ═══════════════════════════════════════════════════════════

exports.getStudentInvoices = async (studentId, filters = {}) => {
  const where = { studentId };

  if (filters.status) where.status = filters.status;
  if (filters.academicYear) {
    where.enrollment = { academicYear: filters.academicYear };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }],
    include: {
      fee: { include: { feeType: true } },
      payments: {
        where: { status: 'COMPLETED' },
        orderBy: { paidAt: 'desc' },
      },
      enrollment: { select: { id: true, reference: true, academicYear: true } },
    },
  });

  // Calculer le solde total
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const balance = totalAmount - totalPaid;

  return {
    invoices,
    summary: {
      totalAmount,
      totalPaid,
      balance,
      invoiceCount: invoices.length,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getInvoiceStats = async () => {
  const now = new Date();

  const [
    total,
    byStatus,
    totalAmount,
    totalPaid,
    overdueCount,
    overdueAmount,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({ _sum: { amount: true } }),
    prisma.invoice.aggregate({ _sum: { paidAmount: true } }),
    prisma.invoice.count({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        dueDate: { lt: now },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
    totalAmount: totalAmount._sum.amount || 0,
    totalPaid: totalPaid._sum.paidAmount || 0,
    totalBalance: Number(totalAmount._sum.amount || 0) - Number(totalPaid._sum.paidAmount || 0),
    overdue: {
      count: overdueCount,
      amount: overdueAmount._sum.amount || 0,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// EXPORT IMPAYÉS
// ═══════════════════════════════════════════════════════════

exports.getOverdueInvoices = async (filters = {}) => {
  const where = {
    status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    dueDate: { lt: new Date() },
  };

  if (filters.classId) {
    where.student = { unitId: parseInt(filters.classId) };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          unit: { select: { id: true, name: true, code: true } },
        },
      },
      fee: { include: { feeType: true } },
    },
  });

  // Calculer les jours de retard
  const now = new Date();
  const enriched = invoices.map((inv) => ({
    ...inv,
    daysOverdue: Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24)),
    balance: Number(inv.amount) - Number(inv.paidAmount),
  }));

  // Total
  const totalAmount = enriched.reduce((sum, inv) => sum + inv.balance, 0);

  return {
    invoices: enriched,
    summary: {
      count: enriched.length,
      totalAmount,
    },
  };
};