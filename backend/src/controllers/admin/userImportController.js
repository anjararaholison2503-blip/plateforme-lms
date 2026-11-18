const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../errors/AppError');
const excelService = require('../../services/admin/excelService');

// Télécharger le modèle Excel
exports.downloadTemplate = catchAsync(async (req, res) => {
  const buffer = excelService.generateUserTemplate();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="modele_import_utilisateurs.xlsx"'
  );
  res.send(buffer);
});

// Importer un fichier Excel
exports.importUsers = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE');
  }

  const result = await excelService.importUsers(req.file.buffer, req.user.id);
  res.json({ status: 'success', data: result });
});