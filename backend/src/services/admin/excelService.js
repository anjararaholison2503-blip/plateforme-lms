const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

const SALT_ROUNDS = 12;

// ============ GÉNÉRATION DU MODÈLE EXCEL ============

exports.generateUserTemplate = () => {
  const headers = [
    'firstName',
    'lastName',
    'email',
    'password',
    'role',
    'status',
    'phone',
    'unitCode',
  ];

  // Exemples de lignes
  const examples = [
    {
      firstName: 'Marie',
      lastName: 'Rakoto',
      email: 'marie.rakoto@lms.local',
      password: 'Etudiant@123',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+261 34 00 000 01',
      unitCode: 'L1-INFO',
    },
    {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@lms.local',
      password: 'Enseignant@123',
      role: 'TEACHER',
      status: 'ACTIVE',
      phone: '+261 34 00 000 02',
      unitCode: 'DEP-INFO',
    },
    {
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@lms.local',
      password: 'Etudiant@123',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '',
      unitCode: '',
    },
  ];

  // Feuille principale
  const ws = XLSX.utils.json_to_sheet(examples, { header: headers });
  ws['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
  ];

  // Feuille d'instructions
  const instructions = [
    ['INSTRUCTIONS POUR L\'IMPORT DES UTILISATEURS'],
    [''],
    ['Champ', 'Obligatoire', 'Description / Valeurs acceptées'],
    ['firstName', 'Oui', 'Prénom de l\'utilisateur (max 100 caractères)'],
    ['lastName', 'Oui', 'Nom de famille (max 100 caractères)'],
    ['email', 'Oui', 'Doit être unique dans la base. Format email valide.'],
    ['password', 'Oui', 'Minimum 6 caractères'],
    ['role', 'Non', 'ADMIN, TEACHER, STUDENT, ACCOUNTANT, PARENT (défaut : STUDENT)'],
    ['status', 'Non', 'ACTIVE, INACTIVE, SUSPENDED, PENDING (défaut : ACTIVE)'],
    ['phone', 'Non', 'Numéro de téléphone (max 50 caractères)'],
    ['unitCode', 'Non', 'Code de l\'unité à rattacher (ex : L1-INFO, DEP-INFO). Voir la liste des codes dans la feuille "Unités".'],
    [''],
    ['⚠️ IMPORTANT :'],
    ['- Ne modifiez pas les noms des colonnes (ligne 1).'],
    ['- Supprimez les lignes d\'exemple avant d\'ajouter vos données.'],
    ['- Les emails en double seront rejetés.'],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  wsInstructions['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 60 }];

  // Feuille avec la liste des unités disponibles
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// ============ IMPORT EXCEL ============

exports.importUsers = async (fileBuffer, currentUserId) => {
  if (!fileBuffer) {
    throw new AppError('Aucun fichier fourni', 400, 'NO_FILE');
  }

  // 1. Lire le fichier Excel
  let workbook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } catch {
    throw new AppError('Fichier Excel invalide', 400, 'INVALID_FILE');
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rows.length === 0) {
    throw new AppError('Le fichier est vide', 400, 'EMPTY_FILE');
  }

  if (rows.length > 500) {
    throw new AppError(
      'Maximum 500 utilisateurs par import',
      400,
      'TOO_MANY_ROWS'
    );
  }

  // 2. Charger les unités pour résoudre unitCode → unitId
  const units = await prisma.institutionUnit.findMany({
    select: { id: true, code: true },
  });
  const unitMap = new Map(units.map((u) => [u.code, u.id]));

  // 3. Charger les emails existants
  const existingEmails = new Set(
    (await prisma.user.findMany({ select: { email: true } })).map((u) =>
      u.email.toLowerCase()
    )
  );

  // 4. Valider et préparer les données
  const results = {
    total: rows.length,
    success: 0,
    failed: 0,
    errors: [],
    created: [],
  };

  const seenEmails = new Set();
  const validUsers = [];

  rows.forEach((row, index) => {
    const lineNumber = index + 2; // +2 car ligne 1 = en-têtes
    const errors = [];

    // Nettoyage
    const firstName = String(row.firstName || '').trim();
    const lastName = String(row.lastName || '').trim();
    const email = String(row.email || '').trim().toLowerCase();
    const password = String(row.password || '').trim();
    const role = String(row.role || 'STUDENT').trim().toUpperCase();
    const status = String(row.status || 'ACTIVE').trim().toUpperCase();
    const phone = String(row.phone || '').trim();
    const unitCode = String(row.unitCode || '').trim();

    // Validations
    if (!firstName) errors.push('Prénom manquant');
    if (!lastName) errors.push('Nom manquant');
    if (!email) errors.push('Email manquant');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide');
    if (!password) errors.push('Mot de passe manquant');
    else if (password.length < 6) errors.push('Mot de passe trop court (min 6)');

    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'PARENT'];
    if (!validRoles.includes(role)) {
      errors.push(`Rôle invalide "${role}" (attendu : ${validRoles.join(', ')})`);
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      errors.push(`Statut invalide "${status}"`);
    }

    if (email && existingEmails.has(email)) {
      errors.push('Cet email existe déjà en base');
    }
    if (email && seenEmails.has(email)) {
      errors.push('Email en doublon dans le fichier');
    }

    let unitId = null;
    if (unitCode) {
      if (unitMap.has(unitCode)) {
        unitId = unitMap.get(unitCode);
      } else {
        errors.push(`Code d'unité "${unitCode}" introuvable`);
      }
    }

    if (errors.length > 0) {
      results.failed++;
      results.errors.push({
        line: lineNumber,
        email: email || '(vide)',
        messages: errors,
      });
    } else {
      seenEmails.add(email);
      validUsers.push({
        firstName,
        lastName,
        email,
        password,
        role,
        status,
        phone: phone || null,
        unitId,
      });
    }
  });

  // 5. Insérer les utilisateurs valides
  for (const userData of validUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const created = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
      results.success++;
      results.created.push(created);
    } catch (err) {
      results.failed++;
      results.errors.push({
        line: '?',
        email: userData.email,
        messages: [`Erreur insertion : ${err.message}`],
      });
    }
  }

  return results;
};