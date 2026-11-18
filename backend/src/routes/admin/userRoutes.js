// const express = require('express');
// const router = express.Router();
// const userController = require('../../controllers/admin/userController');
// const {
//   listUsersValidator,
//   createUserValidator,
//   updateUserValidator,
//   updateStatusValidator,
//   idParamValidator,
// } = require('../../validators/admin/userValidators');
// const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');
// const userImportController = require('../../controllers/admin/userImportController');
// const excelUpload = require('../../middlewares/excelUploadMiddleware');

// // Toutes les routes nécessitent d'être authentifié
// router.use(requireAuth);

// // Stats (admin uniquement)
// router.get('/stats', requireRole('ADMIN'), userController.getStats);

// // Liste des utilisateurs (admin uniquement pour l'instant)
// router.get('/', requireRole('ADMIN'), listUsersValidator, userController.listUsers);

// // Téléchargement du modèle Excel (accessible à tous les admins)
// router.get('/import/template', requireRole('ADMIN'), userImportController.downloadTemplate);

// // Import Excel (upload d'un fichier)
// router.post(
//   '/import',
//   requireRole('ADMIN'),
//   excelUpload.single('file'),
//   userImportController.importUsers
// );

// // Détails
// router.get('/:id', requireRole('ADMIN'), idParamValidator, userController.getUser);

// // Création
// router.post('/', requireRole('ADMIN'), createUserValidator, userController.createUser);

// // Modification
// router.put('/:id', requireRole('ADMIN'), updateUserValidator, userController.updateUser);

// // Modification du statut
// router.patch(
//   '/:id/status',
//   requireRole('ADMIN'),
//   updateStatusValidator,
//   userController.updateStatus
// );

// // Suppression
// router.delete('/:id', requireRole('ADMIN'), idParamValidator, userController.deleteUser);

// module.exports = router;


const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const userImportController = require('../../controllers/admin/userImportController');
const {
  listUsersValidator,
  createUserValidator,
  updateUserValidator,
  updateStatusValidator,
  idParamValidator,
} = require('../../validators/admin/userValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');
const excelUpload = require('../../middlewares/excelUploadMiddleware');

router.use(requireAuth);

// Stats
router.get('/stats', requireRole('ADMIN'), userController.getStats);

// Import Excel (à placer AVANT /:id)
router.get('/import/template', requireRole('ADMIN'), userImportController.downloadTemplate);
router.post(
  '/import',
  requireRole('ADMIN'),
  excelUpload.single('file'),
  userImportController.importUsers
);

// Liste
router.get('/', requireRole('ADMIN'), listUsersValidator, userController.listUsers);

// Détails
router.get('/:id', requireRole('ADMIN'), idParamValidator, userController.getUser);

// Création
router.post('/', requireRole('ADMIN'), createUserValidator, userController.createUser);

// Modification
router.put('/:id', requireRole('ADMIN'), updateUserValidator, userController.updateUser);

// Statut
router.patch('/:id/status', requireRole('ADMIN'), updateStatusValidator, userController.updateStatus);

// Suppression
router.delete('/:id', requireRole('ADMIN'), idParamValidator, userController.deleteUser);

module.exports = router;