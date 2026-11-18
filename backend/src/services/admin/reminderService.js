const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const notificationService = require('../common/notificationService');

// ═══════════════════════════════════════════════════════════
// CRÉATION DE RAPPELS
// ═══════════════════════════════════════════════════════════

/**
 * Créer un rappel pour une facture
 */
exports.createReminder = async (invoiceId, type = 'EMAIL') => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: true,
      fee: { include: { feeType: true } },
    },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  const balance = Number(invoice.amount) - Number(invoice.paidAmount);
  const daysOverdue = Math.floor(
    (new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
  );

  const message = generateReminderMessage(invoice, balance, daysOverdue);

  const reminder = await prisma.paymentReminder.create({
    data: {
      invoiceId,
      type,
      status: 'PENDING',
      message,
      sentTo: type === 'EMAIL' ? invoice.student.email : invoice.student.phone,
    },
  });

  return reminder;
};

/**
 * Envoyer un rappel
 */
exports.sendReminder = async (reminderId) => {
  const reminder = await prisma.paymentReminder.findUnique({
    where: { id: reminderId },
    include: {
      invoice: {
        include: {
          student: true,
          fee: { include: { feeType: true } },
        },
      },
    },
  });

  if (!reminder) {
    throw new AppError('Rappel introuvable', 404, 'REMINDER_NOT_FOUND');
  }

  try {
    if (reminder.type === 'EMAIL') {
      await notificationService.sendEmail(
        reminder.invoice.student.email,
        `Rappel : Facture ${reminder.invoice.reference} en attente`,
        generateReminderEmailHtml(reminder.invoice, reminder.message)
      );
    } else if (reminder.type === 'SMS') {
      // SMS désactivé pour l'instant
      console.log(`📱 [SMS] ${reminder.sentTo} : ${reminder.message}`);
    } else if (reminder.type === 'IN_APP') {
      await notificationService.createNotification({
        userId: reminder.invoice.studentId,
        type: 'ENROLLMENT',
        title: 'Rappel de paiement',
        message: reminder.message,
      });
    }

    // Marquer comme envoyé
    await prisma.paymentReminder.update({
      where: { id: reminderId },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return { success: true };
  } catch (err) {
    await prisma.paymentReminder.update({
      where: { id: reminderId },
      data: { status: 'FAILED', error: err.message },
    });

    throw new AppError(`Erreur envoi rappel : ${err.message}`, 500, 'REMINDER_SEND_FAILED');
  }
};

// ═══════════════════════════════════════════════════════════
// RAPPELS AUTOMATIQUES
// ═══════════════════════════════════════════════════════════

/**
 * Envoyer des rappels automatiques pour toutes les factures en retard
 * (appelé par CRON)
 */
exports.sendAutomaticReminders = async () => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Factures en retard
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
      dueDate: { lt: now },
    },
    include: {
      student: true,
      fee: { include: { feeType: true } },
      reminders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const results = {
    total: overdueInvoices.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor(
      (now - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
    );

    // Vérifier le dernier rappel
    const lastReminder = invoice.reminders[0];

    // Envoyer un rappel si :
    // - Pas de rappel depuis 3 jours (rappel amical)
    // - OU pas de rappel depuis 7 jours (rappel urgent)
    // - OU pas de rappel depuis 30 jours (dernier avertissement)
    let shouldSend = false;
    let reminderType = 'EMAIL';

    if (!lastReminder) {
      shouldSend = true;
    } else {
      const daysSinceLastReminder = Math.floor(
        (now - new Date(lastReminder.createdAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue >= 30 && daysSinceLastReminder >= 30) {
        shouldSend = true;
      } else if (daysOverdue >= 7 && daysSinceLastReminder >= 7) {
        shouldSend = true;
      } else if (daysOverdue >= 3 && daysSinceLastReminder >= 3) {
        shouldSend = true;
      }
    }

    if (!shouldSend) {
      results.skipped++;
      continue;
    }

    try {
      const reminder = await exports.createReminder(invoice.id, reminderType);
      await exports.sendReminder(reminder.id);
      results.sent++;
    } catch (err) {
      console.error(`❌ Erreur rappel facture ${invoice.reference}:`, err.message);
      results.failed++;
    }
  }

  return results;
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.getInvoiceReminders = async (invoiceId) => {
  return prisma.paymentReminder.findMany({
    where: { invoiceId },
    orderBy: { createdAt: 'desc' },
  });
};

exports.getAllReminders = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [reminders, total] = await Promise.all([
    prisma.paymentReminder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    }),
    prisma.paymentReminder.count({ where }),
  ]);

  return {
    reminders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

const generateReminderMessage = (invoice, balance, daysOverdue) => {
  const studentName = `${invoice.student.firstName} ${invoice.student.lastName}`;
  const feeName = invoice.fee.feeType.name;
  const reference = invoice.reference;
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-FR');
  const amount = new Intl.NumberFormat('fr-FR').format(balance);

  if (daysOverdue <= 3) {
    return `Bonjour ${studentName}, nous vous rappelons que votre facture ${reference} (${feeName}) d'un montant de ${amount} ${invoice.currency} était due le ${dueDate}. Merci de procéder au paiement dans les plus brefs délais.`;
  } else if (daysOverdue <= 7) {
    return `Bonjour ${studentName}, votre facture ${reference} (${feeName}) d'un montant de ${amount} ${invoice.currency} est en retard de ${daysOverdue} jours. Merci de régulariser votre situation rapidement.`;
  } else if (daysOverdue <= 30) {
    return `⚠️ URGENT : ${studentName}, votre facture ${reference} (${feeName}) d'un montant de ${amount} ${invoice.currency} est en retard de ${daysOverdue} jours. Veuillez contacter le service financier immédiatement.`;
  } else {
    return `🚨 DERNIER AVERTISSEMENT : ${studentName}, votre facture ${reference} (${feeName}) d'un montant de ${amount} ${invoice.currency} est en retard de plus de ${daysOverdue} jours. Sans paiement sous 7 jours, votre accès sera restreint.`;
  }
};

const generateReminderEmailHtml = (invoice, message) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Rappel de paiement</h2>
      </div>
      <div style="padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px;">
        <p>${message}</p>
        <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Facture :</strong> ${invoice.reference}</p>
          <p><strong>Type :</strong> ${invoice.fee.feeType.name}</p>
          <p><strong>Montant total :</strong> ${new Intl.NumberFormat('fr-FR').format(invoice.amount)} ${invoice.currency}</p>
          <p><strong>Déjà payé :</strong> ${new Intl.NumberFormat('fr-FR').format(invoice.paidAmount)} ${invoice.currency}</p>
          <p><strong>Solde restant :</strong> <span style="color: #ef4444; font-weight: bold;">${new Intl.NumberFormat('fr-FR').format(Number(invoice.amount) - Number(invoice.paidAmount))} ${invoice.currency}</span></p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">MonCampus LMS</p>
      </div>
    </div>
  `;
};