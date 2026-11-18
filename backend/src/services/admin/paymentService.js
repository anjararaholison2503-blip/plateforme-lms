const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCES
// ═══════════════════════════════════════════════════════════

const generatePaymentReference = async (tx = null) => {
  const client = tx || prisma;
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}-`;

  const last = await prisma.payment.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let nextNumber = 1;
  if (last) {
    nextNumber = parseInt(last.reference.replace(prefix, ''), 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

const generateReceiptReference = async (tx = null) => {
  const client = tx || prisma;
  const year = new Date().getFullYear();
  const prefix = `REC-${year}-`;

  const last = await client.receipt.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select: { reference: true },
  });

  let nextNumber = 1;
  if (last) {
    nextNumber = parseInt(last.reference.replace(prefix, ''), 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// ═══════════════════════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════════════════════

exports.getAllPayments = async (filters = {}) => {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.method) where.method = filters.method;
  if (filters.studentId) where.studentId = parseInt(filters.studentId);
  if (filters.invoiceId) where.invoiceId = parseInt(filters.invoiceId);

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search } },
      { externalRef: { contains: filters.search } },
      { student: { firstName: { contains: filters.search } } },
      { student: { lastName: { contains: filters.search } } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        invoice: { select: { id: true, reference: true, amount: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        receipt: true,
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      invoice: {
        include: {
          fee: { include: { feeType: true } },
        },
      },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      receipt: true,
    },
  });

  if (!payment) {
    throw new AppError('Paiement introuvable', 404, 'PAYMENT_NOT_FOUND');
  }

  return payment;
};

// ═══════════════════════════════════════════════════════════
// CRÉATION
// ═══════════════════════════════════════════════════════════

exports.createPayment = async (data, userId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { student: true },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    throw new AppError(
      `Impossible de payer une facture au statut "${invoice.status}"`,
      400,
      'INVALID_INVOICE_STATUS'
    );
  }

  // Vérifier le montant
  const remainingAmount = Number(invoice.amount) - Number(invoice.paidAmount);
  if (data.amount > remainingAmount) {
    throw new AppError(
      `Le montant dépasse le solde restant (${remainingAmount} ${invoice.currency})`,
      400,
      'AMOUNT_EXCEEDS_BALANCE'
    );
  }

  const reference = await generatePaymentReference();

  // Créer le paiement
  const payment = await prisma.payment.create({
    data: {
      reference,
      invoiceId: data.invoiceId,
      studentId: invoice.studentId,
      amount: data.amount,
      currency: data.currency || invoice.currency,
      method: data.method,
      status: data.status || 'COMPLETED',
      externalRef: data.externalRef || null,
      transactionId: data.transactionId || null,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      notes: data.notes || null,
      createdById: userId,
    },
  });

  // Mettre à jour la facture
  await exports.updateInvoiceAfterPayment(invoice.id);

  // Générer le reçu si le paiement est complété
  if (payment.status === 'COMPLETED') {
    await exports.generateReceipt(payment.id);
  }

  return exports.getPaymentById(payment.id);
};

// ═══════════════════════════════════════════════════════════
// MISE À JOUR FACTURE APRÈS PAIEMENT
// ═══════════════════════════════════════════════════════════

exports.updateInvoiceAfterPayment = async (invoiceId) => {
  const payments = await prisma.payment.findMany({
    where: {
      invoiceId,
      status: 'COMPLETED',
    },
  });

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  const invoiceAmount = Number(invoice.amount);
  let newStatus = invoice.status;

  if (totalPaid >= invoiceAmount) {
    newStatus = 'PAID';
  } else if (totalPaid > 0) {
    newStatus = 'PARTIALLY_PAID';
  }

  // Vérifier si en retard
  if (newStatus !== 'PAID' && invoice.dueDate < new Date()) {
    newStatus = 'OVERDUE';
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: totalPaid,
      status: newStatus,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// REÇUS
// ═══════════════════════════════════════════════════════════

exports.generateReceipt = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { receipt: true },
  });

  if (!payment) {
    throw new AppError('Paiement introuvable', 404, 'PAYMENT_NOT_FOUND');
  }

  if (payment.receipt) {
    return payment.receipt; // Déjà généré
  }

  const reference = await generateReceiptReference();

  return prisma.receipt.create({
    data: {
      reference,
      paymentId,
      // fileUrl sera généré plus tard (PDF)
      fileUrl: null,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// ANNULATION
// ═══════════════════════════════════════════════════════════

exports.cancelPayment = async (id, userId) => {
  const payment = await prisma.payment.findUnique({ where: { id } });

  if (!payment) {
    throw new AppError('Paiement introuvable', 404, 'PAYMENT_NOT_FOUND');
  }

  if (payment.status === 'CANCELLED') {
    throw new AppError('Paiement déjà annulé', 400, 'ALREADY_CANCELLED');
  }

  // Mettre à jour le paiement
  const updated = await prisma.payment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // Mettre à jour la facture
  await exports.updateInvoiceAfterPayment(payment.invoiceId);

  return updated;
};

// ═══════════════════════════════════════════════════════════
// PAIEMENTS D'UN ÉTUDIANT
// ═══════════════════════════════════════════════════════════

exports.getStudentPayments = async (studentId) => {
  const payments = await prisma.payment.findMany({
    where: { studentId, status: 'COMPLETED' },
    orderBy: { paidAt: 'desc' },
    include: {
      invoice: {
        include: {
          fee: { include: { feeType: true } },
        },
      },
      receipt: true,
    },
  });

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    payments,
    summary: {
      count: payments.length,
      totalPaid,
    },
  };
};

// ═══════════════════════════════════════════════════════════
// STATISTIQUES
// ═══════════════════════════════════════════════════════════

exports.getPaymentStats = async (filters = {}) => {
  const where = { status: 'COMPLETED' };

  if (filters.dateFrom || filters.dateTo) {
    where.paidAt = {};
    if (filters.dateFrom) where.paidAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.paidAt.lte = new Date(filters.dateTo);
  }

  // Mois en cours
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

 const allPayments = await prisma.payment.findMany({
    where: { ...where, status: 'COMPLETED' },
    select: { paidAt: true, amount: true },
    orderBy: { paidAt: 'asc' },
  });

  const monthlyMap = {};
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

  allPayments.forEach(p => {
    if (!p.paidAt) return;
    const date = new Date(p.paidAt);
    const key = `${monthNames[date.getMonth()]}`; // ex: "Jan"
    if (!monthlyMap[key]) monthlyMap[key] = 0;
    monthlyMap[key] += Number(p.amount);
  });

  const byMonth = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));


  const [total, totalAmount, thisMonth, byMethod, byStatus] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['method'],
      where,
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  return {
    total,
    totalAmount: Number(totalAmount._sum.amount) || 0,
    thisMonth: Number(thisMonth._sum.amount) || 0,
    byMethod: byMethod.map((m) => ({
      method: m.method,
      count: m._count._all,
      amount: Number(m._sum.amount) || 0,
    })),
    byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
  };
};
// ═══════════════════════════════════════════════════════════
// PAIEMENT MULTIPLE (plusieurs paiements en 1 fois)
// ═══════════════════════════════════════════════════════════

/**
 * Créer plusieurs paiements en une seule transaction
 * @param {Array} paymentsData - Liste des paiements
 * @param {number} userId - ID de l'utilisateur qui enregistre
 * @returns {Object} Résumé avec les paiements créés + le reçu
 */
exports.createBulkPayments = async (paymentsData, userId) => {
  if (!paymentsData || paymentsData.length === 0) {
    throw new AppError('Aucun paiement fourni', 400, 'NO_PAYMENTS');
  }

  // Vérifier que tous les paiements ont un invoiceId valide
  const invoiceIds = paymentsData.map((p) => parseInt(p.invoiceId));
  const invoices = await prisma.invoice.findMany({
    where: { id: { in: invoiceIds } },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true, matricule: true } },
      fee: { include: { feeType: true } },
    },
  });

  if (invoices.length !== invoiceIds.length) {
    throw new AppError('Une ou plusieurs factures sont introuvables', 404, 'INVOICE_NOT_FOUND');
  }

  // Créer tous les paiements en une transaction
  const payments = [];
  const receiptReference = await generateReceiptReference();

  await prisma.$transaction(async (tx) => {
    for (const paymentData of paymentsData) {
      const invoice = invoices.find((i) => i.id === parseInt(paymentData.invoiceId));

      // Vérifier le solde
      const balance = Number(invoice.amount) - Number(invoice.paidAmount);
      if (paymentData.amount > balance) {
        throw new AppError(
          `Le montant dépasse le solde restant pour la facture ${invoice.reference}`,
          400,
          'AMOUNT_EXCEEDS_BALANCE'
        );
      }

      const reference = await generatePaymentReference(tx);

      const payment = await tx.payment.create({
        data: {
          reference,
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          amount: paymentData.amount,
          currency: paymentData.currency || invoice.currency,
          method: paymentData.method,
          status: 'COMPLETED',
          paidAt: new Date(),
          notes: paymentData.notes || null,
          createdById: userId,
          metadata: {
            receiptReference,
            installmentNo: invoice.installmentNo,
            feeTypeName: invoice.fee.feeType.name,
          },
        },
      });

      // Mettre à jour la facture
      const totalPaid = Number(invoice.paidAmount) + Number(paymentData.amount);
      const invoiceAmount = Number(invoice.amount);

      let newStatus = invoice.status;
      if (totalPaid >= invoiceAmount) newStatus = 'PAID';
      else if (totalPaid > 0) newStatus = 'PARTIALLY_PAID';
      if (newStatus !== 'PAID' && invoice.dueDate < new Date()) newStatus = 'OVERDUE';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: totalPaid,
          status: newStatus,
        },
      });

      payments.push(payment);
    }

    // Créer 1 seul reçu pour tous les paiements
    await tx.receipt.create({
      data: {
        reference: receiptReference,
        paymentId: payments[0].id, // Le premier paiement
        fileUrl: null,
      },
    });
  });

  // Retourner les paiements créés + le reçu
  const result = await prisma.payment.findMany({
    where: { id: { in: payments.map((p) => p.id) } },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, email: true, matricule: true } },
      invoice: { include: { fee: { include: { feeType: true } } } },
    },
  });

  return {
    payments: result,
    receiptReference,
    totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
  };
};

// ═══════════════════════════════════════════════════════════
// GÉNÉRATION DE RÉFÉRENCE REÇU
// ═══════════════════════════════════════════════════════════

// async function generateReceiptReference(tx = null) {
//   const client = tx || prisma;
//   const year = new Date().getFullYear();
//   const prefix = `REC-${year}-`;

//   const last = await client.receipt.findFirst({
//     where: { reference: { startsWith: prefix } },
//     orderBy: { reference: 'desc' },
//     select: { reference: true },
//   });

//   let nextNumber = 1;
//   if (last) {
//     nextNumber = parseInt(last.reference.replace(prefix, ''), 10) + 1;
//   }

//   return `${prefix}${String(nextNumber).padStart(4, '0')}`;
// }