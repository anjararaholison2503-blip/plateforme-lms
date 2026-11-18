import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, DollarSign, AlertCircle, CheckCircle2, Clock,
  CreditCard, TrendingUp, Download, Smartphone,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  SENT: { label: 'À payer', color: 'blue' },
  PARTIALLY_PAID: { label: 'Partiel', color: 'amber' },
  PAID: { label: 'Payée', color: 'emerald' },
  OVERDUE: { label: 'En retard', color: 'rose' },
  CANCELLED: { label: 'Annulée', color: 'gray' },
};

export default function MyInvoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api.get(`/finance/invoices/student/${user.id}`)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const formatMoney = (amount, currency = 'MGA') => {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Mes factures" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  const invoices = data?.invoices || [];
  const summary = data?.summary || {};

  return (
    <>
      <PageHeader
        title="Mes factures"
        subtitle="Consultez et payez vos factures"
        badge="Espace étudiant"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        {/* Bandeau financier */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <DollarSign size={16} />
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Ma situation financière
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Total à payer</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                {formatMoney(summary.totalAmount || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Déjà payé</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatMoney(summary.totalPaid || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Reste à payer</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                {formatMoney(summary.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Liste des factures */}
        {invoices.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={FileText}
              title="Aucune facture"
              description="Vous n'avez aucune facture pour le moment"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
              const balance = Number(invoice.amount) - Number(invoice.paidAmount);
              const isPaid = invoice.status === 'PAID';
              const isOverdue = ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) &&
                new Date(invoice.dueDate) < new Date();

              return (
                <div
                  key={invoice.id}
                  className={`
                    bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden
                    transition-all hover:shadow-lg
                    ${isOverdue ? 'border-rose-200 dark:border-rose-800' : 'border-gray-100 dark:border-slate-700'}
                  `}
                >
                  <div className={`h-1.5 ${isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-indigo-500'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                          <FileText size={22} className={isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                            {invoice.fee?.feeType?.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                            {invoice.reference}
                          </p>
                          {invoice.installmentNo && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Échéance {invoice.installmentNo}
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge color={statusConf.color}>
                        {statusConf.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Montant</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {formatMoney(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Déjà payé</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(invoice.paidAmount, invoice.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Solde</p>
                        <p className={`text-sm font-bold ${balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {formatMoney(balance, invoice.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Échéance</p>
                        <p className={`text-sm font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-gray-800 dark:text-slate-200'}`}>
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>

                    {!isPaid && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/my-invoices/${invoice.id}`)}
                          className="flex-1 sm:flex-none"
                        >
                          <CreditCard size={16} />
                          Payer cette facture
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={16} />
                          PDF
                        </Button>
                      </div>
                    )}

                    {isPaid && (
                      <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={16} />
                          <span className="font-medium">Facture payée</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download size={16} />
                          Reçu
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}