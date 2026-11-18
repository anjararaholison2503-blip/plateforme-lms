// backend/src/jobs/materialCleanupJob.js
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/database');

const cleanupExpiredMaterials = async () => {
  console.log('🧹 Nettoyage des supports expirés...');
  
  try {
    const expired = await prisma.courseMaterial.findMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    console.log(`   ${expired.length} support(s) expiré(s) trouvé(s)`);

    for (const material of expired) {
      try {
        // Supprimer le fichier physique
        if (material.fileUrl && material.type !== 'LINK') {
          const filePath = path.join(__dirname, '../../', material.fileUrl);
          await fs.unlink(filePath).catch(() => {});
        }

        // Supprimer l'entrée en base
        await prisma.courseMaterial.delete({ where: { id: material.id } });

        console.log(`   ✅ Supprimé : ${material.title}`);
      } catch (err) {
        console.error(`   ❌ Erreur sur ${material.title}:`, err.message);
      }
    }

    console.log('🧹 Nettoyage terminé');
  } catch (err) {
    console.error('❌ Erreur nettoyage:', err);
  }
};

// Planifier : tous les jours à 3h du matin
cron.schedule('0 3 * * *', cleanupExpiredMaterials, {
  timezone: 'Africa/Antananarivo',
});

// Nettoyage au démarrage du serveur
cleanupExpiredMaterials();

module.exports = { cleanupExpiredMaterials };