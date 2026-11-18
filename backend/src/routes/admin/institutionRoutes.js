const express = require('express');
const router = express.Router();
const institutionController = require('../../controllers/admin/institutionController'); // ⬅️ On garde celui-ci
const {
  createUnitValidator,
  updateUnitValidator,
  moveUnitValidator,
  idParamValidator,
  listUnitsValidator,
} = require('../../validators/admin/institutionValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// ⚠️ SUPPRIMER LA LIGNE 12 QUI ÉTAIT ICI (le doublon)

// Route publique pour le formulaire d'inscription (sans token)
router.get('/public/units', institutionController.listPublicUnits);
// ============ ROUTES PUBLIQUES (lecture) ============
router.get('/tree', requireAuth, institutionController.getTree);
router.get('/units', requireAuth, listUnitsValidator, institutionController.listUnits);
router.get('/units/:id', requireAuth, idParamValidator, institutionController.getUnit);


// ============ ROUTES ADMIN (lecture avancée) ============
router.get(
  '/units/:id/stats',
  requireAuth,
  requireRole('ADMIN'),
  idParamValidator,
  institutionController.getUnitStats
);

router.get(
  '/units/:id/dependencies',
  requireAuth,
  requireRole('ADMIN'),
  idParamValidator,
  institutionController.checkDependencies
);

// ============ ROUTES ADMIN (écriture) ============
router.post(
  '/units',
  requireAuth,
  requireRole('ADMIN'),
  createUnitValidator,
  institutionController.createUnit
);

router.put(
  '/units/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateUnitValidator,
  institutionController.updateUnit
);

router.patch(
  '/units/:id/move',
  requireAuth,
  requireRole('ADMIN'),
  moveUnitValidator,
  institutionController.moveUnit
);

router.delete(
  '/units/:id',
  requireAuth,
  requireRole('ADMIN'),
  idParamValidator,
  institutionController.deleteUnit
);

// ============ ROUTES CLASSES ============
router.get('/classes', requireAuth, requireRole('ADMIN'), institutionController.listClasses);
router.get('/classes/:classId/students', requireAuth, requireRole('ADMIN'), institutionController.getStudentsInClass);
router.get('/classes/:classId/export', requireAuth, requireRole('ADMIN'), institutionController.exportClassToExcel);

module.exports = router;