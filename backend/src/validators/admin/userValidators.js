const { body, param, query } = require('express-validator');

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'PARENT'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

exports.listUsersValidator = [
  query('role').optional().isIn(ROLES),
  query('status').optional().isIn(STATUSES),
  query('unitId').optional().isInt({ min: 1 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.idParamValidator = [param('id').isInt({ min: 1 }).withMessage('ID invalide')];

exports.createUserValidator = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 100 }),
  body('phone').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('role').optional().isIn(ROLES).withMessage('Rôle invalide'),
  body('status').optional().isIn(STATUSES),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.updateUserValidator = [
  param('id').isInt({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('firstName').optional().trim().isLength({ min: 1, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('role').optional().isIn(ROLES),
  body('status').optional().isIn(STATUSES),
  body('unitId').optional({ nullable: true }).isInt({ min: 1 }),
];

exports.updateStatusValidator = [
  param('id').isInt({ min: 1 }),
  body('status').isIn(STATUSES).withMessage('Statut invalide'),
];