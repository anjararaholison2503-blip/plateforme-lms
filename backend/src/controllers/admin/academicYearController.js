const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const academicYearService = require('../../services/admin/academicYearService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

exports.listAcademicYears = [
  validate,
  catchAsync(async (req, res) => {
    const years = await academicYearService.getAllAcademicYears(req.query);
    res.json({ status: 'success', data: years });
  }),
];

exports.getAcademicYear = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.getAcademicYearById(parseInt(req.params.id));
    res.json({ status: 'success', data: year });
  }),
];

exports.getActive = catchAsync(async (req, res) => {
  const year = await academicYearService.getActiveAcademicYear();
  res.json({ status: 'success', data: year });
});

exports.createAcademicYear = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.createAcademicYear(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: year });
  }),
];

exports.updateAcademicYear = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.updateAcademicYear(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: year });
  }),
];

exports.activate = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.activateAcademicYear(parseInt(req.params.id));
    res.json({ status: 'success', data: year });
  }),
];

exports.close = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.closeAcademicYear(parseInt(req.params.id));
    res.json({ status: 'success', data: year });
  }),
];

exports.archive = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.archiveAcademicYear(parseInt(req.params.id));
    res.json({ status: 'success', data: year });
  }),
];

exports.deleteAcademicYear = [
  validate,
  catchAsync(async (req, res) => {
    const result = await academicYearService.deleteAcademicYear(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.duplicate = [
  validate,
  catchAsync(async (req, res) => {
    const year = await academicYearService.duplicateAcademicYear(
      parseInt(req.params.id),
      req.body.newLabel,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: year });
  }),
];

exports.getStats = catchAsync(async (req, res) => {
  const stats = await academicYearService.getAcademicYearStats();
  res.json({ status: 'success', data: stats });
});