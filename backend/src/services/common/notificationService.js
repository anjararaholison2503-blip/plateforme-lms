const prisma = require('../../config/database');
const { transporter } = require('../../config/email');
const { sendSms, smsConfig } = require('../../config/sms');
const AppError = require('../../errors/AppError');
const { getIO } = require('../../config/socket');
// ═══════════════════════════════════════════════════════════
// CRÉATION DE NOTIFICATION (BASE DE DONNÉES)
// ═══════════════════════════════════════════════════════════

/**
 * Créer une notification en base (in-app)
 * ⚠️ userId est OPTIONNEL — si null, la notification n'est pas créée en base
 * mais peut quand même être envoyée par email/SMS
 */
const createNotification = async (data) => {
  if (!data.userId) {
    console.log('📭 Notification in-app ignorée (pas de userId)');
    return null;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || null,
        channel: data.channel || 'IN_APP',
        materialId: data.materialId || null,
        status: 'PENDING',
      },
    });

    // ═══════════════════════════════════════════════════════
    // ÉMETTRE EN TEMPS RÉEL VIA SOCKET.IO
    // ═══════════════════════════════════════════════════════
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${data.userId}`).emit('notification:new', notification);
        console.log(`📡 Notification temps réel envoyée à user:${data.userId}`);
      }
    } catch (socketErr) {
      console.warn('⚠️  Erreur envoi Socket.IO:', socketErr.message);
    }

    return notification;
  } catch (err) {
    console.error('❌ Erreur création notification:', err.message);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// ENVOI EMAIL
// ═══════════════════════════════════════════════════════════

const sendEmail = async (to, subject, htmlContent) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('📧 Email désactivé (non configuré)');
    return { success: false, reason: 'EMAIL_NOT_CONFIGURED' };
  }

  if (!to) {
    console.log('📧 Email ignoré (destinataire manquant)');
    return { success: false, reason: 'NO_RECIPIENT' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'MonCampus'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`📧 Email envoyé à ${to} : ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Erreur email à ${to} :`, err.message);
    return { success: false, error: err.message };
  }
};

// ═══════════════════════════════════════════════════════════
// TEMPLATES EMAIL
// ═══════════════════════════════════════════════════════════

const emailTemplates = {
  // ─── Matériel : expiration ───
  MATERIAL_EXPIRING: (data) => ({
    subject: `⚠️ Votre support "${data.materialTitle}" expire bientôt`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Support bientôt expiré</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Le support suivant expirera dans <strong>${data.daysLeft} jour(s)</strong> :</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Titre :</strong> ${data.materialTitle}</p>
          <p><strong>Cours :</strong> ${data.courseName}</p>
          <p><strong>Expire le :</strong> ${data.expiresAt}</p>
        </div>
        <p><a href="${data.actionUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Voir le support</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">MonCampus LMS</p>
      </div>
    `,
  }),

  MATERIAL_EXPIRING_URGENT: (data) => ({
    subject: `🚨 DERNIER JOUR : "${data.materialTitle}" expire demain`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">🚨 Dernier jour !</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Le support suivant expirera <strong>demain</strong> :</p>
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
          <p><strong>Titre :</strong> ${data.materialTitle}</p>
          <p><strong>Cours :</strong> ${data.courseName}</p>
        </div>
        <p>Si vous ne faites rien, il sera <strong>supprimé automatiquement</strong> après une période de grâce de 7 jours.</p>
        <p><a href="${data.actionUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Prolonger maintenant</a></p>
      </div>
    `,
  }),

  MATERIAL_EXPIRED: (data) => ({
    subject: `❌ Support expiré : "${data.materialTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">❌ Support expiré</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Le support suivant a expiré :</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Titre :</strong> ${data.materialTitle}</p>
          <p><strong>Cours :</strong> ${data.courseName}</p>
        </div>
        <p>Il sera supprimé automatiquement après 7 jours de grâce.</p>
      </div>
    `,
  }),

  MATERIAL_EXTENDED: (data) => ({
    subject: `✅ Support prolongé : "${data.materialTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Support prolongé</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Le support suivant a été prolongé jusqu'au <strong>${data.newExpiresAt}</strong> :</p>
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
          <p><strong>Titre :</strong> ${data.materialTitle}</p>
          <p><strong>Cours :</strong> ${data.courseName}</p>
        </div>
      </div>
    `,
  }),

  NEW_MATERIAL: (data) => ({
    subject: `📚 Nouveau support dans "${data.courseName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📚 Nouveau support disponible</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Un nouveau support a été ajouté au cours <strong>${data.courseName}</strong> :</p>
        <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #3b82f6;">
          <p><strong>Titre :</strong> ${data.materialTitle}</p>
          <p><strong>Type :</strong> ${data.materialType}</p>
          <p><strong>Déposé par :</strong> ${data.uploaderName}</p>
        </div>
        <p><a href="${data.actionUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Voir le support</a></p>
      </div>
    `,
  }),

  // ─── Inscription : validation ───
  ENROLLMENT_APPROVED: (data) => ({
    subject: `✅ Votre inscription est acceptée - ${data.enrollmentReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">✅ Inscription acceptée</h2>
        </div>
        <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <p>Bonjour <strong>${data.studentName}</strong>,</p>
          <p>Nous avons le plaisir de vous informer que votre dossier d'inscription a été <strong>accepté</strong>.</p>
          <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
            <p style="margin: 4px 0;"><strong>Référence :</strong> ${data.enrollmentReference}</p>
            <p style="margin: 4px 0;"><strong>Année académique :</strong> ${data.academicYear || 'N/A'}</p>
          </div>
          <p>Vous recevrez prochainement vos identifiants de connexion ainsi que les instructions de paiement.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">MonCampus LMS</p>
        </div>
      </div>
    `,
  }),

  ENROLLMENT_REJECTED: (data) => ({
    subject: `❌ Votre inscription - ${data.enrollmentReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">❌ Inscription non retenue</h2>
        </div>
        <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <p>Bonjour <strong>${data.studentName}</strong>,</p>
          <p>Nous sommes au regret de vous informer que votre demande d'inscription n'a pas été retenue.</p>
          <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 4px 0;"><strong>Référence :</strong> ${data.enrollmentReference}</p>
            <p style="margin: 4px 0;"><strong>Motif :</strong> ${data.reason || 'Non spécifié'}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">MonCampus LMS</p>
        </div>
      </div>
    `,
  }),

  // ─── Finance : rappel de paiement ───
  PAYMENT_REMINDER: (data) => ({
    subject: `💳 Rappel de paiement - Facture ${data.invoiceReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">💳 Rappel de paiement</h2>
        </div>
        <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <p>Bonjour <strong>${data.studentName}</strong>,</p>
          <p>${data.message}</p>
          <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 4px 0;"><strong>Facture :</strong> ${data.invoiceReference}</p>
            <p style="margin: 4px 0;"><strong>Type :</strong> ${data.feeType || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Montant dû :</strong> ${data.amount} ${data.currency || 'MGA'}</p>
            <p style="margin: 4px 0;"><strong>Échéance :</strong> ${data.dueDate}</p>
          </div>
        </div>
      </div>
    `,
  }),
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS COMPOSITES
// ═══════════════════════════════════════════════════════════

/**
 * Envoyer une notification multi-canal
 * ⚠️ userId peut être null (ex: notification à un étudiant qui n'a pas encore de compte)
 */
const sendNotification = async ({
  userId,
  type,
  title,
  message,
  data = null,
  materialId = null,
  channels = ['IN_APP'],
  emailTemplate = null,
  emailData = null,
  emailTo = null,           // ← NOUVEAU : email direct sans userId
}) => {
  const results = {
    inApp: null,
    email: null,
    sms: null,
  };

  // ─── 1. Notification in-app (uniquement si userId) ───
  if (channels.includes('IN_APP') && userId) {
    results.inApp = await createNotification({
      userId,
      type,
      title,
      message,
      data,
      materialId,
      channel: 'IN_APP',
    });
  }

  // ─── 2. Envoi par email ───
  if (channels.includes('EMAIL')) {
    try {
      let recipientEmail = emailTo;

      // Si pas d'email direct, chercher l'utilisateur
      if (!recipientEmail && userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true, lastName: true },
        });
        recipientEmail = user?.email;
      }

      if (recipientEmail && emailTemplate && emailData) {
        const templateFn = emailTemplates[emailTemplate];
        if (templateFn) {
          const template = templateFn(emailData);
          const emailResult = await sendEmail(recipientEmail, template.subject, template.html);
          results.email = emailResult;
        } else {
          console.warn(`⚠️ Template email "${emailTemplate}" non trouvé`);
        }
      }
    } catch (err) {
      console.error('❌ Erreur envoi email :', err.message);
    }
  }

  // ─── 3. Envoi par SMS (désactivé par défaut) ───
  if (channels.includes('SMS') && smsConfig.enabled) {
    try {
      let phone = null;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { phone: true },
        });
        phone = user?.phone;
      }

      if (phone) {
        const smsResult = await sendSms(phone, `${title} : ${message}`);
        results.sms = smsResult;
      }
    } catch (err) {
      console.error('❌ Erreur envoi SMS :', err.message);
    }
  }

  return results;
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS DE MASSE
// ═══════════════════════════════════════════════════════════

const sendBulkNotifications = async (userIds, notificationData) => {
  const results = [];

  for (const userId of userIds) {
    try {
      const result = await sendNotification({
        ...notificationData,
        userId,
      });
      results.push({ userId, success: true, result });
    } catch (err) {
      results.push({ userId, success: false, error: err.message });
    }
  }

  return results;
};

// ═══════════════════════════════════════════════════════════
// LECTURE DES NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

const getUserNotifications = async (userId, filters = {}) => {
  const where = { userId };

  if (filters.unreadOnly) {
    where.readAt = null;
  }

  if (filters.type) where.type = filters.type;

  const limit = parseInt(filters.limit) || 20;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        material: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, title: true, code: true } },
          },
        },
      },
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return { notifications, unreadCount };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError('Notification introuvable', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date(), status: 'READ' },
  });
};

const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date(), status: 'READ' },
  });

  return { count: result.count };
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

module.exports = {
  createNotification,
  sendEmail,
  sendNotification,
  sendBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};