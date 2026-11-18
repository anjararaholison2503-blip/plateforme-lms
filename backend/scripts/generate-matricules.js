const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateMatriculesForExistingStudents() {
  console.log('🔄 Génération des matricules pour les étudiants existants...\n');

  // Récupérer les étudiants sans matricule
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      matricule: null,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📋 ${students.length} étudiant(s) à traiter\n`);

  let count = 0;
  for (const student of students) {
    const year = new Date(student.createdAt).getFullYear();
    const prefix = `ETU-${year}-`;

    // Trouver le dernier matricule de cette année
    const lastUser = await prisma.user.findFirst({
      where: {
        matricule: { startsWith: prefix },
      },
      orderBy: { matricule: 'desc' },
      select: { matricule: true },
    });

    let nextNumber = 1;
    if (lastUser?.matricule) {
      nextNumber = parseInt(lastUser.matricule.replace(prefix, ''), 10) + 1;
    }

    const matricule = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    await prisma.user.update({
      where: { id: student.id },
      data: { matricule },
    });

    console.log(`✅ ${student.firstName} ${student.lastName} → ${matricule}`);
    count++;
  }

  console.log(`\n🎉 ${count} matricule(s) généré(s) avec succès !`);
}

generateMatriculesForExistingStudents()
  .catch((err) => {
    console.error('❌ Erreur :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });