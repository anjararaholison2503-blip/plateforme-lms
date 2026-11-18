const catchAsync = require('../../utils/catchAsync');
const dashboardService = require('../../services/common/dashboardService');

exports.getStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ status: 'success', data: stats });
});