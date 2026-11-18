const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const teachingUnitService = require('../../services/admin/teachingUnitService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// CRUD UE
// ═══════════════════════════════════════════════════════════

exports.listUnits = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.getAllTeachingUnits(req.query);
    res.json({
      status: 'success',
      data: result.units,
      pagination: result.pagination,
    });
  }),
];

exports.getUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await teachingUnitService.getTeachingUnitById(parseInt(req.params.id));
    res.json({ status: 'success', data: unit });
  }),
];

exports.createUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await teachingUnitService.createTeachingUnit(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: unit });
  }),
];

exports.updateUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await teachingUnitService.updateTeachingUnit(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: unit });
  }),
];

exports.deleteUnit = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.deleteTeachingUnit(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// GESTION DES MATIÈRES DANS L'UE
// ═══════════════════════════════════════════════════════════

exports.addCourse = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.addCourseToUnit(
      parseInt(req.params.id),
      parseInt(req.body.courseId),
      req.body.coefficient
    );
    res.status(201).json({ status: 'success', data: result });
  }),
];

exports.removeCourse = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.removeCourseFromUnit(
      parseInt(req.params.id),
      parseInt(req.params.courseId)
    );
    res.json({ status: 'success', data: result });
  }),
];

exports.createCourseInUnit = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.createCourseInUnit(
      parseInt(req.params.id),
      req.body,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// GESTION DES CLASSES
// ═══════════════════════════════════════════════════════════

exports.listUnitClasses = [
  validate,
  catchAsync(async (req, res) => {
    const classes = await teachingUnitService.getUnitClasses(parseInt(req.params.id));
    res.json({ status: 'success', data: classes });
  }),
];

exports.assignClasses = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.assignClassesToUnit(
      parseInt(req.params.id),
      req.body.classIds
    );
    res.json({ status: 'success', data: result });
  }),
];

exports.removeClass = [
  validate,
  catchAsync(async (req, res) => {
    const result = await teachingUnitService.removeClassFromUnit(
      parseInt(req.params.id),
      parseInt(req.params.classId)
    );
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getStats = catchAsync(async (req, res) => {
  const stats = await teachingUnitService.getTeachingUnitStats();
  res.json({ status: 'success', data: stats });
});