import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, Plus, Search, RefreshCw, Edit, Trash2, Filter,
  Layers, Building2, Calendar, TrendingUp, MoreVertical,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import FeeFormModal from '../../components/admin/FeeFormModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [filterFeeType, setFilterFeeType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, fee: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterFeeType) params.feeTypeId = filterFeeType;
      if (filterYear) params.academicYear = filterYear;
      if (filterClass) params.classId = filterClass;

      const [feesRes, typesRes, classesRes] = await Promise.all([
        api.get('/finance/fees', { params }),
        api.get('/finance/fee-types').catch(() => ({ data: { data: [] } })),
        api.get('/institution/units?type=CLASS').catch(() => ({ data: { data: [] } })),
      ]);

      setFees(feesRes.data.data || []);
      setFeeTypes(typesRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterFeeType, filterYear, filterClass]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      await api.delete(`/finance/fees/${deleteModal.fee.id}`);
      setSuccess('Frais supprimé avec succès');
      setDeleteModal({ open: false, fee: null });
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, fee: null });
    }
  };

  const formatMoney = (amount, currency = 'MGA') => {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
  };

  const totalAmount = fees.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <>
      <PageHeader
        title="Frais par classe"
        subtitle="Configurez les frais applicables à chaque classe et niveau"
        badge="Finance"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            Nouveau frais
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={DollarSign}
            label="Total frais"
            value={fees.length}
            color="emerald"
          />
          <StatCard
            icon={TrendingUp}
            label="Montant total"
            value={formatMoney(totalAmount)}
            color="blue"
            small
          />
          <StatCard
            icon={Layers}
            label="Types utilisés"
            value={new Set(fees.map((f) => f.feeTypeId)).size}
            color="violet"
          />
          <StatCard
            icon={Building2}
            label="Classes couvertes"
            value={new Set(fees.map((f) => f.classId).filter(Boolean)).size}
            color="amber"
          />
        </div>

        {/* Barre d'outils */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100"
            >
              <option value="">Tous les types</option>
              {feeTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100"
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100"
            >
              <option value="">Toutes les années</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>

            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : fees.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={DollarSign}
              title="Aucun frais configuré"
              description="Créez votre premier frais pour facturer les étudiants"
              action={
                <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
                  <Plus size={16} />
                  Créer un frais
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Vue desktop : Tableau */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type de frais</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Classe</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Année</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Montant</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                              {fee.feeType?.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{fee.feeType?.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                        {fee.class?.name || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                        {fee.academicYear}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {formatMoney(fee.amount, fee.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {fee.isActive ? (
                          <Badge color="green">Actif</Badge>
                        ) : (
                          <Badge color="gray">Inactif</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditing(fee);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                            title="Modifier"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, fee })}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue mobile : Cartes */}
            <div className="lg:hidden space-y-3">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {fee.feeType?.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{fee.feeType?.code}</p>
                      </div>
                    </div>
                    {fee.isActive ? (
                      <Badge color="green">Actif</Badge>
                    ) : (
                      <Badge color="gray">Inactif</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Classe</span>
                      <span className="text-gray-800 dark:text-slate-200">
                        {fee.class?.name || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Année</span>
                      <span className="text-gray-800 dark:text-slate-200">{fee.academicYear}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-gray-500 dark:text-slate-400">Montant</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(fee.amount, fee.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(fee);
                        setModalOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Edit size={14} />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModal({ open: true, fee })}
                      className="text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal création/édition */}
        <FeeFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setSuccess(editing ? 'Frais modifié' : 'Frais créé avec succès');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
          }}
          fee={editing}
          feeTypes={feeTypes}
          classes={classes}
        />

        {/* Modal suppression */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, fee: null })}
          title="Supprimer le frais"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, fee: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer le frais <strong>{deleteModal.fee?.feeType?.name}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Action irréversible. Impossible si des factures y sont rattachées.
          </p>
        </Modal>
      </main>
    </>
  );
}

// Sous-composants
function StatCard({ icon: Icon, label, value, color, small }) {
  const colors = {
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-sm flex-shrink-0`}>
        <Icon size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className={`mt-0.5 font-bold text-gray-900 dark:text-slate-100 truncate ${small ? 'text-base' : 'text-xl'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Import Modal (à ajouter en haut)
import Modal from '../../components/ui/Modal';