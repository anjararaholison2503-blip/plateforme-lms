const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // 1. Configuration par défaut de la plateforme
  const existingSettings = await prisma.platformSettings.findFirst();

  if (!existingSettings) {
    await prisma.platformSettings.create({
      data: {
        platformName: 'MonCampus',
        platformShortName: 'MC',
        description: 'Plateforme LMS nouvelle génération',
        academicYear: '2025-2026',
        currency: 'MGA',
        currencySymbol: 'Ar',
      },
    });
    console.log('✅ Configuration plateforme créée');
  }

  // 2. Unité racine (établissement)
  let rootUnit = await prisma.institutionUnit.findFirst({
    where: { type: 'ESTABLISHMENT' },
  });

  if (!rootUnit) {
    rootUnit = await prisma.institutionUnit.create({
      data: {
        name: 'Mon Établissement',
        code: 'ROOT',
        type: 'ESTABLISHMENT',
        description: 'Établissement principal',
      },
    });
    console.log('✅ Unité racine créée');
  }

  // 3. Compte administrateur
  const adminEmail = 'admin@lms.local';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        unitId: rootUnit.id,
      },
    });
    console.log('✅ Admin créé : admin@lms.local / Admin@123');
  }

  console.log('🎉 Seed terminé avec succès');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });