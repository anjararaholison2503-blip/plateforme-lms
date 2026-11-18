import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, RefreshCw, Plus, ChevronLeft, ChevronRight,
  UserPlus, Trash2, Eye, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import EnrollmentStats from '../../components/admin/EnrollmentStats';
import EnrollmentCreateModal from '../../components/admin/EnrollmentCreateModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'PENDING_DOCUMENTS', label: 'Documents manquants' },
  { value: 'PENDING_REVIEW', label: 'En attente' },
  { value: 'PENDING_PAYMENT', label: 'À payer' },
  { value: 'ENROLLED', label: 'Inscrits' },
  { value: 'COMPLETED', label: 'Terminés' },
  { value: 'REPEATED', label: 'Redoublés' },
  { value: 'REJECTED', label: 'Rejetés' },
];

const STATUS_CONFIG = {
  PENDING_DOCUMENTS: { label: 'Docs manquants', color: 'amber' },
  PENDING_REVIEW: { label: 'En attente', color: 'blue' },
  PENDING_PAYMENT: { label: 'À payer', color: 'orange' },
  ENROLLED: { label: 'Inscrit', color: 'emerald' },
  COMPLETED: { label: 'Terminé', color: 'gray' },
  REPEATED: { label: 'Redoublé', color: 'purple' },
  REJECTED: { label: 'Rejeté', color: 'rose' },
};

export default function Enrollments() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterReenrollment, setFilterReenrollment] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;
      if (filterYear) params.academicYear = filterYear;
      if (filterReenrollment) params.isReenrollment = filterReenrollment;

      const [listRes, statsRes] = await Promise.all([
        api.get('/enrollments', { params }),
        api.get('/enrollments/stats', { params: filterYear ? { academicYear: filterYear } : {} }),
      ]);

      setEnrollments(listRes.data.data);
      setPagination(listRes.data.pagination);
      setStats(statsRes.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus, filterYear, filterReenrollment]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus, filterYear, filterReenrollment]);

  // ═══════════════════════════════════════════════════════════
  // SUPPRESSION D'UNE INSCRIPTION
  // ═══════════════════════════════════════════════════════════
  const handleDelete = async (id, name) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'inscription de "${name}" ? Cette action est irréversible.`)) return;
    
    try {
      await api.delete(`/enrollments/${id}`);
      setSuccess('Inscription supprimée avec succès');
      fetchEnrollments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <PageHeader
        title="Inscriptions"
        subtitle="Gérez les demandes d'inscription et les réinscriptions"
        badge="Administrateur"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            Nouvelle inscription
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && (
          <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>
        )}
        {success && (
          <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>
        )}

        {/* Statistiques */}
        <EnrollmentStats stats={stats} />

        {/* Barre d'outils */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-700 dark:text-slate-100"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
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

            <Button variant="outline" size="sm" onClick={fetchEnrollments}>
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        {/* TABLEAU */}
        {loading ? (
          <Spinner className="py-20" />
        ) : enrollments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={UserPlus}
              title="Aucune inscription"
              description="Les nouvelles demandes d'inscription apparaîtront ici"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Référence</th>
                    <th className="p-4 font-semibold">Étudiant</th>
                    <th className="p-4 font-semibold">Filière / Classe</th>
                    <th className="p-4 font-semibold">Statut</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {enrollments.map((enr) => {
                    const statusConf = STATUS_CONFIG[enr.status] || { label: enr.status, color: 'gray' };
                    return (
                      <tr key={enr.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <p className="font-mono text-sm font-medium text-gray-700 dark:text-slate-300">{enr.reference}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-800 dark:text-slate-100">{enr.applicantName}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{enr.applicantEmail}</p>
                        </td>
                        <td className="p-4">
                          {enr.desiredProgram ? (
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{enr.desiredProgram.name}</p>
                              {enr.desiredClass && <p className="text-xs text-gray-500">{enr.desiredClass.name}</p>}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Non spécifié</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge color={statusConf.color}>{statusConf.label}</Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500 dark:text-slate-400">
                          {new Date(enr.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/enrollments/${enr.id}`)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Voir le dossier"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(enr.id, enr.applicantName)}
                              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                              title="Supprimer l'inscription"
                            >
                              <Trash2 size={16} />
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
              <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {pagination.total} inscription(s) — Page {pagination.page} sur {pagination.totalPages}
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
          </div>
        )}

        {/* Modal de création */}
        <EnrollmentCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => fetchEnrollments()}
        />
      </main>
    </>
  );
}