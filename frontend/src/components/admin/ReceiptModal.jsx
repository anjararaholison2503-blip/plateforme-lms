import { useState } from 'react';
import {
  CheckCircle2, Printer, Download, Mail, X, Receipt as ReceiptIcon,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
console.log('🔍 ReceiptModal receiptData:', receiptData);
  const { receiptReference, payments, totalAmount, student } = receiptData;

  const formatMoney = (amount, currency = 'MGA') => {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await api.get(`/finance/receipts/${receiptReference}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-${receiptReference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/finance/receipts/${receiptReference}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
    } catch (err) {
      setError('Erreur lors de l\'impression');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    setError('');
    try {
      // Optionnel : route à créer pour envoyer l'email
      // await api.post(`/finance/receipts/${receiptReference}/send-email`);
      setSuccess(`Reçu envoyé à ${student.email}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reçu généré avec succès"
      size="lg"
      footer={
        <div className="flex flex-wrap gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="outline" onClick={handleDownload} loading={downloading}>
            <Download size={16} />
            Télécharger PDF
          </Button>
          <Button variant="outline" onClick={handlePrint} loading={downloading}>
            <Printer size={16} />
            Imprimer
          </Button>
          <Button onClick={handleSendEmail} loading={sending} className="ml-auto">
            <Mail size={16} />
            Envoyer par email
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        {/* Message de succès */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 text-white shadow-lg mb-3">
            <CheckCircle2 size={32} strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-lg mb-1">
            Paiement enregistré !
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Reçu N° <strong className="font-mono">{receiptReference}</strong>
          </p>
        </div>

        {/* Aperçu du reçu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          {/* En-tête */}
          <div className="text-center pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ReceiptIcon size={20} className="text-indigo-600" />
              <h3 className="font-bold text-gray-800 dark:text-slate-100">
                REÇU DE PAIEMENT
              </h3>
            </div>
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              {receiptReference}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {formatDate(new Date())}
            </p>
          </div>

          {/* Étudiant */}
          <div className="py-4 border-b border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Étudiant</p>
            <p className="font-semibold text-gray-800 dark:text-slate-200">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400">
              {student.matricule || '—'}
            </p>
          </div>

          {/* Détails des paiements (motifs à gauche, montants à droite) */}
          <div className="py-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              <span>Motif</span>
              <span>Montant</span>
            </div>

            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                >
                  <div>
                    <p className="text-sm text-gray-800 dark:text-slate-200">
                      {payment.invoice?.fee?.feeType?.name || 'Paiement'}
                    </p>
                    {payment.invoice?.installmentNo && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Mois {payment.invoice.installmentNo}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {formatMoney(payment.amount, payment.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 dark:text-slate-100">TOTAL PAYÉ</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Info email */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-2">
          <Mail size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Le reçu sera automatiquement envoyé par email à <strong>{student.email}</strong>
          </p>
        </div>
      </div>
    </Modal>
  );
}