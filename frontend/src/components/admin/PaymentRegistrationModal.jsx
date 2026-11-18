import { useState, useEffect } from 'react';
import {
  Search, User, Plus, Trash2, CheckCircle2, DollarSign, Receipt,
  FileText,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import ReceiptModal from './ReceiptModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

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

export default function PaymentRegistrationModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('search'); // 'search' | 'form'
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFinancial, setStudentFinancial] = useState(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const [payments, setPayments] = useState([
    { invoiceId: '', amount: '', method: 'CASH', notes: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);

  // Reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setSearch('');
      setStudents([]);
      setSelectedStudent(null);
      setStudentFinancial(null);
      setPayments([{ invoiceId: '', amount: '', method: 'CASH', notes: '' }]);
      setError('');
      setReceiptData(null);
    }
  }, [isOpen]);

  // Recherche étudiants
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setStudents([]);
      return;
    }

    setSearching(true);
    api.get('/users', {
      params: { role: 'STUDENT', search: debouncedSearch, limit: 10 },
    })
      .then((res) => setStudents(res.data.data || []))
      .catch(() => setStudents([]))
      .finally(() => setSearching(false));
  }, [debouncedSearch]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setStep('form');
    setLoadingFinancial(true);

    try {
      const res = await api.get(`/finance/invoices/student/${student.id}`);
      setStudentFinancial(res.data.data);
    } catch (err) {
      setError('Erreur de chargement des factures');
    } finally {
      setLoadingFinancial(false);
    }
  };

  const addPayment = () => {
    setPayments([...payments, { invoiceId: '', amount: '', method: 'CASH', notes: '' }]);
  };

  const removePayment = (index) => {
    if (payments.length === 1) return;
    setPayments(payments.filter((_, i) => i !== index));
  };

  const updatePayment = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;

    if (field === 'invoiceId' && value) {
      const invoice = studentFinancial?.invoices?.find((i) => i.id === parseInt(value));
      if (invoice) {
        const balance = Number(invoice.amount) - Number(invoice.paidAmount);
        updated[index].amount = balance;
      }
    }

    setPayments(updated);
  };

  const handleSubmit = async () => {
    const invalid = payments.find((p) => !p.invoiceId || !p.amount);
    if (invalid) {
      setError('Tous les paiements doivent avoir une facture et un montant');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await api.post('/finance/payments/bulk', {
        payments: payments.map((p) => ({
          invoiceId: parseInt(p.invoiceId),
          amount: parseFloat(p.amount),
          method: p.method,
          notes: p.notes || null,
        })),
      });

      setReceiptData({
        receiptReference: res.data.data.receiptReference,
        payments: res.data.data.payments,
        totalAmount: res.data.data.totalAmount,
        student: selectedStudent,
      });
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const formatMoney = (amount, currency = 'MGA') => {
    return `${new Intl.NumberFormat('fr-FR').format(amount || 0)} ${currency}`;
  };

  // Si le reçu est généré, afficher le ReceiptModal
  if (receiptData) {
    return (
      <ReceiptModal
        isOpen={true}
        onClose={() => {
          setReceiptData(null);
          onClose();
          if (onSuccess) onSuccess();
        }}
        receiptData={receiptData}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'search' ? 'Nouveau paiement' : `Paiement pour ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
      subtitle={step === 'search' ? 'Recherchez un étudiant par nom ou matricule' : 'Enregistrez un ou plusieurs paiements'}
      size="lg"
      footer={
        step === 'form' ? (
          <>
            <Button variant="outline" onClick={() => setStep('search')}>
              Retour
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              <Receipt size={16} />
              Valider et générer le reçu
            </Button>
          </>
        ) : null
      }
    >
      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

      {/* ═══════════════ ÉTAPE 1 : RECHERCHE ═══════════════ */}
      {step === 'search' && (
        <div className="space-y-4">
          <Input
            placeholder="Nom, prénom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            autoFocus
          />

          {searching ? (
            <Spinner className="py-8" />
          ) : students.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                      {student.matricule || 'Pas de matricule'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : debouncedSearch.length >= 2 ? (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500">
              <User size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun étudiant trouvé</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">Tapez au moins 2 caractères pour rechercher</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ÉTAPE 2 : FORMULAIRE ═══════════════ */}
      {step === 'form' && (
        <div className="space-y-5">
          {/* Situation financière */}
          {loadingFinancial ? (
            <Spinner className="py-4" />
          ) : studentFinancial ? (
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-2">Situation financière</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Total dû</p>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    {formatMoney(studentFinancial.summary.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Déjà payé</p>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {formatMoney(studentFinancial.summary.totalPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Solde</p>
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                    {formatMoney(studentFinancial.summary.balance)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Liste des paiements */}
          {payments.map((payment, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign size={14} />
                  Paiement #{index + 1}
                </h4>
                {payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Facture *
                  </label>
                  <select
                    value={payment.invoiceId}
                    onChange={(e) => updatePayment(index, 'invoiceId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">— Sélectionner une facture —</option>
                    {studentFinancial?.invoices
                      ?.filter((i) => i.status !== 'PAID')
                      .map((inv) => {
                        const balance = Number(inv.amount) - Number(inv.paidAmount);
                        return (
                          <option key={inv.id} value={inv.id}>
                            {inv.fee?.feeType?.name}
                            {inv.installmentNo ? ` · Mois ${inv.installmentNo}` : ''}
                            {' — '}
                            {formatMoney(balance, inv.currency)}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Montant *"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    icon={DollarSign}
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                      Méthode *
                    </label>
                    <select
                      value={payment.method}
                      onChange={(e) => updatePayment(index, 'method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Notes (optionnel)"
                  value={payment.notes}
                  onChange={(e) => updatePayment(index, 'notes', e.target.value)}
                  placeholder="Remarque..."
                />
              </div>
            </div>
          ))}

          {/* Bouton ajouter */}
          <button
            type="button"
            onClick={addPayment}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Ajouter un autre paiement
          </button>

          {/* Total */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">TOTAL À PAYER</span>
              <span className="text-2xl font-bold">{formatMoney(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}