import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock,
  FileText, CreditCard, Layers, ArrowRight, Wallet, Receipt,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { usePlatform } from '../../contexts/PlatformContext';

export default function FinanceDashboard() {
  const { platform } = usePlatform(); // ⬅️ Récupération du contexte
  const currency = platform?.currency || 'MGA';
  
  const [stats, setStats] = useState({
    fees: null,
    invoices: null,
    payments: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feesRes, invoicesRes, paymentsRes] = await Promise.all([
          api.get('/finance/fees/stats').catch(() => ({ data: { data: null } })),
          api.get('/finance/invoices/stats').catch(() => ({ data: { data: null } })),
          api.get('/finance/payments/stats').catch(() => ({ data: { data: null } })),
        ]);

        setStats({
          fees: feesRes.data.data,
          invoices: invoicesRes.data.data,
          payments: paymentsRes.data.data,
        });
      } catch (err) {
        setError(err.userMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ⬇️ La fonction utilise maintenant `currency` du contexte
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return `0 ${currency}`;
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Finance" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  const invoiceStats = stats.invoices || {};
  const paymentStats = stats.payments || {};
  const feeStats = stats.fees || {};
  
  return (
    <>
      <PageHeader
        title="Finance"
        subtitle="Gérez les frais, factures et paiements"
        badge="Administrateur"
        action={
          <Link to="/finance/invoices">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              <FileText size={16} />
              Gérer les factures
            </button>
          </Link>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* ═══════ STATISTIQUES PRINCIPALES ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={Receipt}
            label="Total facturé"
            value={formatMoney(invoiceStats.totalAmount)}
            subtitle={`${invoiceStats.total || 0} facture(s)`}
            color="blue"
            to="/finance/invoices"
          />
          <StatCard
            icon={CheckCircle2}
            label="Total encaissé"
            value={formatMoney(invoiceStats.totalPaid)}
            subtitle={`${paymentStats.total || 0} paiement(s)`}
            color="emerald"
            to="/finance/payments"
          />
          {/* <StatCard
            icon={AlertCircle}
            label="Impayés"
            value={formatMoney(invoiceStats.overdue?.amount || 0)}
            subtitle={`${invoiceStats.overdue?.count || 0} facture(s)`}
            color="rose"
            to="/finance/overdue"
          /> */}
          <StatCard
            icon={Layers}
            label="Types de frais"
            value={feeStats.totalFeeTypes || 0}
            subtitle={`${feeStats.totalFees || 0} frais configuré(s)`}
            color="violet"
            to="/finance/fee-types"
          />
        </div>

        {/* ═══════ ACCÈS RAPIDES ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Accès rapides
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickLink to="/finance/fee-types" icon={Layers} label="Types de frais" color="violet" />
                <QuickLink to="/finance/fees" icon={DollarSign} label="Frais par classe" color="blue" />
                <QuickLink to="/finance/invoices" icon={FileText} label="Factures" color="emerald" />
                <QuickLink to="/finance/payments" icon={CreditCard} label="Paiements" color="amber" />
                <QuickLink to="/finance/overdue" icon={AlertCircle} label="Impayés" color="rose" />
                <QuickLink to="/finance/reminders" icon={Clock} label="Rappels" color="cyan" />
              </div>
            </div>

            {paymentStats.byMethod && paymentStats.byMethod.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                  Méthodes de paiement
                </h3>
                <div className="space-y-3">
                  {paymentStats.byMethod.map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                          <CreditCard size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                            {translateMethod(method.method)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {method.count} transaction(s)
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                        {formatMoney(method.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {invoiceStats.byStatus && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                  Statut des factures
                </h3>
                <div className="space-y-3">
                  {Object.entries(invoiceStats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusDot status={status} />
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {translateInvoiceStatus(status)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Solde global
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Total facturé</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                    {formatMoney(invoiceStats.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Total encaissé</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    - {formatMoney(invoiceStats.totalPaid)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Solde restant</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {formatMoney(invoiceStats.totalBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color, to }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-rose-600',
    violet: 'from-violet-500 to-violet-600',
  };

  const content = (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-xl font-bold text-gray-900 dark:text-slate-100 truncate">{value}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{subtitle}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
          <Icon size={20} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
}

function QuickLink({ to, icon: Icon, label, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <Link to={to} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm transition-all">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]} flex-shrink-0`}>
        <Icon size={16} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex-1">{label}</span>
      <ArrowRight size={14} className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function StatusDot({ status }) {
  const colors = {
    DRAFT: 'bg-gray-400',
    SENT: 'bg-blue-500',
    PARTIALLY_PAID: 'bg-amber-500',
    PAID: 'bg-emerald-500',
    OVERDUE: 'bg-rose-500',
    CANCELLED: 'bg-gray-400',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />;
}

function translateMethod(method) {
  const map = {
    CASH: 'Espèces', BANK_TRANSFER: 'Virement', CHECK: 'Chèque',
    MOBILE_MONEY_MVOLA: 'Mvola', MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_AIRTEL: 'Airtel Money', STRIPE_CARD: 'Carte bancaire', OTHER: 'Autre',
  };
  return map[method] || method;
}

function translateInvoiceStatus(status) {
  const map = {
    DRAFT: 'Brouillon', SENT: 'Envoyée', PARTIALLY_PAID: 'Partiellement payée',
    PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée',
  };
  return map[status] || status;
}