const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const matriculeService = require('./matriculeService');

const SALT_ROUNDS = 12;

// Liste des utilisateurs avec filtres + pagination
exports.getUsers = async (filters = {}) => {
  const where = {};

  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.unitId) where.unitId = parseInt(filters.unitId);

  // Recherche multi-champs (email, firstName, lastName)
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search } },
      { firstName: { contains: filters.search } },
      { lastName: { contains: filters.search } },
    ];
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        unitId: true,
        lastLoginAt: true,
        createdAt: true,
        unit: {
          select: { id: true, name: true, type: true, code: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Détails d'un utilisateur
exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      status: true,
      unitId: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      unit: {
        select: { id: true, name: true, type: true, code: true },
      },
    },
  });

  if (!user) {
    throw new AppError('Utilisateur introuvable', 404, 'USER_NOT_FOUND');
  }

  return user;
};

// Création d'un utilisateur (par un admin)
exports.createUser = async (data) => {
  const { email, password, firstName, lastName, phone, role, status } = data;

  // ═══ Convertir unitId en entier ═══
  const unitId = data.unitId ? parseInt(data.unitId) : null;

  // Vérifier l'unicité de l'email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Cet email est déjà utilisé', 409, 'EMAIL_ALREADY_EXISTS');
  }

  // Vérifier que l'unité existe si fournie
  if (unitId) {
    const unit = await prisma.institutionUnit.findUnique({
      where: { id: unitId },
    });
    // ...
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ═══════════════ GÉNÉRATION DU MATRICULE ═══════════════
  let matricule = null;
  const userRole = role || 'STUDENT';
  
  // Générer un matricule uniquement pour les étudiants
  if (userRole === 'STUDENT') {
    matricule = await matriculeService.generateMatricule();
  }
  // ═══════════════════════════════════════════════════════

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: userRole,
      status: status || 'ACTIVE',
      unitId: unitId || null,
      matricule,   // ← AJOUTER
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      unitId: true,
      matricule: true,   // ← AJOUTER
      createdAt: true,
    },
  });
};

// Mise à jour d'un utilisateur
exports.updateUser = async (id, data) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Utilisateur introuvable', 404, 'USER_NOT_FOUND');
  }
  // ═══ Convertir unitId en entier ═══
  if (data.unitId !== undefined) {
    data.unitId = data.unitId ? parseInt(data.unitId) : null;
  }
  // Email unique si modifié
  if (data.email && data.email !== existing.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      throw new AppError('Cet email est déjà utilisé', 409, 'EMAIL_ALREADY_EXISTS');
    }
  }

  // Vérifier l'unité si modifiée
  if (data.unitId) {
    const unit = await prisma.institutionUnit.findUnique({ where: { id: data.unitId } });
    if (!unit) {
      throw new AppError('Unité introuvable', 404, 'UNIT_NOT_FOUND');
    }
  }

  const updateData = { ...data };

  // Hacher le mot de passe si modifié
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  } else {
    delete updateData.password;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      unitId: true,
      updatedAt: true,
    },
  });
};

// Suppression d'un utilisateur
exports.deleteUser = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new AppError(
      'Vous ne pouvez pas supprimer votre propre compte',
      403,
      'CANNOT_DELETE_SELF'
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError('Utilisateur introuvable', 404, 'USER_NOT_FOUND');
  }

  // Supprimer les refresh tokens liés
  await prisma.refreshToken.deleteMany({ where: { userId: id } });

  await prisma.user.delete({ where: { id } });

  return { message: 'Utilisateur supprimé avec succès' };
};

// Changer le statut
exports.updateStatus = async (id, status) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Utilisateur introuvable', 404, 'USER_NOT_FOUND');
  }

  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, email: true, status: true },
  });
};

// Statistiques utilisateurs
exports.getUserStats = async () => {
  const [byRole, byStatus, total] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    }),
    prisma.user.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.user.count(),
  ]);

  return {
    total,
    byRole: byRole.reduce((acc, r) => ({ ...acc, [r.role]: r._count._all }), {}),
    byStatus: byStatus.reduce((acc, r) => ({ ...acc, [r.status]: r._count._all }), {}),
  };
};