const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const announcementService = require('../../services/common/announcementService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.listAnnouncements = [
  validate,
  catchAsync(async (req, res) => {
    const announcements = await announcementService.getCourseAnnouncements(
      parseInt(req.params.courseId),
      req.user
    );
    res.json({ status: 'success', data: announcements });
  }),
];

exports.getAnnouncement = [
  validate,
  catchAsync(async (req, res) => {
    const announcement = await announcementService.getAnnouncementById(
      parseInt(req.params.id),
      req.user
    );
    res.json({ status: 'success', data: announcement });
  }),
];

// ═══════════════════════════════════════════════════════════
// CRÉATION / MODIFICATION / SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.createAnnouncement = [
  validate,
  catchAsync(async (req, res) => {
    const announcement = await announcementService.createAnnouncement(
      parseInt(req.params.courseId),
      req.body,
      req.user.id,
      req.user.role
    );
    res.status(201).json({ status: 'success', data: announcement });
  }),
];

exports.updateAnnouncement = [
  validate,
  catchAsync(async (req, res) => {
    const announcement = await announcementService.updateAnnouncement(
      parseInt(req.params.id),
      req.body,
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data: announcement });
  }),
];

exports.deleteAnnouncement = [
  validate,
  catchAsync(async (req, res) => {
    const result = await announcementService.deleteAnnouncement(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data: result });
  }),
];

exports.togglePin = [
  validate,
  catchAsync(async (req, res) => {
    const announcement = await announcementService.togglePin(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data: announcement });
  }),
];

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getStats = [
  validate,
  catchAsync(async (req, res) => {
    const stats = await announcementService.getCourseAnnouncementStats(
      parseInt(req.params.courseId)
    );
    res.json({ status: 'success', data: stats });
  }),
];