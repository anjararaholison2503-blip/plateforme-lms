const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const prisma = require('../../config/database');

// ═══════════════════════════════════════════════════════════
// EXPORT EXCEL — IMPAYÉS
// ═══════════════════════════════════════════════════════════

exports.exportOverdueInvoicesExcel = async (filters = {}) => {
  const where = {
    status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    dueDate: { lt: new Date() },
  };

  if (filters.classId) {
    where.student = { unitId: parseInt(filters.classId) };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          unit: { select: { name: true } },
        },
      },
      fee: { include: { feeType: true } },
    },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MASTERCLASS LMS';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Impayés', {
    properties: { defaultRowHeight: 20 },
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Titre
  sheet.mergeCells('A1:H1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'LISTE DES IMPAYÉS';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 30;

  // Date d'export
  sheet.mergeCells('A2:H2');
  const dateCell = sheet.getCell('A2');
  dateCell.value = `Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
  dateCell.font = { italic: true, size: 10 };
  dateCell.alignment = { horizontal: 'right' };
  sheet.getRow(2).height = 20;

  // En-têtes
  const headers = ['Référence', 'Étudiant', 'Email', 'Téléphone', 'Classe', 'Type de frais', 'Montant', 'Échéance', 'Jours retard', 'Solde'];
  sheet.getRow(4).values = headers;
  sheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
  sheet.getRow(4).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(4).height = 25;

  // Colonnes largeur
  sheet.columns = [
    { width: 15 }, { width: 20 }, { width: 25 }, { width: 15 },
    { width: 15 }, { width: 20 }, { width: 15 }, { width: 12 },
    { width: 12 }, { width: 15 },
  ];

  // Données
  const now = new Date();
  let rowIndex = 5;
  let totalBalance = 0;

  invoices.forEach((inv) => {
    const daysOverdue = Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
    const balance = Number(inv.amount) - Number(inv.paidAmount);
    totalBalance += balance;

    const row = sheet.getRow(rowIndex);
    row.values = [
      inv.reference,
      `${inv.student.firstName} ${inv.student.lastName}`,
      inv.student.email,
      inv.student.phone || '—',
      inv.student.unit?.name || '—',
      inv.fee.feeType.name,
      Number(inv.amount),
      new Date(inv.dueDate).toLocaleDateString('fr-FR'),
      daysOverdue,
      balance,
    ];

    // Alternance de couleurs
    if (rowIndex % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
    }

    // Couleur rouge si très en retard
    if (daysOverdue > 30) {
      row.getCell(9).font = { color: { argb: 'FFDC2626' }, bold: true };
    }

    row.getCell(7).numFmt = '#,##0.00 "MGA"';
    row.getCell(10).numFmt = '#,##0.00 "MGA"';
    row.alignment = { vertical: 'middle' };

    rowIndex++;
  });

  // Total
  const totalRow = sheet.getRow(rowIndex + 1);
  totalRow.values = ['', '', '', '', '', '', '', '', 'TOTAL :', totalBalance];
  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
  totalRow.getCell(10).numFmt = '#,##0.00 "MGA"';

  return workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════
// EXPORT PDF — IMPAYÉS
// ═══════════════════════════════════════════════════════════

exports.exportOverdueInvoicesPDF = async (filters = {}) => {
  const where = {
    status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
    dueDate: { lt: new Date() },
  };

  if (filters.classId) {
    where.student = { unitId: parseInt(filters.classId) };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          unit: { select: { name: true } },
        },
      },
      fee: { include: { feeType: true } },
    },
  });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // En-tête
      doc
        .fontSize(20)
        .fillColor('#4F46E5')
        .text('MASTERCLASS LMS', { align: 'center' });

      doc
        .fontSize(14)
        .fillColor('#1F2937')
        .text('Liste des impayés', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'right' })
        .moveDown(1);

      // Statistiques
      const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paidAmount)), 0);
      doc
        .fontSize(10)
        .fillColor('#DC2626')
        .text(`${invoices.length} facture(s) impayée(s) — Total : ${new Intl.NumberFormat('fr-FR').format(totalAmount)} MGA`, { align: 'left' })
        .moveDown(0.5);

      // En-têtes du tableau
      const tableTop = doc.y;
      const columns = [
        { header: 'Référence', x: 40, width: 90 },
        { header: 'Étudiant', x: 130, width: 130 },
        { header: 'Classe', x: 260, width: 80 },
        { header: 'Type', x: 340, width: 100 },
        { header: 'Montant', x: 440, width: 80 },
        { header: 'Solde', x: 520, width: 80 },
        { header: 'Échéance', x: 600, width: 80 },
        { header: 'Retard', x: 680, width: 60 },
      ];

      doc.fontSize(9).fillColor('#FFFFFF');
      doc.rect(40, tableTop, 700, 20).fill('#6366F1');

      columns.forEach((col) => {
        doc
          .fillColor('#FFFFFF')
          .text(col.header, col.x, tableTop + 6, { width: col.width, align: 'left' });
      });

      doc.y = tableTop + 25;

      // Lignes
      const now = new Date();
      invoices.forEach((inv, index) => {
        const y = doc.y;
        const daysOverdue = Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
        const balance = Number(inv.amount) - Number(inv.paidAmount);

        if (index % 2 === 0) {
          doc.rect(40, y - 3, 700, 18).fill('#F9FAFB');
        }

        doc.fontSize(8).fillColor('#1F2937');
        doc.text(inv.reference, 40, y, { width: 90 });
        doc.text(`${inv.student.firstName} ${inv.student.lastName}`, 130, y, { width: 130 });
        doc.text(inv.student.unit?.name || '—', 260, y, { width: 80 });
        doc.text(inv.fee.feeType.name, 340, y, { width: 100 });
        doc.text(new Intl.NumberFormat('fr-FR').format(inv.amount), 440, y, { width: 80 });
        doc.fillColor('#DC2626').text(new Intl.NumberFormat('fr-FR').format(balance), 520, y, { width: 80 });
        doc.fillColor('#1F2937').text(new Date(inv.dueDate).toLocaleDateString('fr-FR'), 600, y, { width: 80 });
        doc.fillColor(daysOverdue > 30 ? '#DC2626' : '#F59E0B').text(`${daysOverdue}j`, 680, y, { width: 60 });

        doc.y = y + 15;

        // Nouvelle page si nécessaire
        if (doc.y > 550) {
          doc.addPage();
          doc.y = 40;
        }
      });

      // Pied de page
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text('MASTERCLASS LMS — Document généré automatiquement', 40, doc.page.height - 30, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ═══════════════════════════════════════════════════════════
// EXPORT EXCEL — PAIEMENTS
// ═══════════════════════════════════════════════════════════

exports.exportPaymentsExcel = async (filters = {}) => {
  const where = {};

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  if (filters.method) where.method = filters.method;
  if (filters.status) where.status = filters.status;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      invoice: { select: { reference: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Paiements');

  // Titre
  sheet.mergeCells('A1:H1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'LISTE DES PAIEMENTS';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 30;

  // En-têtes
  const headers = ['Référence', 'Facture', 'Étudiant', 'Montant', 'Méthode', 'Statut', 'Date', 'Enregistré par'];
  sheet.getRow(3).values = headers;
  sheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

  sheet.columns = [
    { width: 15 }, { width: 15 }, { width: 25 }, { width: 15 },
    { width: 18 }, { width: 12 }, { width: 18 }, { width: 20 },
  ];

  payments.forEach((p, index) => {
    const row = sheet.getRow(index + 4);
    row.values = [
      p.reference,
      p.invoice?.reference,
      `${p.student.firstName} ${p.student.lastName}`,
      Number(p.amount),
      translateMethod(p.method),
      p.status,
      new Date(p.paidAt || p.createdAt).toLocaleDateString('fr-FR'),
      p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName}` : '—',
    ];
    row.getCell(4).numFmt = '#,##0.00 "MGA"';
  });

  return workbook.xlsx.writeBuffer();
};

function translateMethod(method) {
  const map = {
    CASH: 'Espèces',
    BANK_TRANSFER: 'Virement',
    CHECK: 'Chèque',
    MOBILE_MONEY_MVOLA: 'Mvola',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_AIRTEL: 'Airtel Money',
    STRIPE_CARD: 'Carte bancaire',
    OTHER: 'Autre',
  };
  return map[method] || method;
}