const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const materialService = require('../../services/common/materialService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// UPLOAD
// ═══════════════════════════════════════════════════════════

exports.uploadMaterial = [
  validate,
  catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400, 'NO_FILE');
    }

    const data = {
      ...req.body,
      userRole: req.user.role,
    };

    const material = await materialService.createMaterial(req.file, data, req.user.id);
    res.status(201).json({ status: 'success', data: material });
  }),
];

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.listCourseMaterials = [
  validate,
  catchAsync(async (req, res) => {
    const materials = await materialService.getCourseMaterials(
      parseInt(req.params.courseId),
      req.user
    );
    res.json({ status: 'success', data: materials });
  }),
];

exports.getMaterial = [
  validate,
  catchAsync(async (req, res) => {
    const material = await materialService.getMaterialById(
      parseInt(req.params.id),
      req.user
    );
    res.json({ status: 'success', data: material });
  }),
];

// ═══════════════════════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════════════════════

exports.deleteMaterial = [
  validate,
  catchAsync(async (req, res) => {
    const result = await materialService.deleteMaterial(
      parseInt(req.params.id),
      req.user
    );
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// PROLONGATION
// ═══════════════════════════════════════════════════════════

exports.extendMaterial = [
  validate,
  catchAsync(async (req, res) => {
    const { durationValue, durationUnit } = req.body;
    const material = await materialService.extendMaterial(
      parseInt(req.params.id),
      req.user,
      parseInt(durationValue),
      durationUnit
    );
    res.json({ status: 'success', data: material });
  }),
];

// ═══════════════════════════════════════════════════════════
// TÉLÉCHARGEMENT
// ═══════════════════════════════════════════════════════════

exports.downloadMaterial = [
  validate,
  catchAsync(async (req, res) => {
    const material = await materialService.getMaterialById(
      parseInt(req.params.id),
      req.user
    );

    if (!material.fileUrl) {
      throw new AppError('Ce support n\'a pas de fichier téléchargeable', 400, 'NO_FILE');
    }

    res.json({
      status: 'success',
      data: {
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        fileSize: material.fileSize,
        mimeType: material.mimeType,
      },
    });
  }),
];