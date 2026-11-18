const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const matriculeService = require('../admin/matriculeService');

const SALT_ROUNDS = 12;

// ============ GÉNÉRATION DES TOKENS ============

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (userId) => {
  // Générer un token aléatoire
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

  // Sauvegarder en base
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
};

// ============ INSCRIPTION ============

exports.register = async ({ email, password, firstName, lastName, role, unitId }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Cet email est déjà utilisé', 409, 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

const userRole = role || 'STUDENT';

// Générer un matricule pour les étudiants
let matricule = null;
if (userRole === 'STUDENT') {
  matricule = await matriculeService.generateMatricule();
}

const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: userRole,
    status: 'ACTIVE',
    unitId: unitId || null,
    matricule,
  },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    status: true,
    unitId: true,
    matricule: true,
    createdAt: true,
  },
});

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = await generateRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

// ============ CONNEXION ============

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(
      `Compte ${user.status.toLowerCase()}. Contactez l'administrateur.`,
      403,
      'ACCOUNT_NOT_ACTIVE'
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { password: _, ...userWithoutPassword } = user;

  const accessToken = generateAccessToken(userWithoutPassword);
  const { token: refreshToken, expiresAt } = await generateRefreshToken(user.id);

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

// ============ REFRESH TOKEN ============

exports.refresh = async (oldRefreshToken) => {
  // 1. Chercher le refresh token en base
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError('Refresh token invalide', 401, 'INVALID_REFRESH_TOKEN');
  }

  // 2. Vérifier l'expiration
  if (storedToken.expiresAt < new Date()) {
    // Supprimer le token expiré
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Refresh token expiré', 401, 'REFRESH_TOKEN_EXPIRED');
  }

  // 3. Vérifier que l'utilisateur est toujours actif
  if (storedToken.user.status !== 'ACTIVE') {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Compte inactif', 403, 'ACCOUNT_NOT_ACTIVE');
  }

  // 4. RÉVOCATION : supprimer l'ancien token (rotation)
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // 5. Générer un nouvel access token + nouveau refresh token
  const { password: _, ...userWithoutPassword } = storedToken.user;
  const accessToken = generateAccessToken(userWithoutPassword);
  const { token: newRefreshToken, expiresAt } = await generateRefreshToken(
    storedToken.userId
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    refreshTokenExpiresAt: expiresAt,
  };
};

// ============ LOGOUT ============

exports.logout = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token requis', 400, 'MISSING_REFRESH_TOKEN');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored) {
    // Token déjà supprimé ou invalide : on ne considère pas ça comme une erreur
    return { message: 'Déconnexion réussie' };
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  return { message: 'Déconnexion réussie' };
};

// Logout de toutes les sessions
exports.logoutAll = async (userId) => {
  const result = await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return {
    message: `${result.count} session(s) déconnectée(s)`,
    count: result.count,
  };
};

// ============ PROFIL ============

exports.getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  });

  if (!user) {
    throw new AppError('Utilisateur introuvable', 404, 'USER_NOT_FOUND');
  }

  return user;
};