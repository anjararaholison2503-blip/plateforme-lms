const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const calendarService = require('../../services/common/calendarService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

exports.listEvents = catchAsync(async (req, res) => {
  const events = await calendarService.getEvents(req.user.id, {
    ...req.query,
    userUnitId: req.user.unitId,
  });
  res.json({ status: 'success', data: events });
});

exports.getUpcoming = catchAsync(async (req, res) => {
  const events = await calendarService.getUpcomingEvents(
    req.user.id,
    parseInt(req.query.limit) || 5
  );
  res.json({ status: 'success', data: events });
});

exports.getEvent = catchAsync(async (req, res) => {
  const event = await calendarService.getEventById(parseInt(req.params.id));
  res.json({ status: 'success', data: event });
});

exports.createEvent = [
  validate,
  catchAsync(async (req, res) => {
    const event = await calendarService.createEvent(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: event });
  }),
];

exports.updateEvent = [
  validate,
  catchAsync(async (req, res) => {
    const event = await calendarService.updateEvent(
      parseInt(req.params.id),
      req.body,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    res.json({ status: 'success', data: event });
  }),
];

exports.deleteEvent = catchAsync(async (req, res) => {
  const result = await calendarService.deleteEvent(
    parseInt(req.params.id),
    req.user.id,
    req.user.role === 'ADMIN'
  );
  res.json({ status: 'success', data: result });
});