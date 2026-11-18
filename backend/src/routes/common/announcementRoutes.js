const express = require('express');
const router = express.Router();
const announcementController = require('../../controllers/common/announcementController');
const {
  courseIdParamValidator,
  idParamValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
} = require('../../validators/common/announcementValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

router.use(requireAuth);

// ═══════════════════════════════════════════════════════════
// LECTURE (tous les utilisateurs connectés)
// ═══════════════════════════════════════════════════════════

router.get(
  '/course/:courseId',
  courseIdParamValidator,
  announcementController.listAnnouncements
);

router.get(
  '/course/:courseId/stats',
  courseIdParamValidator,
  announcementController.getStats
);

router.get('/:id', idParamValidator, announcementController.getAnnouncement);

// ═══════════════════════════════════════════════════════════
// CRÉATION / MODIFICATION / SUPPRESSION (ADMIN + TEACHER)
// ═══════════════════════════════════════════════════════════

router.post(
  '/course/:courseId',
  requireRole('ADMIN', 'TEACHER'),
  createAnnouncementValidator,
  announcementController.createAnnouncement
);

router.put(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  updateAnnouncementValidator,
  announcementController.updateAnnouncement
);

router.delete(
  '/:id',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  announcementController.deleteAnnouncement
);

router.patch(
  '/:id/toggle-pin',
  requireRole('ADMIN', 'TEACHER'),
  idParamValidator,
  announcementController.togglePin
);

module.exports = router;