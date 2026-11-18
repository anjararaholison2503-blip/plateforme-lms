const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// ═══════════════════════════════════════════════════════════
// STRIPE (Carte bancaire)
// ═══════════════════════════════════════════════════════════

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe configuré');
  } catch (err) {
    console.warn('⚠️  Stripe non configuré:', err.message);
  }
} else {
  console.log('📱 Stripe : désactivé (STRIPE_SECRET_KEY manquant)');
}

/**
 * Créer une session de paiement Stripe pour une facture
 */
exports.createStripeCheckout = async (invoiceId, userId) => {
  if (!stripe) {
    throw new AppError(
      'Stripe n\'est pas configuré. Contactez l\'administrateur.',
      503,
      'STRIPE_NOT_CONFIGURED'
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: { select: { id: true, email: true, firstName: true, lastName: true } },
      fee: { include: { feeType: true } },
    },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  if (invoice.studentId !== userId) {
    throw new AppError('Accès refusé', 403, 'FORBIDDEN');
  }

  if (invoice.status === 'PAID') {
    throw new AppError('Cette facture est déjà payée', 400, 'ALREADY_PAID');
  }

  const balance = Number(invoice.amount) - Number(invoice.paidAmount);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: invoice.currency.toLowerCase() === 'mga' ? 'mga' : invoice.currency.toLowerCase(),
          product_data: {
            name: `${invoice.fee.feeType.name} - ${invoice.reference}`,
            description: `Facture ${invoice.reference}`,
          },
          unit_amount: Math.round(balance * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/finance/invoices/${invoiceId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/finance/invoices/${invoiceId}?payment=cancelled`,
    customer_email: invoice.student.email,
    metadata: {
      invoiceId: invoice.id.toString(),
      studentId: invoice.studentId.toString(),
      userId: userId.toString(),
    },
  });

  // Créer un paiement en attente
  const reference = await generatePaymentReference();
  await prisma.payment.create({
    data: {
      reference,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: balance,
      currency: invoice.currency,
      method: 'STRIPE_CARD',
      status: 'PENDING',
      externalRef: session.id,
      transactionId: session.payment_intent?.toString() || session.id,
      metadata: { sessionId: session.id, checkoutUrl: session.url },
      createdById: userId,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
};

/**
 * Confirmer un paiement Stripe (webhook)
 */
exports.confirmStripePayment = async (sessionId, paymentIntentId) => {
  const payment = await prisma.payment.findFirst({
    where: { externalRef: sessionId },
  });

  if (!payment) {
    throw new AppError('Paiement introuvable', 404, 'PAYMENT_NOT_FOUND');
  }

  // Mettre à jour le paiement
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
      transactionId: paymentIntentId,
    },
  });

  // Mettre à jour la facture
  const invoiceService = require('./invoiceService');
  await invoiceService.updateInvoiceAfterPayment(payment.invoiceId);

  return payment;
};

// ═══════════════════════════════════════════════════════════
// MOBILE MONEY (Mvola, Orange, Airtel)
// ═══════════════════════════════════════════════════════════

/**
 * Initier un paiement Mobile Money
 * (Simulation pour l'instant — à connecter aux vraies API)
 */
exports.initiateMobileMoneyPayment = async (invoiceId, userId, method, phone) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      student: { select: { id: true, email: true } },
      fee: { include: { feeType: true } },
    },
  });

  if (!invoice) {
    throw new AppError('Facture introuvable', 404, 'INVOICE_NOT_FOUND');
  }

  if (invoice.studentId !== userId) {
    throw new AppError('Accès refusé', 403, 'FORBIDDEN');
  }

  if (invoice.status === 'PAID') {
    throw new AppError('Cette facture est déjà payée', 400, 'ALREADY_PAID');
  }

  if (!phone) {
    throw new AppError('Numéro de téléphone requis', 400, 'PHONE_REQUIRED');
  }

  const balance = Number(invoice.amount) - Number(invoice.paidAmount);

  // Valider la méthode
  const validMethods = ['MOBILE_MONEY_MVOLA', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_AIRTEL'];
  if (!validMethods.includes(method)) {
    throw new AppError('Méthode de paiement invalide', 400, 'INVALID_METHOD');
  }

  // Créer un paiement en attente
  const reference = await generatePaymentReference();
  const payment = await prisma.payment.create({
    data: {
      reference,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: balance,
      currency: invoice.currency,
      method,
      status: 'PENDING',
      externalRef: `MM-${Date.now()}`,
      notes: `Paiement Mobile Money via ${phone}`,
      metadata: {
        phone,
        provider: method,
        simulated: true,
      },
      createdById: userId,
    },
  });

  // ═══════════════════════════════════════════════════════════
  // TODO : Intégrer les vraies API Mobile Money
  // ═══════════════════════════════════════════════════════════
  // Pour MVola : https://www.mvola.mg/api
  // Pour Orange Money : https://developer.orange.com
  // Pour Airtel Money : https://www.airtel.mg
  //
  // Simulation : On retourne un message indiquant qu'il faut confirmer
  // ═══════════════════════════════════════════════════════════

  return {
    paymentId: payment.id,
    reference: payment.reference,
    amount: balance,
    currency: invoice.currency,
    method,
    phone,
    status: 'PENDING',
    message: `Un message de confirmation a été envoyé au ${phone}. Veuillez confirmer le paiement.`,
    simulated: true,
  };
};

/**
 * Confirmer un paiement Mobile Money (après validation de l'opérateur)
 */
exports.confirmMobileMoneyPayment = async (paymentId, transactionId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError('Paiement introuvable', 404, 'PAYMENT_NOT_FOUND');
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
      transactionId: transactionId || `MM-CONF-${Date.now()}`,
    },
  });

  const invoiceService = require('./invoiceService');
  await invoiceService.updateInvoiceAfterPayment(payment.invoiceId);

  return payment;
};

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

async function generatePaymentReference() {
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
}