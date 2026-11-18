const PDFDocument = require('pdfkit');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

exports.generateReceiptPDF = async (receiptReference) => {
  const receipt = await prisma.receipt.findUnique({
    where: { reference: receiptReference },
    include: {
      payment: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              matricule: true,
              unit: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!receipt) {
    throw new AppError('Reçu introuvable', 404, 'RECEIPT_NOT_FOUND');
  }

  // Récupérer TOUS les paiements de ce reçu
  const payments = await prisma.payment.findMany({
    where: {
      metadata: {
        path: '$.receiptReference',
        equals: receiptReference,
      },
    },
    include: {
      invoice: { include: { fee: { include: { feeType: true } } } },
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          matricule: true,
          unit: { select: { name: true } },
        },
      },
    },
  });

  // Si aucun trouvé, utiliser le paiement du receipt
  const allPayments = payments.length > 0 ? payments : [receipt.payment];
  const student = allPayments[0].student;

  const settings = await prisma.platformSettings.findFirst();
  const platformName = settings?.platformName || 'MASTERCLASS LMS';

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A5', margin: 25 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ═══════════════ EN-TÊTE ═══════════════
      doc
        .fillColor('#4F46E5')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(platformName, { align: 'center' });

      doc
        .fillColor('#6B7280')
        .fontSize(7)
        .font('Helvetica')
        .text(settings?.address || 'Antananarivo, Madagascar', { align: 'center' });

      doc.moveDown(0.5);

      // Ligne
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(25, doc.y)
        .lineTo(doc.page.width - 25, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // ═══════════════ TITRE ═══════════════
      doc
        .fillColor('#1F2937')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('REÇU DE PAIEMENT', { align: 'center' });

      doc
        .fillColor('#4F46E5')
        .fontSize(9)
        .text(receiptReference, { align: 'center' });

      doc.moveDown(0.5);

      // ═══════════════ INFOS ÉTUDIANT ═══════════════
      doc
        .fillColor('#1F2937')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Étudiant : ', { continued: true })
        .font('Helvetica')
        .text(`${student.firstName} ${student.lastName}`);

      doc
        .font('Helvetica-Bold')
        .text('Matricule : ', { continued: true })
        .font('Helvetica')
        .text(student.matricule || '—');

      doc
        .font('Helvetica-Bold')
        .text('Classe : ', { continued: true })
        .font('Helvetica')
        .text(student.unit?.name || '—');

      doc.moveDown(0.5);

      // Ligne
      doc
        .strokeColor('#E5E7EB')
        .moveTo(25, doc.y)
        .lineTo(doc.page.width - 25, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // ═══════════════ TABLEAU (MOTIFS À GAUCHE, MONTANTS À DROITE) ═══════════════
      const leftX = 30;
      const rightX = doc.page.width - 130;

      doc
        .fillColor('#374151')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('MOTIF', leftX)
        .text('MONTANT', rightX, doc.y - 10, { width: 100, align: 'right' });

      doc.moveDown(0.5);

      let total = 0;

      allPayments.forEach((payment, index) => {
        const y = doc.y;

        const feeName = payment.invoice?.fee?.feeType?.name || 'Paiement';
        const installment = payment.invoice?.installmentNo
          ? ` (Mois ${payment.invoice.installmentNo})`
          : '';
        const motif = `${feeName}${installment}`;

        doc
          .fillColor('#1F2937')
          .fontSize(8)
          .font('Helvetica')
          .text(motif, leftX, y, { width: 200 })
          .text(
            `${new Intl.NumberFormat('fr-FR').format(payment.amount)} ${payment.currency}`,
            rightX,
            y,
            { width: 100, align: 'right' }
          );

        total += Number(payment.amount);
        doc.y = y + 14;
      });

      doc.moveDown(0.3);

      // Ligne
      doc
        .strokeColor('#E5E7EB')
        .moveTo(25, doc.y)
        .lineTo(doc.page.width - 25, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // ═══════════════ TOTAL ═══════════════
      doc
        .fillColor('#10B981')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL PAYÉ', leftX, doc.y)
        .text(
          `${new Intl.NumberFormat('fr-FR').format(total)} MGA`,
          rightX,
          doc.y - 12,
          { width: 100, align: 'right' }
        );

      doc.moveDown(1);

      // ═══════════════ PIED DE PAGE ═══════════════
      doc
        .fillColor('#9CA3AF')
        .fontSize(6)
        .font('Helvetica')
        .text(
          'Document généré automatiquement · Merci de conserver ce reçu',
          25,
          doc.page.height - 30,
          { align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};