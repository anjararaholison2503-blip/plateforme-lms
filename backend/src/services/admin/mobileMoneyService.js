const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');
const paymentService = require('./paymentService');
const receiptService = require('./receiptService');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCE SIMULÉE
// ═══════════════════════════════════════════════════════════

/**
 * Génère une référence externe simulée (ex: SIM-MVOLA-1792089240123)
 */
const generateSimulatedRef = (operator) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SIM-${operator}-${timestamp}-${random}`;
};

/**
 * Mappe l'opérateur vers le PaymentMethod Prisma
 */
const getPaymentMethod = (operator) => {
  const map = {
    MVOLA: 'MOBILE_MONEY_MVOLA',
    ORANGE: 'MOBILE_MONEY_ORANGE',
    AIRTEL: 'MOBILE_MONEY_AIRTEL',
  };
  return map[operator] || 'MOBILE_MONEY_MVOLA';
};

/**
 * Valide le numéro de téléphone (format malgache)
 * Accepte : 034xxxxxxx, 033xxxxxxx, 032xxxxxxx, +261xxxxxxxxx
 */
const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\s+/g, '');
  const regex = /^(\+261|0)(32|33|34|38)\d{7}$/;
  return regex.test(cleaned);
};

// ═══════════════════════════════════════════════════════════
// CRÉATION D'UN PAIEMENT MOBILE MONEY (SIMULATION)
// ═══════════════════════════════════════════════════════════

/**
 * Crée un paiement Mobile Money en mode simulation
 * 
 * @param {object} data - { invoiceId, amount, operator, phoneNumber, notes }
 * @param {number} studentId - ID de l'étudiant
 * @returns {object} - { payment, receipt, pdfUrl }
 */
exports.createMobileMoneyPayment = async (data, studentId) => {
  const { invoiceId, amount, operator, phoneNumber, notes } = data;

  // ─── Validations ───
  if (!invoiceId || !amount || !operator || !phoneNumber) {
    throw new AppError(
      'invoiceId, amount, operator et phoneNumber sont requis',
      400,
      'MISSING_FIELDS'
    );
  }

  if (!['MVOLA', 'ORANGE', 'AIRTEL'].includes(operator)) {
    throw new AppError('Opérateur invalide (MVOLA, ORANGE, AIRTEL)', 400, 'INVALID_OPERATOR');
  }

  if (!validatePhoneNumber(phoneNumber)) {
    throw new AppError('Numéro de téléphone invalide', 400, 'INVALID_PHONE');
  }

  // ─── Vérifier la facture ───
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(invoiceId) },
    include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  if (invoice.studentId !== studentId) {
    throw new AppError('Cette facture ne vous appartient pas', 403, 'FORBIDDEN');
  }

  if (['PAID', 'CANCELLED'].includes(invoice.status)) {
    throw new AppError(`Facture déjà ${invoice.status.toLowerCase()}`, 400, 'INVALID_STATUS');
  }

  // ─── Vérifier le montant ───
  const remainingAmount = Number(invoice.amount) - Number(invoice.paidAmount);
  const paymentAmount = Number(amount);

  if (paymentAmount <= 0) {
    throw new AppError('Le montant doit être positif', 400, 'INVALID_AMOUNT');
  }

  if (paymentAmount > remainingAmount) {
    throw new AppError(
      `Le montant dépasse le solde restant (${remainingAmount} ${invoice.currency})`,
      400,
      'AMOUNT_EXCEEDS_BALANCE'
    );
  }

  // ─── Générer la référence simulée ───
  const simulatedRef = generateSimulatedRef(operator);
  const method = getPaymentMethod(operator);

  // ─── Créer le paiement via paymentService ───
  const payment = await paymentService.createPayment(
    {
      invoiceId: parseInt(invoiceId),
      amount: paymentAmount,
      currency: invoice.currency,
      method,
      status: 'COMPLETED',           // ✅ Validation AUTO (Q4 = A)
      externalRef: simulatedRef,
      transactionId: simulatedRef,
      paidAt: new Date(),
      notes: notes || `Paiement Mobile Money ${operator} - ${phoneNumber}`,
    },
    studentId
  );

  // ─── Mettre à jour les metadata pour tracer la simulation ───
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        simulationMode: true,
        operator,
        phoneNumber,
        simulatedRef,
        simulatedAt: new Date().toISOString(),
        invoiceReference: invoice.reference,
      },
    },
  });

  // ─── Générer le PDF du reçu ───
  const fullPayment = await paymentService.getPaymentById(payment.id);

  if (!fullPayment.receipt) {
    throw new AppError('Erreur génération reçu', 500, 'RECEIPT_ERROR');
  }

  // Générer le PDF
  const pdfBuffer = await receiptService.generateReceiptPDF(fullPayment.receipt.reference);

  // Sauvegarder le PDF
  const receiptsDir = path.join(__dirname, '../../../uploads/receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const filename = `${fullPayment.receipt.reference}.pdf`;
  const filepath = path.join(receiptsDir, filename);
  fs.writeFileSync(filepath, pdfBuffer);

  const pdfUrl = `/uploads/receipts/${filename}`;

  // Mettre à jour le Receipt avec l'URL
  await prisma.receipt.update({
    where: { id: fullPayment.receipt.id },
    data: { fileUrl: pdfUrl },
  });

  // ─── Notifier l'admin ───
  await notifyAdmins({
    title: '💰 Nouveau paiement Mobile Money',
    message: `L'étudiant ${invoice.student.firstName} ${invoice.student.lastName} a payé ${paymentAmount} ${invoice.currency} via ${operator}.`,
    data: {
      paymentId: payment.id,
      invoiceId: invoice.id,
      amount: paymentAmount,
      operator,
      phoneNumber,
      receiptRef: fullPayment.receipt.reference,
      pdfUrl,
    },
  });

  // ─── Retourner le résultat ───
  return {
    payment: {
      id: payment.id,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      externalRef: simulatedRef,
      paidAt: payment.paidAt,
    },
    invoice: {
      id: invoice.id,
      reference: invoice.reference,
      status: 'updated',  // Sera récupéré
    },
    receipt: {
      id: fullPayment.receipt.id,
      reference: fullPayment.receipt.reference,
      pdfUrl,
    },
    simulation: {
      mode: true,
      operator,
      phoneNumber,
      simulatedRef,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATION ADMIN
// ═══════════════════════════════════════════════════════════

async function notifyAdmins({ title, message, data }) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true },
    });

    if (admins.length === 0) {
      console.warn('[MobileMoney] Aucun admin trouvé');
      return;
    }

    // Créer les notifications in-app
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'SYSTEM',
        title,
        message,
        data,
        channel: 'IN_APP',
        status: 'PENDING',
      })),
    });

    // Émettre via Socket.IO si disponible
    try {
      const { getIO } = require('../../config/socket');
      const io = getIO();

      if (io) {
        admins.forEach((admin) => {
          io.to(`user:${admin.id}`).emit('notification:new', {
            type: 'SYSTEM',
            title,
            message,
            data,
          });
        });
        console.log(`[MobileMoney] ${admins.length} admin(s) notifié(s) via Socket.IO`);
      }
    } catch (socketErr) {
      console.warn('[MobileMoney] Socket.IO non disponible:', socketErr.message);
    }
  } catch (err) {
    console.error('[MobileMoney] Erreur notification admin:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// LECTURE — Paiements Mobile Money d'un étudiant
// ═══════════════════════════════════════════════════════════

exports.getStudentMobileMoneyPayments = async (studentId) => {
  const payments = await prisma.payment.findMany({
    where: {
      studentId,
      method: {
        in: ['MOBILE_MONEY_MVOLA', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_AIRTEL'],
      },
    },
    orderBy: { paidAt: 'desc' },
    include: {
      invoice: {
        include: { fee: { include: { feeType: true } } },
      },
      receipt: true,
    },
  });

  return {
    payments: payments.map((p) => ({
      id: p.id,
      reference: p.reference,
      amount: p.amount,
      currency: p.currency,
      method: p.method,
      status: p.status,
      externalRef: p.externalRef,
      paidAt: p.paidAt,
      metadata: p.metadata,
      invoice: p.invoice ? {
        id: p.invoice.id,
        reference: p.invoice.reference,
        feeName: p.invoice.fee?.feeType?.name,
      } : null,
      receipt: p.receipt ? {
        id: p.receipt.id,
        reference: p.receipt.reference,
        pdfUrl: p.receipt.fileUrl,
      } : null,
    })),
    total: payments.reduce((sum, p) => sum + Number(p.amount), 0),
  };
};

// ═══════════════════════════════════════════════════════════
// FACTURES IMPAYÉES D'UN ÉTUDIANT
// ═══════════════════════════════════════════════════════════

exports.getStudentUnpaidInvoices = async (studentId) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      studentId,
      status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE', 'DRAFT'] },
    },
    orderBy: { dueDate: 'asc' },
    include: {
      fee: { include: { feeType: true } },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    reference: inv.reference,
    feeName: inv.fee?.feeType?.name,
    amount: inv.amount,
    paidAmount: inv.paidAmount,
    remaining: Number(inv.amount) - Number(inv.paidAmount),
    currency: inv.currency,
    status: inv.status,
    dueDate: inv.dueDate,
    isOverdue: inv.dueDate < new Date() && inv.status !== 'PAID',
  }));
};