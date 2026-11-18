const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const prisma = require('../config/database');

// Vérifier le JWT
exports.requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token manquant', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true, unitId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur introuvable', 401, 'USER_NOT_FOUND');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Compte inactif', 403, 'ACCOUNT_NOT_ACTIVE');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide', 401, 'INVALID_TOKEN'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expiré', 401, 'TOKEN_EXPIRED'));
    }
    next(err);
  }
};

// Vérifier le rôle
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentification requise', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Accès refusé', 403, 'FORBIDDEN')
      );
    }
    next();
  };
};