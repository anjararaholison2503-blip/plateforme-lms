const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const paymentGatewayService = require('../../services/admin/paymentGatewayService');

exports.stripeCheckout = catchAsync(async (req, res) => {
  const { invoiceId } = req.body;
  if (!invoiceId) {
    throw new AppError('invoiceId requis', 400, 'MISSING_INVOICE_ID');
  }

  const result = await paymentGatewayService.createStripeCheckout(
    parseInt(invoiceId),
    req.user.id
  );

  res.json({ status: 'success', data: result });
});

exports.mobileMoneyInitiate = catchAsync(async (req, res) => {
  const { invoiceId, method, phone } = req.body;

  if (!invoiceId || !method || !phone) {
    throw new AppError('invoiceId, method et phone requis', 400, 'MISSING_FIELDS');
  }

  const result = await paymentGatewayService.initiateMobileMoneyPayment(
    parseInt(invoiceId),
    req.user.id,
    method,
    phone
  );

  res.json({ status: 'success', data: result });
});

exports.mobileMoneyConfirm = catchAsync(async (req, res) => {
  const { transactionId } = req.body;
  const result = await paymentGatewayService.confirmMobileMoneyPayment(
    parseInt(req.params.paymentId),
    transactionId
  );

  res.json({ status: 'success', data: result });
});