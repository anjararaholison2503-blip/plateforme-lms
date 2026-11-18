// ═══════════════════════════════════════════════════════════
// CONFIGURATION SMS (préparée mais désactivée)
// ═══════════════════════════════════════════════════════════
//
// Pour activer les SMS plus tard :
// 1. Créer un compte Twilio (https://www.twilio.com)
// 2. Récupérer : ACCOUNT_SID, AUTH_TOKEN, FROM_NUMBER
// 3. Remplir les variables dans .env
// 4. Mettre SMS_ENABLED=true
// 5. Redémarrer le serveur
//
// ═══════════════════════════════════════════════════════════

const smsConfig = {
  enabled: process.env.SMS_ENABLED === 'true',
  provider: process.env.SMS_PROVIDER || 'twilio',
  accountSid: process.env.SMS_ACCOUNT_SID || null,
  authToken: process.env.SMS_AUTH_TOKEN || null,
  fromNumber: process.env.SMS_FROM_NUMBER || null,
};

// Vérifier la configuration
const verifySmsConfig = () => {
  if (!smsConfig.enabled) {
    console.log('📱 SMS : désactivé (SMS_ENABLED=false)');
    return false;
  }

  if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.fromNumber) {
    console.log('⚠️ SMS : configuration incomplète');
    return false;
  }

  console.log(`✅ SMS : configuré (${smsConfig.provider})`);
  return true;
};

// Fonction d'envoi (placeholder)
const sendSms = async (to, message) => {
  if (!smsConfig.enabled) {
    console.log(`📱 [SMS DÉSACTIVÉ] Vers ${to} : ${message}`);
    return { success: false, reason: 'SMS_DISABLED' };
  }

  // TODO : Implémenter Twilio quand prêt
  // const twilio = require('twilio')(smsConfig.accountSid, smsConfig.authToken);
  // const result = await twilio.messages.create({
  //   body: message,
  //   from: smsConfig.fromNumber,
  //   to,
  // });

  console.log(`📱 [SMS SIMULÉ] Vers ${to} : ${message}`);
  return { success: true, simulated: true };
};

module.exports = {
  smsConfig,
  verifySmsConfig,
  sendSms,
};