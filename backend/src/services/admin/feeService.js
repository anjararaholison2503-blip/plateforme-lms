const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// TYPES DE FRAIS
// ═══════════════════════════════════════════════════════════

exports.getAllFeeTypes = async (filters = {}) => {
  const where = {};
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring === 'true';

  return prisma.feeType.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { fees: true } } },
  });
};

exports.getFeeTypeById = async (id) => {
  const feeType = await prisma.feeType.findUnique({
    where: { id },
    include: { fees: { orderBy: { academicYear: 'desc' } } },
  });

  if (!feeType) {
    throw new AppError('Type de frais introuvable', 404, 'FEE_TYPE_NOT_FOUND');
  }

  return feeType;
};

exports.createFeeType = async (data) => {
  if (data.code) {
    const existing = await prisma.feeType.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new AppError(
        `Le code "${data.code}" est déjà utilisé`,
        409,
        'DUPLICATE_FEE_TYPE_CODE'
      );
    }
  }

  return prisma.feeType.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description || null,
      isRecurring: data.isRecurring || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder || 0,
    },
  });
};

exports.updateFeeType = async (id, data) => {
  const existing = await prisma.feeType.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Type de frais introuvable', 404, 'FEE_TYPE_NOT_FOUND');
  }

  if (data.code && data.code !== existing.code) {
    const codeExists = await prisma.feeType.findUnique({
      where: { code: data.code },
    });
    if (codeExists) {
      throw new AppError('Ce code est déjà utilisé', 409, 'DUPLICATE_FEE_TYPE_CODE');
    }
  }

  return prisma.feeType.update({ where: { id }, data });
};

exports.deleteFeeType = async (id) => {
  const feeType = await prisma.feeType.findUnique({
    where: { id },
    include: { _count: { select: { fees: true } } },
  });

  if (!feeType) {
    throw new AppError('Type de frais introuvable', 404, 'FEE_TYPE_NOT_FOUND');
  }

  if (feeType._count.fees > 0) {
    throw new AppError(
      `Impossible de supprimer : ce type est utilisé par ${feeType._count.fees} frais.`,
      409,
      'FEE_TYPE_HAS_FEES'
    );
  }

  await prisma.feeType.delete({ where: { id } });
  return { message: 'Type de frais supprimé' };
};

// ═══════════════════════════════════════════════════════════
// FRAIS
// ═══════════════════════════════════════════════════════════

exports.getAllFees = async (filters = {}) => {
  const where = {};

  if (filters.feeTypeId) where.feeTypeId = parseInt(filters.feeTypeId);
  if (filters.academicYear) where.academicYear = filters.academicYear;
  if (filters.classId) where.classId = parseInt(filters.classId);
  if (filters.levelId) where.levelId = parseInt(filters.levelId);
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

  return prisma.fee.findMany({
    where,
    orderBy: [{ academicYear: 'desc' }, { createdAt: 'desc' }],
    include: {
      feeType: { select: { id: true, code: true, name: true, isRecurring: true } },
      class: { select: { id: true, name: true, code: true } },
      level: { select: { id: true, name: true, code: true } },
      _count: { select: { invoices: true } },
    },
  });
};

exports.getFeeById = async (id) => {
  const fee = await prisma.fee.findUnique({
    where: { id },
    include: {
      feeType: true,
      class: { select: { id: true, name: true, code: true } },
      level: { select: { id: true, name: true, code: true } },
      invoices: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  if (!fee) {
    throw new AppError('Frais introuvable', 404, 'FEE_NOT_FOUND');
  }

  return fee;
};

exports.createFee = async (data) => {
  const feeType = await prisma.feeType.findUnique({ where: { id: data.feeTypeId } });
  if (!feeType) {
    throw new AppError('Type de frais introuvable', 404, 'FEE_TYPE_NOT_FOUND');
  }

  if (data.classId) {
    const classUnit = await prisma.institutionUnit.findUnique({
      where: { id: data.classId },
    });
    if (!classUnit) {
      throw new AppError('Classe introuvable', 404, 'CLASS_NOT_FOUND');
    }
    if (classUnit.type !== 'CLASS') {
      throw new AppError('L\'unité n\'est pas une classe', 400, 'NOT_A_CLASS');
    }
  }

  return prisma.fee.create({
    data: {
      feeTypeId: data.feeTypeId,
      classId: data.classId || null,
      levelId: data.levelId || null,
      academicYear: data.academicYear,
      amount: data.amount,
      currency: data.currency || 'MGA',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || null,
    },
    include: {
      feeType: { select: { id: true, code: true, name: true, isRecurring: true } },
      class: { select: { id: true, name: true, code: true } },
    },
  });
};

exports.updateFee = async (id, data) => {
  const existing = await prisma.fee.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Frais introuvable', 404, 'FEE_NOT_FOUND');
  }

  const updateData = { ...data };
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

  return prisma.fee.update({ where: { id }, data: updateData });
};

exports.deleteFee = async (id) => {
  const fee = await prisma.fee.findUnique({
    where: { id },
    include: { _count: { select: { invoices: true } } },
  });

  if (!fee) {
    throw new AppError('Frais introuvable', 404, 'FEE_NOT_FOUND');
  }

  if (fee._count.invoices > 0) {
    throw new AppError(
      `Impossible de supprimer : ${fee._count.invoices} facture(s) liée(s).`,
      409,
      'FEE_HAS_INVOICES'
    );
  }

  await prisma.fee.delete({ where: { id } });
  return { message: 'Frais supprimé' };
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getFeeStats = async (academicYear = null) => {
  const where = academicYear ? { academicYear } : {};

  const [totalFeeTypes, totalFees, totalAmount, byYear] = await Promise.all([
    prisma.feeType.count({ where: { isActive: true } }),
    prisma.fee.count({ where: { ...where, isActive: true } }),
    prisma.fee.aggregate({
      where: { ...where, isActive: true },
      _sum: { amount: true },
    }),
    prisma.fee.groupBy({
      by: ['academicYear'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalFeeTypes,
    totalFees,
    totalAmount: totalAmount._sum.amount || 0,
    byYear: byYear.map((y) => ({
      academicYear: y.academicYear,
      count: y._count._all,
      totalAmount: y._sum.amount || 0,
    })),
  };
};