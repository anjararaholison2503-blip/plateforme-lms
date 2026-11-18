const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const assignmentService = require('../../services/common/assignmentService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// Lecture
exports.listCourseAssignments = [
  validate,
  catchAsync(async (req, res) => {
    const assignments = await assignmentService.getCourseAssignments(
      parseInt(req.params.courseId),
      req.user
    );
    res.json({ status: 'success', data: assignments });
  }),
];

exports.getAssignment = [
  validate,
  catchAsync(async (req, res) => {
    const assignment = await assignmentService.getAssignmentById(
      parseInt(req.params.id),
      req.user
    );
    res.json({ status: 'success', data: assignment });
  }),
];

exports.getMyAssignments = catchAsync(async (req, res) => {
  const assignments = await assignmentService.getMyAssignments(req.user.id);
  res.json({ status: 'success', data: assignments });
});

// Création
exports.createAssignment = [
  validate,
  catchAsync(async (req, res) => {
    const assignment = await assignmentService.createAssignment(
      parseInt(req.params.courseId),
      req.body,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: assignment });
  }),
];

// Mise à jour
exports.updateAssignment = [
  validate,
  catchAsync(async (req, res) => {
    const assignment = await assignmentService.updateAssignment(
      parseInt(req.params.id),
      req.body
    );
    res.json({ status: 'success', data: assignment });
  }),
];

// Suppression
exports.deleteAssignment = [
  validate,
  catchAsync(async (req, res) => {
    const result = await assignmentService.deleteAssignment(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

// Soumission
exports.submitAssignment = [
  validate,
  catchAsync(async (req, res) => {
    const submission = await assignmentService.submitAssignment(
      parseInt(req.params.id),
      req.body,
      req.user.id
    );
    res.status(201).json({ status: 'success', data: submission });
  }),
];

// Notation
exports.gradeSubmission = [
  validate,
  catchAsync(async (req, res) => {
    const submission = await assignmentService.gradeSubmission(
      parseInt(req.params.submissionId),
      req.body,
      req.user.id
    );
    res.json({ status: 'success', data: submission });
  }),
];

exports.returnSubmission = [
  validate,
  catchAsync(async (req, res) => {
    const submission = await assignmentService.returnSubmission(parseInt(req.params.submissionId));
    res.json({ status: 'success', data: submission });
  }),
];

// Stats
exports.getCourseStats = [
  validate,
  catchAsync(async (req, res) => {
    const stats = await assignmentService.getCourseAssignmentStats(parseInt(req.params.courseId));
    res.json({ status: 'success', data: stats });
  }),
];


exports.getAIDetection = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const prisma = require('../../config/prisma');

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: parseInt(submissionId) },
      select: {
        id: true,
        aiDetectionScore: true,
        aiDetectionDetails: true,
        aiDetectionStatus: true,
        fileName: true,
        submittedAt: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission introuvable',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
};