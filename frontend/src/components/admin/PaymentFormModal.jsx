import { useState, useEffect } from 'react';
import { CreditCard, User, DollarSign, Calendar, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CHECK', label: 'Chèque' },
  { value: 'MOBILE_MONEY_MVOLA', label: 'Mvola' },
  { value: 'MOBILE_MONEY_ORANGE', label: 'Orange Money' },
  { value: 'MOBILE_MONEY_AIRTEL', label: 'Airtel Money' },
  { value: 'STRIPE_CARD', label: 'Carte bancaire' },
  { value: 'OTHER', label: 'Autre' },
];

export default function PaymentFormModal({ isOpen, onClose, onSuccess }) {
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: 'CASH',
    paidAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        invoiceId: '',
        amount: '',
        method: 'CASH',
        paidAt: new Date().toISOString().slice(0, 16),
        notes: '',
      });
      setError('');

      // Charger les factures non payées
      api.get('/finance/invoices?status=SENT&limit=100')
        .then((res) => {
          api.get('/finance/invoices?status=PARTIALLY_PAID&limit=100')
            .then((res2) => {
              api.get('/finance/invoices?status=OVERDUE&limit=100')
                .then((res3) => {
                  setInvoices([
                    ...(res.data.data || []),
                    ...(res2.data.data || []),
                    ...(res3.data.data || []),
                  ]);
                });
            });
        })
        .catch(() => setInvoices([]));
    }
  }, [isOpen]);

  const selectedInvoice = invoices.find((i) => i.id === parseInt(formData.invoiceId));

  useEffect(() => {
    if (selectedInvoice) {
      const balance = Number(selectedInvoice.amount) - Number(selectedInvoice.paidAmount);
      setFormData((prev) => ({ ...prev, amount: balance }));
    }
  }, [selectedInvoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/finance/payments', {
        invoiceId: parseInt(formData.invoiceId),
        amount: parseFloat(formData.amount),
        method: formData.method,
        paidAt: new Date(formData.paidAt).toISOString(),
        notes: formData.notes || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau paiement"
      subtitle="Enregistrez un paiement manuellement"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <CreditCard size={16} />
            Enregistrer le paiement
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Facture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <FileText size={14} />
            Facture *
          </label>
          <select
            value={formData.invoiceId}
            onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">— Sélectionner une facture —</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.reference} — {inv.student?.firstName} {inv.student?.lastName} — Solde: {formatMoney(Number(inv.amount) - Number(inv.paidAmount))} {inv.currency}
              </option>
            ))}
          </select>
        </div>

        {/* Info facture */}
        {selectedInvoice && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  {selectedInvoice.student?.firstName} {selectedInvoice.student?.lastName}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {selectedInvoice.student?.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs text-emerald-800 dark:text-emerald-300 mt-3">
              <div>
                <p className="opacity-70">Montant total</p>
                <p className="font-semibold">{formatMoney(selectedInvoice.amount)} {selectedInvoice.currency}</p>
              </div>
              <div>
                <p className="opacity-70">Déjà payé</p>
                <p className="font-semibold">{formatMoney(selectedInvoice.paidAmount)} {selectedInvoice.currency}</p>
              </div>
              <div>
                <p className="opacity-70">Solde restant</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-200">
                  {formatMoney(Number(selectedInvoice.amount) - Number(selectedInvoice.paidAmount))} {selectedInvoice.currency}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Montant */}
        <Input
          label="Montant à payer *"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          icon={DollarSign}
        />

        {/* Méthode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <CreditCard size={14} />
            Méthode de paiement *
          </label>
          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            required
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <Input
          label="Date du paiement *"
          type="datetime-local"
          value={formData.paidAt}
          onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
          required
          icon={Calendar}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>
      </form>
    </Modal>
  );
}