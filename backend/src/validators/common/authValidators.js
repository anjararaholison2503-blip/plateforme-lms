const { body } = require('express-validator');

exports.registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ max: 100 }),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ max: 100 }),
  body('role')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'PARENT'])
    .withMessage('Rôle invalide'),
  body('unitId')
    .optional()
    .isInt()
    .withMessage('unitId doit être un entier'),
];

exports.loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

exports.refreshValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Le refresh token est requis')
    .isString()
    .withMessage('Le refresh token doit être une chaîne'),
];