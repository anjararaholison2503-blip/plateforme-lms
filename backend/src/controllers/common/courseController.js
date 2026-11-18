const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const courseService = require('../../services/common/courseService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ============ COURS ============
exports.listCourses = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.getCourses(req.query, req.user);
    res.json({ status: 'success', data: result.courses, pagination: result.pagination });
  }),
];

exports.getCourse = [
  validate,
  catchAsync(async (req, res) => {
    const course = await courseService.getCourseById(parseInt(req.params.id), req.user);
    res.json({ status: 'success', data: course });
  }),
];

exports.createCourse = [
  validate,
  catchAsync(async (req, res) => {
    const course = await courseService.createCourse(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: course });
  }),
];

exports.updateCourse = [
  validate,
  catchAsync(async (req, res) => {
    const course = await courseService.updateCourse(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: course });
  }),
];

exports.deleteCourse = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.deleteCourse(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

// ============ SESSIONS ============
exports.listSessions = [
  validate,
  catchAsync(async (req, res) => {
    const sessions = await courseService.getSessions(parseInt(req.params.id));
    res.json({ status: 'success', data: sessions });
  }),
];

exports.createSession = [
  validate,
  catchAsync(async (req, res) => {
    const session = await courseService.createSession(parseInt(req.params.id), req.body);
    res.status(201).json({ status: 'success', data: session });
  }),
];

exports.updateSession = [
  validate,
  catchAsync(async (req, res) => {
    const session = await courseService.updateSession(parseInt(req.params.sessionId), req.body);
    res.json({ status: 'success', data: session });
  }),
];

exports.deleteSession = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.deleteSession(parseInt(req.params.sessionId));
    res.json({ status: 'success', data: result });
  }),
];

// ============ ENSEIGNANTS ============
exports.addTeacher = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.addTeacher(
      parseInt(req.params.id),
      req.body.teacherId,
      req.body.role
    );
    res.status(201).json({ status: 'success', data: result });
  }),
];

exports.removeTeacher = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.removeTeacher(
      parseInt(req.params.id),
      parseInt(req.params.teacherId)
    );
    res.json({ status: 'success', data: result });
  }),
];

// ============ INSCRIPTIONS ============
exports.listEnrollments = [
  validate,
  catchAsync(async (req, res) => {
    const enrollments = await courseService.getEnrollments(parseInt(req.params.sessionId));
    res.json({ status: 'success', data: enrollments });
  }),
];

exports.enrollStudent = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await courseService.enrollStudent(
      parseInt(req.params.sessionId),
      req.body.studentId
    );
    res.status(201).json({ status: 'success', data: enrollment });
  }),
];

exports.updateEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const enrollment = await courseService.updateEnrollment(
      parseInt(req.params.enrollmentId),
      req.body
    );
    res.json({ status: 'success', data: enrollment });
  }),
];

exports.removeEnrollment = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.removeEnrollment(parseInt(req.params.enrollmentId));
    res.json({ status: 'success', data: result });
  }),
];

// ============ STATS ============
exports.getStats = catchAsync(async (req, res) => {
  const stats = await courseService.getCourseStats();
  res.json({ status: 'success', data: stats });
});

// ═══════════════════════════════════════════════════════════
// GESTION DES CLASSES ATTRIBUÉES AU COURS
// ═══════════════════════════════════════════════════════════

exports.listCourseClasses = [
  validate,
  catchAsync(async (req, res) => {
    const classes = await courseService.getCourseClasses(parseInt(req.params.id));
    res.json({ status: 'success', data: classes });
  }),
];

exports.addClass = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.addClassToCourse(
      parseInt(req.params.id),
      parseInt(req.body.classId)
    );
    res.status(201).json({ status: 'success', data: result });
  }),
];

exports.removeClass = [
  validate,
  catchAsync(async (req, res) => {
    const result = await courseService.removeClassFromCourse(
      parseInt(req.params.id),
      parseInt(req.params.classId)
    );
    res.json({ status: 'success', data: result });
  }),
];