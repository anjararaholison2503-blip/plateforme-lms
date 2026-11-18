const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

exports.getSettings = async () => {
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    throw new AppError('Configuration non trouvée', 404, 'SETTINGS_NOT_FOUND');
  }
  return settings;
};

exports.updateSettings = async (data) => {
  const existing = await prisma.platformSettings.findFirst();

  if (existing) {
    return prisma.platformSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  // Première configuration
  return prisma.platformSettings.create({ data });
};

exports.saveLogo = async (file) => {
  if (!file) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE_UPLOADED');
  }
  const logoUrl = `/uploads/logos/${file.filename}`;
  const existing = await prisma.platformSettings.findFirst();

  if (existing) {
    await prisma.platformSettings.update({
      where: { id: existing.id },
      data: { logoUrl },
    });
  }

  return logoUrl;
};