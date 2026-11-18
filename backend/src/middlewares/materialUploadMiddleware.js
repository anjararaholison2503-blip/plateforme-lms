const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../errors/AppError');

// ═══════════════════════════════════════════════════════════
// CONFIGURATION DU STOCKAGE
// ═══════════════════════════════════════════════════════════

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 Mo

// Créer le dossier de destination s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads/materials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Stockage par année/mois pour organiser
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(uploadDir, yearMonth);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// ═══════════════════════════════════════════════════════════
// FILTRE DES TYPES DE FICHIERS
// ═══════════════════════════════════════════════════════════

const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',

  // Vidéos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',

  // Autres
  'application/octet-stream', // fallback pour certains navigateurs
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Type de fichier non autorisé : ${file.mimetype}`,
        400,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // 1 seul fichier à la fois
  },
});

module.exports = upload;