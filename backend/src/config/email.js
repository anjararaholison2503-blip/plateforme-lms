const nodemailer = require('nodemailer');

// Créer le transporteur
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Vérifier la connexion au démarrage
const verifyConnection = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email non configuré (EMAIL_USER/EMAIL_PASSWORD manquants)');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email configuré (Nodemailer + Gmail)');
    return true;
  } catch (err) {
    console.error('❌ Email non configuré :', err.message);
    return false;
  }
};

module.exports = {
  transporter,
  verifyConnection,
};