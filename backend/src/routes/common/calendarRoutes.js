const express = require('express');
const router = express.Router();
const calendarController = require('../../controllers/common/calendarController');
const {
  createEventValidator,
  updateEventValidator,
  idParamValidator,
  listEventsValidator,
} = require('../../validators/common/calendarValidators');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

router.get('/', requireAuth, listEventsValidator, calendarController.listEvents);
router.get('/upcoming', requireAuth, calendarController.getUpcoming);
router.get('/:id', requireAuth, idParamValidator, calendarController.getEvent);
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'TEACHER'),   // ← Bloque STUDENT
  createEventValidator,
  calendarController.createEvent
);
// router.put('/:id', requireAuth, requireRole('ADMIN', 'TEACHER'), updateEventValidator, calendarController.updateEvent);
router.delete('/:id', requireAuth, idParamValidator, calendarController.deleteEvent);

module.exports = router;