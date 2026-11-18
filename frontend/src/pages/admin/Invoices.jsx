import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Search, RefreshCw, Filter, ChevronLeft, ChevronRight,
  DollarSign, CheckCircle2, AlertCircle, Clock, TrendingUp, Layers,
  MoreVertical, Eye, Edit, Trash2, Send, Zap,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import InvoiceCreateModal from '../../components/admin/InvoiceCreateModal';
import BulkGenerateModal from '../../components/admin/BulkGenerateModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  SENT: { label: 'Envoyée', color: 'blue' },
  PARTIALLY_PAID: { label: 'Partiel', color: 'amber' },
  PAID: { label: 'Payée', color: 'green' },
  OVERDUE: { label: 'En retard', color: 'red' },
  CANCELLED: { label: 'Annulée', color: 'gray' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SENT', label: 'Envoyée' },
  { value: 'PARTIALLY_PAID', label: 'Partiellement payée' },
  { value: 'PAID', label: 'Payée' },
  { value: 'OVERDUE', label: 'En retard' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export default function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, invoice: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;
      if (filterOverdue) params.overdue = true;

      const [listRes, statsRes] = await Promise.all([
        api.get('/finance/invoices', { params }),
        api.get('/finance/invoices/stats').catch(() => ({ data: { data: null } })),
      ]);

      setInvoices(listRes.data.data);
      setPagination(listRes.data.pagination);
      setStats(statsRes.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, filterOverdue]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterOverdue]);

  const handleDelete = async () => {
    try {
      await api.delete(`/finance/invoices/${deleteModal.invoice.id}`);
      setSuccess('Facture supprimée');
      setDeleteModal({ open: false, invoice: null });
      await fetchInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, invoice: null });
    }
  };

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

  const isOverdue = (invoice) => {
    return (
      ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) &&
      new Date(invoice.dueDate) < new Date()
    );
  };

  const getDaysOverdue = (invoice) => {
    if (!isOverdue(invoice)) return 0;
    return Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <PageHeader
        title="Factures"
        subtitle="Gérez les factures des étudiants et suivez les paiements"
        badge="Finance"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkModalOpen(true)}>
              <Zap size={16} />
              Générer en masse
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus size={16} />
              Nouvelle facture
            </Button>
          </div>
        }
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

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={FileText}
              label="Total factures"
              value={stats.total || 0}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Montant total"
              value={formatMoney(stats.totalAmount)}
              color="violet"
              small
            />
            <StatCard
              icon={CheckCircle2}
              label="Encaissé"
              value={formatMoney(stats.totalPaid)}
              color="emerald"
              small
            />
            <StatCard
              icon={AlertCircle}
              label="En retard"
              value={formatMoney(stats.overdue?.amount || 0)}
              subtitle={`${stats.overdue?.count || 0} facture(s)`}
              color="rose"
              small
            />
          </div>
        )}

        {/* Barre d'outils */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, étudiant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOverdue}
                onChange={(e) => setFilterOverdue(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              En retard uniquement
            </label>

            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : invoices.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={FileText}
              title="Aucune facture"
              description="Créez votre première facture ou générez-les en masse"
              action={
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus size={16} />
                  Créer une facture
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Référence</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Étudiant</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Montant</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Échéance</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const statusConf = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT;
                    const overdue = isOverdue(invoice);
                    const days = getDaysOverdue(invoice);

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono font-medium text-gray-800 dark:text-slate-200">
                            {invoice.reference}
                          </span>
                          {invoice.installmentNo && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Échéance {invoice.installmentNo}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-800 dark:text-slate-200">
                            {invoice.student?.firstName} {invoice.student?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{invoice.student?.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                              <DollarSign size={14} className="text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-slate-400">
                              {invoice.fee?.feeType?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                            {formatMoney(invoice.amount, invoice.currency)}
                          </p>
                          {Number(invoice.paidAmount) > 0 && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Payé : {formatMoney(invoice.paidAmount, invoice.currency)}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <p className={`text-xs ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-gray-600 dark:text-slate-400'}`}>
                            {formatDate(invoice.dueDate)}
                          </p>
                          {overdue && (
                            <p className="text-xs text-rose-500 mt-0.5">
                              +{days}j
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge color={statusConf.color}>{statusConf.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/finance/invoices/${invoice.id}`);
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                              title="Voir"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ open: true, invoice });
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {pagination.total} facture(s) — Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <InvoiceCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setSuccess('Facture créée avec succès');
            fetchInvoices();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />

        <BulkGenerateModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          onSuccess={(result) => {
            setSuccess(`${result.count} facture(s) générée(s)`);
            fetchInvoices();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />

        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, invoice: null })}
          title="Supprimer la facture"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, invoice: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer la facture{' '}
            <strong>{deleteModal.invoice?.reference}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Action irréversible. Impossible si des paiements sont enregistrés.
          </p>
        </Modal>
      </main>
    </>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color, small }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-rose-600',
    violet: 'from-violet-500 to-violet-600',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className={`mt-0.5 font-bold text-gray-900 dark:text-slate-100 truncate ${small ? 'text-base' : 'text-xl'}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}