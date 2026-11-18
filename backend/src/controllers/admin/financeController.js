const { validationResult } = require('express-validator');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');

const feeService = require('../../services/admin/feeService');
const invoiceService = require('../../services/admin/invoiceService');
const paymentService = require('../../services/admin/paymentService');
const reminderService = require('../../services/admin/reminderService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Données invalides', 400, 'VALIDATION_ERROR', errors.array()));
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// TYPES DE FRAIS
// ═══════════════════════════════════════════════════════════

exports.listFeeTypes = [
  validate,
  catchAsync(async (req, res) => {
    const types = await feeService.getAllFeeTypes(req.query);
    res.json({ status: 'success', data: types });
  }),
];

exports.getFeeType = [
  validate,
  catchAsync(async (req, res) => {
    const type = await feeService.getFeeTypeById(parseInt(req.params.id));
    res.json({ status: 'success', data: type });
  }),
];

exports.createFeeType = [
  validate,
  catchAsync(async (req, res) => {
    const type = await feeService.createFeeType(req.body);
    res.status(201).json({ status: 'success', data: type });
  }),
];

exports.updateFeeType = [
  validate,
  catchAsync(async (req, res) => {
    const type = await feeService.updateFeeType(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: type });
  }),
];

exports.deleteFeeType = [
  validate,
  catchAsync(async (req, res) => {
    const result = await feeService.deleteFeeType(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// FRAIS
// ═══════════════════════════════════════════════════════════

exports.listFees = [
  validate,
  catchAsync(async (req, res) => {
    const fees = await feeService.getAllFees(req.query);
    res.json({ status: 'success', data: fees });
  }),
];

exports.getFee = [
  validate,
  catchAsync(async (req, res) => {
    const fee = await feeService.getFeeById(parseInt(req.params.id));
    res.json({ status: 'success', data: fee });
  }),
];

exports.createFee = [
  validate,
  catchAsync(async (req, res) => {
    const fee = await feeService.createFee(req.body);
    res.status(201).json({ status: 'success', data: fee });
  }),
];

exports.updateFee = [
  validate,
  catchAsync(async (req, res) => {
    const fee = await feeService.updateFee(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: fee });
  }),
];

exports.deleteFee = [
  validate,
  catchAsync(async (req, res) => {
    const result = await feeService.deleteFee(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.getFeeStats = catchAsync(async (req, res) => {
  const stats = await feeService.getFeeStats(req.query.academicYear);
  res.json({ status: 'success', data: stats });
});

// ═══════════════════════════════════════════════════════════
// FACTURES
// ═══════════════════════════════════════════════════════════

exports.listInvoices = [
  validate,
  catchAsync(async (req, res) => {
    const result = await invoiceService.getAllInvoices(req.query);
    res.json({
      status: 'success',
      data: result.invoices,
      pagination: result.pagination,
    });
  }),
];

exports.getInvoice = [
  validate,
  catchAsync(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(parseInt(req.params.id));
    res.json({ status: 'success', data: invoice });
  }),
];

exports.createInvoice = [
  validate,
  catchAsync(async (req, res) => {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ status: 'success', data: invoice });
  }),
];

exports.updateInvoice = [
  validate,
  catchAsync(async (req, res) => {
    const invoice = await invoiceService.updateInvoice(parseInt(req.params.id), req.body);
    res.json({ status: 'success', data: invoice });
  }),
];

exports.deleteInvoice = [
  validate,
  catchAsync(async (req, res) => {
    const result = await invoiceService.deleteInvoice(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.bulkGenerateInvoices = [
  validate,
  catchAsync(async (req, res) => {
    const result = await invoiceService.bulkGenerateInvoices(
      parseInt(req.body.classId),
      parseInt(req.body.feeId),
      req.body.academicYear
    );
    res.json({ status: 'success', data: result });
  }),
];

exports.getStudentInvoices = [
  validate,
  catchAsync(async (req, res) => {
    const result = await invoiceService.getStudentInvoices(
      parseInt(req.params.studentId),
      req.query
    );
    res.json({ status: 'success', data: result });
  }),
];

exports.getInvoiceStats = catchAsync(async (req, res) => {
  const stats = await invoiceService.getInvoiceStats();
  res.json({ status: 'success', data: stats });
});

exports.getOverdueInvoices = [
  validate,
  catchAsync(async (req, res) => {
    const result = await invoiceService.getOverdueInvoices(req.query);
    res.json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// PAIEMENTS
// ═══════════════════════════════════════════════════════════

exports.listPayments = [
  validate,
  catchAsync(async (req, res) => {
    const result = await paymentService.getAllPayments(req.query);
    res.json({
      status: 'success',
      data: result.payments,
      pagination: result.pagination,
    });
  }),
];

exports.getPayment = [
  validate,
  catchAsync(async (req, res) => {
    const payment = await paymentService.getPaymentById(parseInt(req.params.id));
    res.json({ status: 'success', data: payment });
  }),
];

exports.createPayment = [
  validate,
  catchAsync(async (req, res) => {
    const payment = await paymentService.createPayment(req.body, req.user.id);
    res.status(201).json({ status: 'success', data: payment });
  }),
];

exports.cancelPayment = [
  validate,
  catchAsync(async (req, res) => {
    const result = await paymentService.cancelPayment(parseInt(req.params.id), req.user.id);
    res.json({ status: 'success', data: result });
  }),
];

exports.getStudentPayments = [
  validate,
  catchAsync(async (req, res) => {
    const result = await paymentService.getStudentPayments(parseInt(req.params.studentId));
    res.json({ status: 'success', data: result });
  }),
];

exports.getPaymentStats = catchAsync(async (req, res) => {
  const stats = await paymentService.getPaymentStats(req.query);
  res.json({ status: 'success', data: stats });
});

// ═══════════════════════════════════════════════════════════
// RAPPELS
// ═══════════════════════════════════════════════════════════

exports.listReminders = [
  validate,
  catchAsync(async (req, res) => {
    const result = await reminderService.getAllReminders(req.query);
    res.json({
      status: 'success',
      data: result.reminders,
      pagination: result.pagination,
    });
  }),
];

exports.createReminder = [
  validate,
  catchAsync(async (req, res) => {
    const reminder = await reminderService.createReminder(
      parseInt(req.params.invoiceId),
      req.body.type
    );
    res.status(201).json({ status: 'success', data: reminder });
  }),
];

exports.sendReminder = [
  validate,
  catchAsync(async (req, res) => {
    const result = await reminderService.sendReminder(parseInt(req.params.id));
    res.json({ status: 'success', data: result });
  }),
];

exports.sendAutomaticReminders = catchAsync(async (req, res) => {
  const result = await reminderService.sendAutomaticReminders();
  res.json({ status: 'success', data: result });
});

// ═══════════════════════════════════════════════════════════
// PAIEMENT MULTIPLE
// ═══════════════════════════════════════════════════════════

exports.createBulkPayments = [
  validate,
  catchAsync(async (req, res) => {
    const { payments } = req.body;

    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      throw new AppError('Liste de paiements requise', 400, 'MISSING_PAYMENTS');
    }

    const result = await paymentService.createBulkPayments(payments, req.user.id);
    res.status(201).json({ status: 'success', data: result });
  }),
];

// ═══════════════════════════════════════════════════════════
// REÇU PDF
// ═══════════════════════════════════════════════════════════

exports.downloadReceipt = catchAsync(async (req, res) => {
  const receiptService = require('../../services/admin/receiptService');
  const pdfBuffer = await receiptService.generateReceiptPDF(req.params.reference);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="recu-${req.params.reference}.pdf"`);
  res.send(pdfBuffer);
});