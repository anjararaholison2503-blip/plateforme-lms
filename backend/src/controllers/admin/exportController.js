const catchAsync = require('../../utils/catchAsync');
const exportService = require('../../services/admin/exportService');

exports.exportOverdueExcel = catchAsync(async (req, res) => {
  const buffer = await exportService.exportOverdueInvoicesExcel(req.query);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="impayes-${Date.now()}.xlsx"`);
  res.send(buffer);
});

exports.exportOverduePDF = catchAsync(async (req, res) => {
  const buffer = await exportService.exportOverdueInvoicesPDF(req.query);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="impayes-${Date.now()}.pdf"`);
  res.send(buffer);
});

exports.exportPaymentsExcel = catchAsync(async (req, res) => {
  const buffer = await exportService.exportPaymentsExcel(req.query);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="paiements-${Date.now()}.xlsx"`);
  res.send(buffer);
});