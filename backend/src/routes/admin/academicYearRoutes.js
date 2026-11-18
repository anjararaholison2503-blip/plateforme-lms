const express = require('express');
const router = express.Router();
const academicYearController = require('../../controllers/admin/academicYearController');
const {
  listValidator,
  idParamValidator,
  createValidator,
  updateValidator,
  duplicateValidator,
} = require('../../validators/admin/academicYearValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

router.use(requireAuth);

// Lecture (tous)
router.get('/', listValidator, academicYearController.listAcademicYears);
router.get('/active', academicYearController.getActive);
router.get('/stats', requireRole('ADMIN'), academicYearController.getStats);
router.get('/:id', idParamValidator, academicYearController.getAcademicYear);

// Écriture (ADMIN)
router.post('/', requireRole('ADMIN'), createValidator, academicYearController.createAcademicYear);
router.put('/:id', requireRole('ADMIN'), updateValidator, academicYearController.updateAcademicYear);
router.post('/:id/activate', requireRole('ADMIN'), idParamValidator, academicYearController.activate);
router.post('/:id/close', requireRole('ADMIN'), idParamValidator, academicYearController.close);
router.post('/:id/archive', requireRole('ADMIN'), idParamValidator, academicYearController.archive);
router.post('/:id/duplicate', requireRole('ADMIN'), duplicateValidator, academicYearController.duplicate);
router.delete('/:id', requireRole('ADMIN'), idParamValidator, academicYearController.deleteAcademicYear);

module.exports = router;