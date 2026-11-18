const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const userService = require('../../services/admin/userService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

exports.listUsers = [
  validate,
  catchAsync(async (req, res) => {
    const result = await userService.getUsers(req.query);
    res.json({ status: 'success', data: result.users, pagination: result.pagination });
  }),
];

exports.getUser = [
  validate,
  catchAsync(async (req, res) => {
    const user = await userService.getUserById(parseInt(req.params.id));
    res.json({ status: 'success', data: user });
  }),
];

exports.createUser = [
  validate,
  catchAsync(async (req, res) => {
    const data = {
      ...req.body,
      // Convertir unitId en entier si présent
      unitId: req.body.unitId ? parseInt(req.body.unitId) : null,
    };
    const user = await userService.createUser(data);
    res.status(201).json({ status: 'success', data: user });
  }),
];

exports.updateUser = [
  validate,
  catchAsync(async (req, res) => {
    const data = {
      ...req.body,
      unitId: req.body.unitId ? parseInt(req.body.unitId) : null,
    };
    const user = await userService.updateUser(parseInt(req.params.id), data);
    res.json({ status: 'success', data: user });
  }),
];

exports.deleteUser = [
  validate,
  catchAsync(async (req, res) => {
    const result = await userService.deleteUser(parseInt(req.params.id), req.user.id);
    res.json({ status: 'success', data: result });
  }),
];

exports.updateStatus = [
  validate,
  catchAsync(async (req, res) => {
    const user = await userService.updateStatus(parseInt(req.params.id), req.body.status);
    res.json({ status: 'success', data: user });
  }),
];

exports.getStats = catchAsync(async (req, res) => {
  const stats = await userService.getUserStats();
  res.json({ status: 'success', data: stats });
});