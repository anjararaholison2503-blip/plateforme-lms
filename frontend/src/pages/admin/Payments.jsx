import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard, Search, RefreshCw, CheckCircle2, Clock,
  XCircle, DollarSign, TrendingUp, FileSpreadsheet, Plus, AlertCircle,
  Receipt as ReceiptIcon, BarChart3, PieChart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PaymentRegistrationModal from '../../components/admin/PaymentRegistrationModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import { usePlatform } from '../../contexts/PlatformContext'; // ⬅️ IMPORT AJOUTÉ

const METHOD_CONFIG = {
  CASH: { label: 'Espèces', color: 'emerald' },
  BANK_TRANSFER: { label: 'Virement', color: 'blue' },
  CHECK: { label: 'Chèque', color: 'violet' },
  MOBILE_MONEY_MVOLA: { label: 'Mvola', color: 'yellow' },
  MOBILE_MONEY_ORANGE: { label: 'Orange Money', color: 'orange' },
  MOBILE_MONEY_AIRTEL: { label: 'Airtel Money', color: 'red' },
  STRIPE_CARD: { label: 'Carte bancaire', color: 'indigo' },
  OTHER: { label: 'Autre', color: 'gray' },
};

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'yellow' },
  COMPLETED: { label: 'Complété', color: 'emerald' },
  FAILED: { label: 'Échoué', color: 'red' },
  REFUNDED: { label: 'Remboursé', color: 'blue' },
  CANCELLED: { label: 'Annulé', color: 'gray' },
};

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'];

export default function Payments() {
  const { platform } = usePlatform(); // ⬅️ Récupération du contexte
  const currency = platform?.currency || 'MGA';

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [methodData, setMethodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterMethod) params.method = filterMethod;
      if (filterStatus) params.status = filterStatus;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const [listRes, statsRes] = await Promise.all([
        api.get('/finance/payments', { params }),
        api.get('/finance/payments/stats', { params }),
      ]);

      setPayments(listRes.data.data || []);
      setStats(statsRes.data.data);

      if (statsRes.data.data?.byMethod) {
        setMethodData(
          statsRes.data.data.byMethod.map((item) => ({
            name: METHOD_CONFIG[item.method]?.label || item.method,
            value: Number(item.amount),
            count: item.count,
          }))
        );
      }

      if (statsRes.data.data?.byMonth) {
        setMonthlyData(statsRes.data.data.byMonth);
      } else {
        setMonthlyData([
          // { month: 'Sept', amount: 0 },
          // { month: 'Oct', amount: 1200000 },
          // { month: 'Nov', amount: 1800000 },
          // { month: 'Déc', amount: 1500000 },
          // { month: 'Jan', amount: 2100000 },
          // { month: 'Fév', amount: 1900000 },
        ]);
      }

      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterMethod, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (filterMethod) params.append('method', filterMethod);
      if (filterStatus) params.append('status', filterStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await api.get(`/finance/exports/payments/excel?${params}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paiements-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  // ⬇️ Utilise maintenant `currency` du contexte
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return `0 ${currency}`;
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <PageHeader
        title="Paiements"
        subtitle="Enregistrez et suivez les paiements des étudiants"
        badge="Finance"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet size={16} /> Export Excel
            </Button>
            <Button size="sm" onClick={() => setRegistrationModalOpen(true)}>
              <Plus size={16} /> Nouveau paiement
            </Button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MiniStat icon={CreditCard} label="Total paiements" value={stats.total || 0} color="emerald" />
            <MiniStat icon={DollarSign} label="Montant total" value={formatMoney(stats.totalAmount)} color="blue" small />
            <MiniStat icon={TrendingUp} label="Ce mois" value={formatMoney(stats.thisMonth || 0)} color="violet" small />
            <MiniStat icon={CheckCircle2} label="Complétés" value={stats.byStatus?.COMPLETED || 0} color="emerald" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">Évolution des paiements</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Montant encaissé par mois</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => formatMoney(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <PieChart size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">Méthodes</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Répartition des paiements</p>
              </div>
            </div>
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <RePieChart>
                  <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {methodData.map((entry, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <PieChart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher un paiement..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100">
              <option value="">Toutes les méthodes</option>
              {Object.entries(METHOD_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100" />
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {loading ? (
          <Spinner className="py-20" />
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState icon={CreditCard} title="Aucun paiement" description="Enregistrez votre premier paiement" action={<Button onClick={() => setRegistrationModalOpen(true)}><Plus size={16} /> Nouveau paiement</Button>} />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Référence</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Facture</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const methodConf = METHOD_CONFIG[p.method] || METHOD_CONFIG.OTHER;
                    const statusConf = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
                    return (
                      <tr key={p.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4"><span className="text-sm font-mono font-medium text-gray-800 dark:text-slate-200">{p.reference}</span></td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-800 dark:text-slate-200">{p.student?.firstName} {p.student?.lastName}</p>
                          <p className="text-xs text-gray-400">{p.student?.email}</p>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">{p.invoice?.reference || '—'}</td>
                        <td className="py-3 px-4 text-right"><span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{formatMoney(p.amount)}</span></td>
                        <td className="py-3 px-4 text-center"><Badge color={methodConf.color}>{methodConf.label}</Badge></td>
                        <td className="py-3 px-4 text-center"><Badge color={statusConf.color}>{statusConf.label}</Badge></td>
                        <td className="py-3 px-4 text-center text-xs text-gray-500">{formatDate(p.paidAt || p.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <PaymentRegistrationModal isOpen={registrationModalOpen} onClose={() => setRegistrationModalOpen(false)} onSuccess={() => { fetchData(); setRegistrationModalOpen(false); }} />
      </main>
    </>
  );
}

function MiniStat({ icon: Icon, label, value, color, small }) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    violet: 'from-violet-500 to-violet-600',
    rose: 'from-rose-500 to-rose-600',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`mt-0.5 font-bold text-gray-900 dark:text-slate-100 truncate ${small ? 'text-base' : 'text-xl'}`}>{value}</p>
      </div>
    </div>
  );
}