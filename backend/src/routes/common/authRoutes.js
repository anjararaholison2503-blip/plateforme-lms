const express = require('express');
const router = express.Router();

// ⬇️ CETTE LIGNE EST OBLIGATOIRE ⬇️
const authController = require('../../controllers/common/authController');
const uploadAvatar = require('../../middlewares/avatarUploadMiddleware');

const {
  registerValidator,
  loginValidator,
  refreshValidator,
} = require('../../validators/common/authValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Routes de profil
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/profile/avatar', requireAuth, uploadAvatar, authController.updateAvatar);

// Routes publiques
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/refresh', refreshValidator, authController.refresh);
router.post('/logout', authController.logout);

// Routes protégées
router.get('/me', requireAuth, authController.getMe);
router.post('/logout-all', requireAuth, authController.logoutAll);

// Route admin uniquement
router.get(
  '/admin-only',
  requireAuth,
  requireRole('ADMIN'),
  (req, res) => {
    res.json({
      status: 'success',
      message: 'Bienvenue admin !',
      user: req.user,
    });
  }
);

module.exports = router;