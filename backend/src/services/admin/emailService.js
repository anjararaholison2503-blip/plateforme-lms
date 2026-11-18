const nodemailer = require('nodemailer');

// Utiliser les mêmes identifiants que dans config/email.js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendApprovalEmail = async (studentEmail, studentName, reference) => {
  try {
    const mailOptions = {
      from: `"MASTERCLASS LMS" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: '✅ Votre inscription a été validée !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">MASTERCLASS LMS</h1>
          </div>
          <h2 style="color: #1e293b;">Bonjour ${studentName},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Nous avons le plaisir de vous informer que votre dossier d'inscription a été <strong>validé</strong> par l'administration.
          </p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #334155;"><strong>Référence de dossier :</strong> ${reference}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Pour finaliser votre inscription, veuillez vous connecter à votre espace étudiant et procéder au paiement des frais de scolarité.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Se connecter à mon espace
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
            Cet email est automatique, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de validation envoyé à ${studentEmail}`);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    // On ne bloque pas la validation si l'email échoue
  }
};