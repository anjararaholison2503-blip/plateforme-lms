import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, User, DollarSign, Calendar, CreditCard, Clock,
  CheckCircle2, AlertCircle, Send, Download, X, Plus, Trash2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../services/api';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  SENT: { label: 'Envoyée', color: 'blue' },
  PARTIALLY_PAID: { label: 'Partiellement payée', color: 'amber' },
  PAID: { label: 'Payée', color: 'green' },
  OVERDUE: { label: 'En retard', color: 'red' },
  CANCELLED: { label: 'Annulée', color: 'gray' },
};

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

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'CASH',
    paidAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/finance/invoices/${id}`);
      setInvoice(res.data.data);
      setPaymentForm((prev) => ({
        ...prev,
        amount: Number(res.data.data.amount) - Number(res.data.data.paidAmount),
      }));
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/finance/payments', {
        invoiceId: parseInt(id),
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        paidAt: new Date(paymentForm.paidAt).toISOString(),
        notes: paymentForm.notes || null,
      });

      setSuccess('Paiement enregistré avec succès');
      setPaymentModalOpen(false);
      await fetchInvoice();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (amount, currency = 'MGA') => {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <PageHeader title="Facture introuvable" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Cette facture n\'existe pas'} />
          <Link to="/finance/invoices" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft size={16} /> Retour
            </Button>
          </Link>
        </main>
      </>
    );
  }

  const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
  const balance = Number(invoice.amount) - Number(invoice.paidAmount);
  const isPaid = invoice.status === 'PAID';
  const isOverdue = ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) &&
    new Date(invoice.dueDate) < new Date();
  const daysOverdue = isOverdue
    ? Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <>
      <PageHeader
        title={`Facture ${invoice.reference}`}
        subtitle={`${invoice.student?.firstName} ${invoice.student?.lastName} · ${invoice.fee?.feeType?.name}`}
        badge="Détails de la facture"
        action={
          <div className="flex gap-2">
            <Link to="/finance/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
            {!isPaid && (
              <Button size="sm" onClick={() => setPaymentModalOpen(true)}>
                <Plus size={16} />
                Enregistrer paiement
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        {/* Bandeau de statut */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <FileText size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 font-mono">
                  {invoice.reference}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Émise le {formatDate(invoice.issuedAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge color={statusConf.color}>
                <span className="text-sm">{statusConf.label}</span>
              </Badge>
              {isOverdue && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                  +{daysOverdue} jour(s) de retard
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Montants */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <DollarSign size={18} />
                Montants
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Montant de la facture</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {formatMoney(invoice.amount, invoice.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">Déjà payé</span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    - {formatMoney(invoice.paidAmount, invoice.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-t-2 border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30 rounded-lg px-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Solde restant
                  </span>
                  <span className={`text-2xl font-bold ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatMoney(balance, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Détails */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Détails de la facture
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Type de frais" value={invoice.fee?.feeType?.name} />
                <InfoRow label="Année académique" value={invoice.enrollment?.academicYear || '—'} />
                <InfoRow label="Échéance" value={formatDate(invoice.dueDate)} />
                <InfoRow label="Numéro d'échéance" value={invoice.installmentNo ? `#${invoice.installmentNo}` : '—'} />
              </div>
              {invoice.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Historique des paiements */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Clock size={18} />
                Historique des paiements ({invoice.payments?.length || 0})
              </h3>
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-mono font-medium text-gray-800 dark:text-slate-200">
                            {payment.reference}
                          </p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(payment.amount, payment.currency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                          <span>{translateMethod(payment.method)}</span>
                          <span>•</span>
                          <span>{formatDate(payment.paidAt || payment.createdAt)}</span>
                          {payment.createdBy && (
                            <>
                              <span>•</span>
                              <span>par {payment.createdBy.firstName} {payment.createdBy.lastName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {payment.receipt && (
                        <button
                          className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg"
                          title={`Télécharger le reçu ${payment.receipt.reference}`}
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                  <CreditCard size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun paiement enregistré</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Étudiant */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <User size={18} />
                Étudiant
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                  {invoice.student?.firstName?.[0]}{invoice.student?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-slate-200">
                    {invoice.student?.firstName} {invoice.student?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {invoice.student?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-2">
                {!isPaid && (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Enregistrer un paiement
                    </span>
                  </button>
                )}
                {isOverdue && (
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <Send size={16} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Envoyer un rappel
                    </span>
                  </button>
                )}
                <button
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Download size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Télécharger PDF
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal paiement */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Enregistrer un paiement"
        subtitle={`Facture ${invoice.reference}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Annuler</Button>
            <Button onClick={handlePayment} loading={saving}>
              <CheckCircle2 size={16} />
              Enregistrer le paiement
            </Button>
          </>
        }
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              Solde restant à payer
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatMoney(balance, invoice.currency)}
            </p>
          </div>

          <Input
            label="Montant à payer *"
            type="number"
            min="0.01"
            max={balance}
            step="0.01"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Méthode de paiement *
            </label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              required
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Date du paiement *"
            type="datetime-local"
            value={paymentForm.paidAt}
            onChange={(e) => setPaymentForm({ ...paymentForm, paidAt: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Notes (optionnel)
            </label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mt-0.5">
        {value || '—'}
      </p>
    </div>
  );
}

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