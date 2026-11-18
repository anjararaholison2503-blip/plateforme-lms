const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/common/assignmentController');
const {
  courseIdParamValidator,
  idParamValidator,
  submissionIdParamValidator,
  createAssignmentValidator,
  updateAssignmentValidator,
  submitAssignmentValidator,
  gradeSubmissionValidator,
} = require('../../validators/common/assignmentValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/assignmentUploadMiddleware');
router.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

router.get('/my-assignments', assignmentController.getMyAssignments);
router.get(
  '/course/:courseId',
  courseIdParamValidator,
  assignmentController.listCourseAssignments
);
router.get(
  '/course/:courseId/stats',
  courseIdParamValidator,
  assignmentController.getCourseStats
);
router.get('/:id', idParamValidator, assignmentController.getAssignment);

// ═══════════════════════════════════════════════════════════
// CRÉATION / MODIFICATION / SUPPRESSION (Enseignant + Admin)
// ═══════════════════════════════════════════════════════════

router.post(
  '/course/:courseId',
  requireRole('ADMIN', 'TEACHER'),
  createAssignmentValidator,
  assignmentController.createAssignment
);

router.put(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  updateAssignmentValidator,
  assignmentController.updateAssignment
);

router.delete(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  assignmentController.deleteAssignment
);

// ═══════════════════════════════════════════════════════════
// SOUMISSION (Étudiant)
// ═══════════════════════════════════════════════════════════

router.post(
  '/:id/submit',
  requireRole('STUDENT'),
  submitAssignmentValidator,
  assignmentController.submitAssignment
);

// ═══════════════════════════════════════════════════════════
// NOTATION (Enseignant + Admin)
// ═══════════════════════════════════════════════════════════

router.post(
  '/submissions/:submissionId/grade',
  requireRole('ADMIN', 'TEACHER'),
  gradeSubmissionValidator,
  assignmentController.gradeSubmission
);

router.post(
  '/submissions/:submissionId/return',
  requireRole('ADMIN', 'TEACHER'),
  submissionIdParamValidator,
  assignmentController.returnSubmission
);

// ═══════════════════════════════════════════════════════════
// UPLOAD DE FICHIER (Étudiant + Enseignant)
// ═══════════════════════════════════════════════════════════

router.post(
  '/upload',
  requireRole('ADMIN', 'TEACHER', 'STUDENT'),
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILE',
        message: 'Aucun fichier fourni',
      });
    }

    const relativePath = require('path').relative(
      require('path').join(__dirname, '../../'),
      req.file.path
    ).replace(/\\/g, '/');

    const fileUrl = `/${relativePath.replace(/^(\.\.\/)+/, '')}`;

    res.json({
      status: 'success',
      data: {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  }
);

// ═══ DÉTECTION IA ═══
router.get(
  '/submissions/:submissionId/ai-detection',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),
  assignmentController.getAIDetection
);

module.exports = router;