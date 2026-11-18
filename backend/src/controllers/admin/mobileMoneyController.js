const catchAsync = require('../../utils/catchAsync');
const mobileMoneyService = require('../../services/admin/mobileMoneyService');

exports.createPayment = catchAsync(async (req, res) => {
  const result = await mobileMoneyService.createMobileMoneyPayment(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    message: 'Paiement Mobile Money effectué avec succès (mode simulation)',
    data: result,
  });
});

exports.getMyPayments = catchAsync(async (req, res) => {
  const result = await mobileMoneyService.getStudentMobileMoneyPayments(req.user.id);

  res.json({ status: 'success', data: result });
});

exports.getMyUnpaidInvoices = catchAsync(async (req, res) => {
  const invoices = await mobileMoneyService.getStudentUnpaidInvoices(req.user.id);

  res.json({ status: 'success', data: { invoices } });
});