const multer = require('multer');
const AppError = require('../errors/AppError');

// Stockage en mémoire (buffer) — parfait pour les imports
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
  ];

  const allowedExt = /\.(xlsx|xls)$/i;

  if (allowedMimes.includes(file.mimetype) || allowedExt.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new AppError('Seuls les fichiers Excel (.xlsx, .xls) sont acceptés', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
});

module.exports = upload;