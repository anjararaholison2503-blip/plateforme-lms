const { body, param, query } = require('express-validator');

const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CHECK',
  'MOBILE_MONEY_MVOLA',
  'MOBILE_MONEY_ORANGE',
  'MOBILE_MONEY_AIRTEL',
  'STRIPE_CARD',
  'OTHER',
];

const INVOICE_STATUSES = [
  'DRAFT',
  'SENT',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
];

const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'];

const REMINDER_TYPES = ['EMAIL', 'SMS', 'IN_APP'];
const REMINDER_STATUSES = ['PENDING', 'SENT', 'FAILED'];

// ═══════════════════════════════════════════════════════════
// PARAMS COMMUNS
// ═══════════════════════════════════════════════════════════

exports.idParamValidator = [param('id').isInt({ min: 1 }).withMessage('ID invalide')];

exports.studentIdParamValidator = [
  param('studentId').isInt({ min: 1 }).withMessage('studentId invalide'),
];

exports.invoiceIdParamValidator = [
  param('invoiceId').isInt({ min: 1 }).withMessage('invoiceId invalide'),
];

// ═══════════════════════════════════════════════════════════
// TYPES DE FRAIS
// ═══════════════════════════════════════════════════════════

exports.listFeeTypesValidator = [
  query('isActive').optional().isBoolean(),
  query('isRecurring').optional().isBoolean(),
];

exports.createFeeTypeValidator = [
  body('code')
    .trim()
    .notEmpty().withMessage('Le code est requis')
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Z0-9_]+$/i).withMessage('Le code doit contenir uniquement des lettres, chiffres et underscores'),
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('isRecurring').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('displayOrder').optional().isInt({ min: 0 }),
];

exports.updateFeeTypeValidator = [
  param('id').isInt({ min: 1 }),
  body('code').optional().trim().isLength({ min: 2, max: 50 }),
  body('name').optional().trim().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('isRecurring').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('displayOrder').optional().isInt({ min: 0 }),
];

// ═══════════════════════════════════════════════════════════
// FRAIS
// ═══════════════════════════════════════════════════════════

exports.listFeesValidator = [
  query('feeTypeId').optional().isInt({ min: 1 }),
  query('academicYear').optional().isString(),
  query('classId').optional().isInt({ min: 1 }),
  query('levelId').optional().isInt({ min: 1 }),
  query('isActive').optional().isBoolean(),
];

exports.createFeeValidator = [
  body('feeTypeId').isInt({ min: 1 }).withMessage('feeTypeId requis'),
  body('classId').optional({ nullable: true }).isInt({ min: 1 }),
  body('levelId').optional({ nullable: true }).isInt({ min: 1 }),
  body('academicYear')
    .trim()
    .notEmpty().withMessage('L\'année académique est requise')
    .matches(/^\d{4}-\d{4}$/).withMessage('Format attendu : 2025-2026'),
  body('amount').isFloat({ min: 0 }).withMessage('Le montant doit être positif'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('isActive').optional().isBoolean(),
  body('notes').optional({ nullable: true }).isString(),
];

exports.updateFeeValidator = [
  param('id').isInt({ min: 1 }),
  body('feeTypeId').optional().isInt({ min: 1 }),
  body('classId').optional({ nullable: true }).isInt({ min: 1 }),
  body('levelId').optional({ nullable: true }).isInt({ min: 1 }),
  body('academicYear').optional().matches(/^\d{4}-\d{4}$/),
  body('amount').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('isActive').optional().isBoolean(),
  body('notes').optional({ nullable: true }).isString(),
];

// ═══════════════════════════════════════════════════════════
// FACTURES
// ═══════════════════════════════════════════════════════════

exports.listInvoicesValidator = [
  query('status').optional().isIn(INVOICE_STATUSES),
  query('studentId').optional().isInt({ min: 1 }),
  query('feeId').optional().isInt({ min: 1 }),
  query('enrollmentId').optional().isInt({ min: 1 }),
  query('dueBefore').optional().isISO8601(),
  query('dueAfter').optional().isISO8601(),
  query('overdue').optional().isBoolean(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.createInvoiceValidator = [
  body('studentId').isInt({ min: 1 }).withMessage('studentId requis'),
  body('feeId').isInt({ min: 1 }).withMessage('feeId requis'),
  body('enrollmentId').optional({ nullable: true }).isInt({ min: 1 }),
  body('amount').optional().isFloat({ min: 0 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('status').optional().isIn(INVOICE_STATUSES),
  body('dueDate').optional().isISO8601(),
  body('notes').optional({ nullable: true }).isString(),
  body('installmentNo').optional().isInt({ min: 1 }),
];

exports.updateInvoiceValidator = [
  param('id').isInt({ min: 1 }),
  body('status').optional().isIn(INVOICE_STATUSES),
  body('dueDate').optional().isISO8601(),
  body('notes').optional({ nullable: true }).isString(),
];

exports.bulkGenerateValidator = [
  body('classId').isInt({ min: 1 }).withMessage('classId requis'),
  body('feeId').isInt({ min: 1 }).withMessage('feeId requis'),
  body('academicYear')
    .trim()
    .notEmpty()
    .matches(/^\d{4}-\d{4}$/),
];

exports.overdueValidator = [
  query('classId').optional().isInt({ min: 1 }),
];

// ═══════════════════════════════════════════════════════════
// PAIEMENTS
// ═══════════════════════════════════════════════════════════

exports.listPaymentsValidator = [
  query('status').optional().isIn(PAYMENT_STATUSES),
  query('method').optional().isIn(PAYMENT_METHODS),
  query('studentId').optional().isInt({ min: 1 }),
  query('invoiceId').optional().isInt({ min: 1 }),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.createPaymentValidator = [
  body('invoiceId').isInt({ min: 1 }).withMessage('invoiceId requis'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Le montant doit être supérieur à 0'),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('method').isIn(PAYMENT_METHODS).withMessage('Méthode de paiement invalide'),
  body('status').optional().isIn(PAYMENT_STATUSES),
  body('externalRef').optional({ nullable: true }).isString(),
  body('transactionId').optional({ nullable: true }).isString(),
  body('paidAt').optional({ nullable: true }).isISO8601(),
  body('notes').optional({ nullable: true }).isString(),
];

// ═══════════════════════════════════════════════════════════
// RAPPELS
// ═══════════════════════════════════════════════════════════

exports.listRemindersValidator = [
  query('status').optional().isIn(REMINDER_STATUSES),
  query('type').optional().isIn(REMINDER_TYPES),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

exports.createReminderValidator = [
  param('invoiceId').isInt({ min: 1 }),
  body('type').optional().isIn(REMINDER_TYPES),
];