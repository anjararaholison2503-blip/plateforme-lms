import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Phone, CheckCircle2, AlertCircle, Download,
  Wallet, Receipt, Clock, ArrowRight, Smartphone,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

const OPERATORS = [
  { value: 'MVOLA', label: 'MVola (Telma)', color: '#00A651', prefix: '034 / 038' },
  { value: 'ORANGE', label: 'Orange Money', color: '#FF7900', prefix: '032 / 037' },
  { value: 'AIRTEL', label: 'Airtel Money', color: '#ED1C24', prefix: '033' },
];

export default function MobileMoneyPayment() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    operator: 'MVOLA',
    phoneNumber: '',
    amount: '',
  });

  const [paymentResult, setPaymentResult] = useState(null);

  // ═══ CHARGEMENT ═══
  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get('/mobile-money/my-unpaid-invoices'),
        api.get('/mobile-money/my-payments'),
      ]);
      setInvoices(invRes.data.data.invoices || []);
      setPayments(payRes.data.data.payments || []);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ═══ SÉLECTIONNER UNE FACTURE ═══
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setForm({
      ...form,
      amount: invoice.remaining.toString(),
    });
    setError('');
    setSuccess('');
  };

  // ═══ SOUMISSION ═══
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setError('Veuillez sélectionner une facture');
      return;
    }

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Montant invalide');
      return;
    }

    if (amount > selectedInvoice.remaining) {
      setError(`Le montant dépasse le solde (${selectedInvoice.remaining} ${selectedInvoice.currency})`);
      return;
    }

    if (!form.phoneNumber) {
      setError('Numéro de téléphone requis');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/mobile-money/pay', {
        invoiceId: selectedInvoice.id,
        amount,
        operator: form.operator,
        phoneNumber: form.phoneNumber,
      });

      setPaymentResult(res.data.data);
      setSuccess('✅ Paiement effectué avec succès !');
      setSelectedInvoice(null);
      setForm({ operator: 'MVOLA', phoneNumber: '', amount: '' });
      fetchData();
    } catch (err) {
      setError(err.userMessage || err.message || 'Erreur de paiement');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══ FORMATAGE ═══
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ═══ CHARGEMENT ═══
  if (loading) {
    return (
      <>
        <PageHeader title="Paiement Mobile Money" />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Paiement Mobile Money"
        subtitle="Payez vos frais de scolarité en ligne"
        badge="Étudiant"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {/* ═══ RÉSULTAT DU PAIEMENT ═══ */}
        {paymentResult && (
          <div className="mb-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-4">
              <CheckCircle2 size={32} className="text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  🎉 Paiement réussi !
                </h3>
                <div className="space-y-1 text-sm text-emerald-700 dark:text-emerald-400 mb-4">
                  <p>
                    <strong>Référence :</strong>{' '}
                    <span className="font-mono">{paymentResult.payment.reference}</span>
                  </p>
                  <p>
                    <strong>Montant :</strong>{' '}
                    {formatAmount(paymentResult.payment.amount)} {paymentResult.payment.currency}
                  </p>
                  <p>
                    <strong>Opérateur :</strong>{' '}
                    {OPERATORS.find((o) => o.value === paymentResult.simulation.operator)?.label}
                  </p>
                  <p>
                    <strong>N° transaction :</strong>{' '}
                    <span className="font-mono text-xs">{paymentResult.simulation.simulatedRef}</span>
                  </p>
                </div>
                {paymentResult.receipt?.pdfUrl && (
                  <a
                    href={`http://localhost:5000${paymentResult.receipt.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                  >
                    <Download size={16} />
                    Télécharger le reçu PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ COLONNE PRINCIPALE : FORMULAIRE ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Factures impayées */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Wallet size={18} />
                Factures à payer ({invoices.length})
              </h3>

              {invoices.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Aucune facture à payer"
                  description="Toutes vos factures sont réglées"
                />
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                        selectedInvoice?.id === inv.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-800 dark:text-slate-200">
                              {inv.feeName || 'Frais'}
                            </p>
                            {inv.isOverdue && <Badge color="rose">En retard</Badge>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mb-1">
                            {inv.reference}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            Échéance : {formatDate(inv.dueDate)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {formatAmount(inv.remaining)} {inv.currency}
                          </p>
                          {inv.paidAmount > 0 && (
                            <p className="text-xs text-gray-500">
                              Déjà payé : {formatAmount(inv.paidAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire de paiement */}
            {selectedInvoice && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Smartphone size={18} />
                  Payer par Mobile Money
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Opérateur */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Opérateur
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {OPERATORS.map((op) => (
                        <button
                          key={op.value}
                          type="button"
                          onClick={() => setForm({ ...form, operator: op.value })}
                          className={`p-3 rounded-xl border-2 text-center transition-colors ${
                            form.operator === op.value
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: op.color }}
                          >
                            {op.value[0]}
                          </div>
                          <p className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            {op.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Numéro de téléphone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder={`Ex : ${OPERATORS.find((o) => o.value === form.operator)?.prefix}XXXXXXX`}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Format accepté : 034xxxxxxx, +261xxxxxxxxx
                    </p>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Montant à payer
                    </label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        max={selectedInvoice.remaining}
                        min="1"
                        step="1"
                        className="w-full pl-10 pr-20 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {selectedInvoice.currency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Solde restant : {formatAmount(selectedInvoice.remaining)} {selectedInvoice.currency}
                    </p>
                  </div>

                  {/* Info simulation */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                    ⚠️ <strong>Mode simulation :</strong> aucun prélèvement réel n'est effectué.
                    Un reçu PDF sera généré automatiquement.
                  </div>

                  {/* Bouton */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>⏳ Traitement en cours...</>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Payer {formatAmount(form.amount)} {selectedInvoice.currency}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* ═══ COLONNE LATÉRALE : HISTORIQUE ═══ */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Receipt size={18} />
                Historique ({payments.length})
              </h3>

              {payments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                  Aucun paiement effectué
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-gray-100 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-mono text-gray-500 dark:text-slate-400">
                          {p.reference}
                        </p>
                        <Badge color={p.status === 'COMPLETED' ? 'emerald' : 'gray'}>
                          {p.status === 'COMPLETED' ? 'Payé' : p.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                        {formatAmount(p.amount)} {p.currency}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {p.method === 'MOBILE_MONEY_MVOLA' && 'MVola'}
                        {p.method === 'MOBILE_MONEY_ORANGE' && 'Orange Money'}
                        {p.method === 'MOBILE_MONEY_AIRTEL' && 'Airtel Money'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        {formatDate(p.paidAt)}
                      </p>
                      {p.receipt?.pdfUrl && (
                        <a
                          href={`http://localhost:5000${p.receipt.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Download size={12} />
                          Télécharger le reçu
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}