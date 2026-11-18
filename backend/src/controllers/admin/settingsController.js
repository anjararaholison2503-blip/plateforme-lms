const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const settingsService = require('../../services/admin/settingsService');

exports.getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings();
  res.json({ status: 'success', data: settings });
});

exports.updateSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json({ status: 'success', data: settings });
});

exports.uploadLogo = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE_UPLOADED');
  }
  const logoUrl = await settingsService.saveLogo(req.file);
  res.json({ status: 'success', data: { logoUrl } });
});