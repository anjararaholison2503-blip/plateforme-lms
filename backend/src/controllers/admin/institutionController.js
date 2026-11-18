const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const institutionService = require('../../services/admin/institutionService');

const prisma = require('../../config/database');
const XLSX = require('xlsx');

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array())
    );
  }
  next();
};

// ============ LECTURE ============

/**
 * GET /api/institution/tree
 * Récupère l'arbre hiérarchique complet.
 */
exports.getTree = catchAsync(async (req, res) => {
  const tree = await institutionService.getTree();
  res.json({ status: 'success', data: tree });
});

/**
 * GET /api/institution/units
 * Liste à plat avec filtres.
 */
exports.listUnits = [
  validate,
  catchAsync(async (req, res) => {
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.parentId !== undefined) filters.parentId = parseInt(req.query.parentId);
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

    const units = await institutionService.getAllUnits(filters);
    res.json({ status: 'success', data: units });
  }),
];

/**
 * GET /api/institution/units/:id
 * Détails d'une unité.
 */
exports.getUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await institutionService.getUnitById(parseInt(req.params.id));
    res.json({ status: 'success', data: unit });
  }),
];

/**
 * GET /api/institution/units/:id/stats
 * Statistiques d'une unité.
 */
exports.getUnitStats = [
  validate,
  catchAsync(async (req, res) => {
    const stats = await institutionService.getUnitStats(parseInt(req.params.id));
    res.json({ status: 'success', data: stats });
  }),
];

/**
 * GET /api/institution/units/:id/dependencies
 * Vérifie les dépendances avant suppression.
 */
exports.checkDependencies = [
  validate,
  catchAsync(async (req, res) => {
    const deps = await institutionService.checkDependencies(parseInt(req.params.id));
    res.json({ status: 'success', data: deps });
  }),
];

// ============ CRÉATION ============

/**
 * POST /api/institution/units
 */
exports.createUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await institutionService.createUnit(req.body);
    res.status(201).json({ status: 'success', data: unit });
  }),
];

// ============ MISE À JOUR ============

/**
 * PUT /api/institution/units/:id
 */
exports.updateUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await institutionService.updateUnit(
      parseInt(req.params.id),
      req.body
    );
    res.json({ status: 'success', data: unit });
  }),
];

/**
 * PATCH /api/institution/units/:id/move
 * Déplace une unité vers un nouveau parent.
 */
exports.moveUnit = [
  validate,
  catchAsync(async (req, res) => {
    const unit = await institutionService.moveUnit(
      parseInt(req.params.id),
      req.body.parentId || null
    );
    res.json({
      status: 'success',
      message: 'Unité déplacée avec succès',
      data: unit,
    });
  }),
];

// ============ SUPPRESSION ============

/**
 * DELETE /api/institution/units/:id
 */
exports.deleteUnit = [
  validate,
  catchAsync(async (req, res) => {
    const result = await institutionService.deleteUnit(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];


// 1. Lister toutes les classes avec leur effectif
exports.listClasses = catchAsync(async (req, res) => {
  const classes = await prisma.institutionUnit.findMany({
    where: { type: 'CLASS' },
    include: {
      _count: {
        select: { users: true } // On compte les étudiants liés à cette classe
      }
    },
    orderBy: { name: 'asc' }
  });
  res.json({ success: true, data: classes });
});

// 2. Lister les étudiants d'une classe spécifique
exports.getStudentsInClass = catchAsync(async (req, res) => {
  const { classId } = req.params;
  
  const students = await prisma.user.findMany({
    where: { 
      unitId: parseInt(classId),
      role: 'STUDENT'
    },
    select: {
      id: true,
      matricule: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true
    },
    orderBy: { lastName: 'asc' }
  });
  
  res.json({ success: true, data: students });
});

// 3. Exporter les étudiants d'une classe en Excel
exports.exportClassToExcel = catchAsync(async (req, res) => {
  const { classId } = req.params;
  
  // Récupérer la classe
  const cls = await prisma.institutionUnit.findUnique({
    where: { id: parseInt(classId) },
    select: { name: true, code: true }
  });

  // Récupérer les étudiants
  const students = await prisma.user.findMany({
    where: { unitId: parseInt(classId), role: 'STUDENT' },
    orderBy: { lastName: 'asc' }
  });

  // Créer les données pour Excel
  const data = students.map(s => ({
    'Matricule': s.matricule || 'N/A',
    'Nom': s.lastName,
    'Prénom': s.firstName,
    'Email': s.email,
    'Téléphone': s.phone || 'N/A',
    'Statut': s.status,
    'Date d\'inscription': new Date(s.createdAt).toLocaleDateString('fr-FR')
  }));

  // Générer le fichier Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Étudiants');
  
  // Ajuster la largeur des colonnes
  worksheet['!cols'] = [
    { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 }
  ];

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Envoyer le fichier au client
  res.setHeader('Content-Disposition', `attachment; filename="Etudiants_${cls.code || cls.name}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});


// Route publique pour l'inscription (sans token)
exports.listPublicUnits = catchAsync(async (req, res) => {
  const filters = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.parentId !== undefined) filters.parentId = parseInt(req.query.parentId);
  
  const units = await institutionService.getAllUnits(filters);
  res.json({ status: 'success', data: units });
});