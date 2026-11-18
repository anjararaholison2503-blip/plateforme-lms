const express = require('express');
const router = express.Router();
const materialController = require('../../controllers/common/materialController');
const {
  uploadMaterialValidator,
  courseIdParamValidator,
  idParamValidator,
  extendMaterialValidator,
} = require('../../validators/common/materialValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/materialUploadMiddleware');

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

router.get(
  '/course/:courseId',
  courseIdParamValidator,
  materialController.listCourseMaterials
);

router.get(
  '/:id',
  idParamValidator,
  materialController.getMaterial
);

router.get(
  '/:id/download',
  idParamValidator,
  materialController.downloadMaterial
);

// ═══════════════════════════════════════════════════════════
// UPLOAD (TEACHER + ADMIN)
// ═══════════════════════════════════════════════════════════

router.post(
  '/upload',
  requireRole('ADMIN', 'TEACHER'),
  upload.single('file'), // ← 1 seul fichier
  uploadMaterialValidator,
  materialController.uploadMaterial
);

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

router.delete(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  materialController.deleteMaterial
);

// ═══════════════════════════════════════════════════════════
// PROLONGATION
// ═══════════════════════════════════════════════════════════

router.post(
  '/:id/extend',
  requireRole('ADMIN', 'TEACHER'),
  extendMaterialValidator,
  materialController.extendMaterial
);

module.exports = router;