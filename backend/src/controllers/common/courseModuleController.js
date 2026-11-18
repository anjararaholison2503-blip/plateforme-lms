const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const courseModuleService = require('../../services/common/courseModuleService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════

exports.listModules = [
  validate,
  catchAsync(async (req, res) => {
    const modules = await courseModuleService.getCourseModules(
      parseInt(req.params.courseId),
      req.user.role
    );
    res.json({ status: 'success', data: modules });
  }),
];

exports.getModule = [
  validate,
  catchAsync(async (req, res) => {
    const module = await courseModuleService.getModuleById(parseInt(req.params.id));
    res.json({ status: 'success', data: module });
  }),
];

exports.createModule = [
  validate,
  catchAsync(async (req, res) => {
    const module = await courseModuleService.createModule(
      parseInt(req.params.courseId),
      req.body
    );
    res.status(201).json({ status: 'success', data: module });
  }),
];

exports.updateModule = [
  validate,
  catchAsync(async (req, res) => {
    const module = await courseModuleService.updateModule(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: module });
  }),
];

exports.deleteModule = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseModuleService.deleteModule(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.reorderModules = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseModuleService.reorderModules(
      parseInt(req.params.courseId),
      req.body.moduleIds
    );
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// LEÇONS
// ═══════════════════════════════════════════════════════════

exports.getLesson = [
  validate,
  catchAsync(async (req, res) => {
    const lesson = await courseModuleService.getLessonById(parseInt(req.params.id));
    res.json({ status: 'success', data: lesson });
  }),
];

exports.createLesson = [
  validate,
  catchAsync(async (req, res) => {
    const lesson = await courseModuleService.createLesson(
      parseInt(req.params.moduleId),
      req.body
    );
    res.status(201).json({ status: 'success', data: lesson });
  }),
];

exports.updateLesson = [
  validate,
  catchAsync(async (req, res) => {
    const lesson = await courseModuleService.updateLesson(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: lesson });
  }),
];

exports.deleteLesson = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseModuleService.deleteLesson(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.reorderLessons = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseModuleService.reorderLessons(
      parseInt(req.params.moduleId),
      req.body.lessonIds
    );
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════

exports.getStats = [
  validate,
  catchAsync(async (req, res) => {
    const stats = await courseModuleService.getCourseProgramStats(parseInt(req.params.courseId));
    res.json({ status: 'success', data: stats });
  }),
];