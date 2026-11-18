const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const authService = require('../../services/common/authService');
const bcrypt = require('bcrypt');
const prisma = require('../../config/database');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array())
    );
  }
  next();
};

// ============ INSCRIPTION ============
exports.register = [
  validate,
  catchAsync(async (req, res) => {
    const { email, password, firstName, lastName, role, unitId } = req.body;
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      unitId,
    });
    res.status(201).json({ status: 'success', data: result });
  }),
];

// ============ CONNEXION ============
exports.login = [
  validate,
  catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ status: 'success', data: result });
  }),
];

// ============ REFRESH ============
exports.refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token requis', 400, 'MISSING_REFRESH_TOKEN');
  }

  const result = await authService.refresh(refreshToken);
  res.json({ status: 'success', data: result });
});

// ============ LOGOUT ============
exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.logout(refreshToken);
  res.json({ status: 'success', data: result });
});

// ============ LOGOUT ALL ============
exports.logoutAll = catchAsync(async (req, res) => {
  const result = await authService.logoutAll(req.user.id);
  res.json({ status: 'success', data: result });
});

// ============ PROFIL ============
exports.getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ status: 'success', data: user });
});

// Mettre à jour le profil
exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, password } = req.body;

  const dataToUpdate = {};
  
  // Ne mettre à jour que les champs fournis
  if (firstName && firstName.trim() !== '') dataToUpdate.firstName = firstName.trim();
  if (lastName && lastName.trim() !== '') dataToUpdate.lastName = lastName.trim();
  
  // Email : vérifier qu'il n'est pas déjà utilisé par un AUTRE utilisateur
  if (email && email.trim() !== '') {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    
    // Si l'email existe ET appartient à un autre utilisateur → erreur
    if (existing && existing.id !== userId) {
      throw new AppError('Cet email est déjà utilisé par un autre compte', 400, 'EMAIL_EXISTS');
    }
    
    // Sinon, on peut le mettre à jour (même si c'est le même, ça ne pose pas de problème)
    dataToUpdate.email = cleanEmail;
  }
  
  // Mot de passe : uniquement s'il est fourni
  if (password && password.trim() !== '') {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  // Si aucun champ à mettre à jour, on renvoie l'utilisateur actuel
  if (Object.keys(dataToUpdate).length === 0) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true }
    });
    return res.json({ success: true, data: currentUser });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true }
    });
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("ERREUR UPDATE PROFILE:", error);
    if (error.code === 'P2002') {
      throw new AppError('Cet email est déjà utilisé', 400, 'EMAIL_EXISTS');
    }
    throw error;
  }
});

// Mettre à jour la photo de profil
exports.updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE');
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl },
    select: { id: true, avatarUrl: true }
  });

  res.json({ success: true, data: updatedUser });
});