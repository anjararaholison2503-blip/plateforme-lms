const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.getAllAcademicYears = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { label: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  return prisma.academicYear.findMany({
    where,
    orderBy: [{ startDate: 'desc' }],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: {
        select: {
          studentEnrollments: true,
          invoices: true,
        },
      },
    },
  });
};

exports.getAcademicYearById = async (id) => {
  const year = await prisma.academicYear.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: {
        select: {
          studentEnrollments: true,
          invoices: true,
        },
      },
    },
  });

  if (!year) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  return year;
};

exports.getActiveAcademicYear = async () => {
  const year = await prisma.academicYear.findFirst({
    where: { status: 'ACTIVE' },
  });

  return year;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

exports.createAcademicYear = async (data, userId) => {
  // Vérifier l'unicité du label
  const existing = await prisma.academicYear.findUnique({
    where: { label: data.label },
  });

  if (existing) {
    throw new AppError(
      `L'année "${data.label}" existe déjà`,
      409,
      'DUPLICATE_LABEL'
    );
  }

  // Vérifier la cohérence des dates
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Dates invalides', 400, 'INVALID_DATES');
  }

  if (end <= start) {
    throw new AppError(
      'La date de fin doit être après la date de début',
      400,
      'INVALID_DATE_RANGE'
    );
  }

  // Si c'est la première année, la rendre active par défaut
  const count = await prisma.academicYear.count();
  const isFirst = count === 0;

  return prisma.academicYear.create({
    data: {
      label: data.label,
      startDate: start,
      endDate: end,
      status: isFirst ? 'ACTIVE' : (data.status || 'PLANNED'),
      description: data.description || null,
      isDefault: isFirst,
      hasSemesters: data.hasSemesters || false,
      semester1Start: data.semester1Start ? new Date(data.semester1Start) : null,
      semester1End: data.semester1End ? new Date(data.semester1End) : null,
      semester2Start: data.semester2Start ? new Date(data.semester2Start) : null,
      semester2End: data.semester2End ? new Date(data.semester2End) : null,
      registrationOpenDate: data.registrationOpenDate ? new Date(data.registrationOpenDate) : null,
      registrationCloseDate: data.registrationCloseDate ? new Date(data.registrationCloseDate) : null,
      reenrollmentDeadline: data.reenrollmentDeadline ? new Date(data.reenrollmentDeadline) : null,
      createdById: userId,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR
// ═══════════════════════════════════════════════════════════

exports.updateAcademicYear = async (id, data) => {
  const existing = await prisma.academicYear.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  // Vérifier l'unicité si le label change
  if (data.label && data.label !== existing.label) {
    const labelExists = await prisma.academicYear.findUnique({
      where: { label: data.label },
    });
    if (labelExists) {
      throw new AppError('Ce label est déjà utilisé', 409, 'DUPLICATE_LABEL');
    }
  }

  // Convertir les dates
  const updateData = { ...data };
  ['startDate', 'endDate', 'semester1Start', 'semester1End', 'semester2Start', 'semester2End', 'registrationOpenDate', 'registrationCloseDate', 'reenrollmentDeadline']
    .forEach((field) => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field]);
      }
    });

  return prisma.academicYear.update({ where: { id }, data: updateData });
};

// ═══════════════════════════════════════════════════════════
// CHANGEMENT DE STATUT
// ═══════════════════════════════════════════════════════════

exports.activateAcademicYear = async (id) => {
  const year = await prisma.academicYear.findUnique({ where: { id } });
  if (!year) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  if (year.status === 'ARCHIVED') {
    throw new AppError(
      'Impossible d\'activer une année archivée',
      400,
      'CANNOT_ACTIVATE_ARCHIVED'
    );
  }

  // Désactiver toutes les autres années actives
  await prisma.academicYear.updateMany({
    where: { status: 'ACTIVE' },
    data: { status: 'CLOSED' },
  });

  // Activer cette année
  return prisma.academicYear.update({
    where: { id },
    data: { status: 'ACTIVE', isDefault: true },
  });
};

exports.closeAcademicYear = async (id) => {
  const year = await prisma.academicYear.findUnique({ where: { id } });
  if (!year) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  return prisma.academicYear.update({
    where: { id },
    data: { status: 'CLOSED' },
  });
};

exports.archiveAcademicYear = async (id) => {
  const year = await prisma.academicYear.findUnique({ where: { id } });
  if (!year) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  if (year.status === 'ACTIVE') {
    throw new AppError(
      'Impossible d\'archiver une année active. Fermez-la d\'abord.',
      400,
      'CANNOT_ARCHIVE_ACTIVE'
    );
  }

  return prisma.academicYear.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
};

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.deleteAcademicYear = async (id) => {
  const year = await prisma.academicYear.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          studentEnrollments: true,
          invoices: true,
        },
      },
    },
  });

  if (!year) {
    throw new AppError('Année académique introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  if (year.status === 'ACTIVE') {
    throw new AppError(
      'Impossible de supprimer une année active',
      400,
      'CANNOT_DELETE_ACTIVE'
    );
  }

  if (year._count.studentEnrollments > 0 || year._count.invoices > 0) {
    throw new AppError(
      'Impossible de supprimer : des données sont rattachées à cette année',
      409,
      'HAS_DATA'
    );
  }

  await prisma.academicYear.delete({ where: { id } });
  return { message: 'Année académique supprimée' };
};

// ═══════════════════════════════════════════════════════════
// DUPLICATION
// ═══════════════════════════════════════════════════════════

exports.duplicateAcademicYear = async (id, newLabel, userId) => {
  const source = await prisma.academicYear.findUnique({ where: { id } });
  if (!source) {
    throw new AppError('Année source introuvable', 404, 'ACADEMIC_YEAR_NOT_FOUND');
  }

  // Vérifier l'unicité du nouveau label
  const existing = await prisma.academicYear.findUnique({
    where: { label: newLabel },
  });
  if (existing) {
    throw new AppError('Ce label est déjà utilisé', 409, 'DUPLICATE_LABEL');
  }

  // Calculer les nouvelles dates (décalage d'un an)
  const oneYearLater = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  };

  return prisma.academicYear.create({
    data: {
      label: newLabel,
      startDate: oneYearLater(source.startDate),
      endDate: oneYearLater(source.endDate),
      status: 'PLANNED',
      description: `Copie de ${source.label}`,
      hasSemesters: source.hasSemesters,
      semester1Start: oneYearLater(source.semester1Start),
      semester1End: oneYearLater(source.semester1End),
      semester2Start: oneYearLater(source.semester2Start),
      semester2End: oneYearLater(source.semester2End),
      registrationOpenDate: oneYearLater(source.registrationOpenDate),
      registrationCloseDate: oneYearLater(source.registrationCloseDate),
      reenrollmentDeadline: oneYearLater(source.reenrollmentDeadline),
      createdById: userId,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getAcademicYearStats = async () => {
  const [total, byStatus, activeYear] = await Promise.all([
    prisma.academicYear.count(),
    prisma.academicYear.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.academicYear.findFirst({ where: { status: 'ACTIVE' } }),
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
    activeYear,
  };
};