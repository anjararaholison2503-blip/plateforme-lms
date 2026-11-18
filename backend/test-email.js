require('dotenv').config();

const { verifyConnection } = require('./src/config/email');

(async () => {
  console.log('=== Test de la configuration email ===\n');
  
  console.log('Variables d\'environnement :');
  console.log('  EMAIL_HOST     :', process.env.EMAIL_HOST || '❌ manquant');
  console.log('  EMAIL_PORT     :', process.env.EMAIL_PORT || '❌ manquant');
  console.log('  EMAIL_USER     :', process.env.EMAIL_USER || '❌ manquant');
  console.log('  EMAIL_PASSWORD :', process.env.EMAIL_PASSWORD ? `✅ défini (${process.env.EMAIL_PASSWORD.length} caractères)` : '❌ manquant');
  console.log('');
  
  console.log('Test de connexion SMTP...');
  const ok = await verifyConnection();
  console.log('');
  console.log('Résultat final :', ok ? '✅ OK' : '❌ ÉCHEC');
  
  process.exit(0);
})();