import { useEffect, useState, useCallback } from 'react';
import {
  Calendar, Plus, Search, RefreshCw, CheckCircle2, Clock, Archive,
  Lock, Copy, Edit, Trash2, MoreVertical, Star, TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import AcademicYearFormModal from '../../components/admin/AcademicYearFormModal';
import api from '../../services/api';

const STATUS_CONFIG = {
  PLANNED: { label: 'Planifiée', color: 'blue', icon: Clock },
  ACTIVE: { label: 'En cours', color: 'emerald', icon: CheckCircle2 },
  CLOSED: { label: 'Terminée', color: 'gray', icon: Lock },
  ARCHIVED: { label: 'Archivée', color: 'slate', icon: Archive },
};

export default function AcademicYears() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [duplicateModal, setDuplicateModal] = useState({ open: false, year: null, newLabel: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, year: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/academic-years', { params });
      setYears(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const handleActivate = async (year) => {
    if (!confirm(`Activer l'année "${year.label}" ? L'année active actuelle sera automatiquement fermée.`)) return;
    try {
      await api.post(`/academic-years/${year.id}/activate`);
      setSuccess(`Année ${year.label} activée`);
      await fetchYears();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const handleClose = async (year) => {
    if (!confirm(`Fermer l'année "${year.label}" ?`)) return;
    try {
      await api.post(`/academic-years/${year.id}/close`);
      setSuccess(`Année ${year.label} fermée`);
      await fetchYears();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const handleArchive = async (year) => {
    if (!confirm(`Archiver l'année "${year.label}" ?`)) return;
    try {
      await api.post(`/academic-years/${year.id}/archive`);
      setSuccess(`Année ${year.label} archivée`);
      await fetchYears();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const handleDuplicate = async () => {
    try {
      await api.post(`/academic-years/${duplicateModal.year.id}/duplicate`, {
        newLabel: duplicateModal.newLabel,
      });
      setSuccess(`Année dupliquée : ${duplicateModal.newLabel}`);
      setDuplicateModal({ open: false, year: null, newLabel: '' });
      await fetchYears();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/academic-years/${deleteModal.year.id}`);
      setSuccess('Année supprimée');
      setDeleteModal({ open: false, year: null });
      await fetchYears();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, year: null });
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeYear = years.find((y) => y.status === 'ACTIVE');

  return (
    <>
      <PageHeader
        title="Années académiques"
        // subtitle="Gérez les années scolaires et universitaires"
        badge="Administration"
        action={
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus size={16} />
            Nouvelle année
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

        {/* Bandeau de l'année active */}
        {activeYear && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-5 sm:p-6 mb-6 text-white shadow-lg">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />

            <div className="relative flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    Année académique active
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">{activeYear.label}</h2>
                <p className="text-sm text-white/80 mt-1">
                  Du {formatDate(activeYear.startDate)} au {formatDate(activeYear.endDate)}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-white/70 text-xs">Inscriptions</p>
                  <p className="text-xl font-bold">
                    {activeYear._count?.studentEnrollments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Factures</p>
                  <p className="text-xl font-bold">
                    {activeYear._count?.invoices || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une année..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchYears}>
            <RefreshCw size={14} />
          </Button>
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : years.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={Calendar}
              title="Aucune année académique"
              description="Créez votre première année académique pour commencer"
              action={
                <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
                  <Plus size={16} />
                  Créer une année
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {years.map((year) => {
              const config = STATUS_CONFIG[year.status] || STATUS_CONFIG.PLANNED;
              const Icon = config.icon;
              const isActive = year.status === 'ACTIVE';

              return (
                <div
                  key={year.id}
                  className={`
                    relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 
                    border transition-all duration-200
                    ${isActive
                      ? 'border-indigo-300 dark:border-indigo-700 shadow-lg ring-2 ring-indigo-100 dark:ring-indigo-900/50'
                      : 'border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5'
                    }
                  `}
                >
                  {/* Bandeau coloré */}
                  <div className={`h-1.5 ${isActive ? 'mc-gradient-primary' : 'bg-gray-200 dark:bg-slate-700'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isActive 
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500' 
                          : 'bg-gray-100 dark:bg-slate-700'
                        }
                      `}>
                        <Calendar size={22} className={isActive ? 'text-white' : 'text-gray-500 dark:text-slate-400'} />
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge color={config.color}>
                          <Icon size={10} className="mr-1" />
                          {config.label}
                        </Badge>

                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === year.id ? null : year.id)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuId === year.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg py-1 mc-animate-slide-down">
                                {year.status === 'PLANNED' && (
                                  <button
                                    onClick={() => { handleActivate(year); setOpenMenuId(null); }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                                  >
                                    <CheckCircle2 size={14} /> Activer
                                  </button>
                                )}
                                {year.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => { handleClose(year); setOpenMenuId(null); }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                                  >
                                    <Lock size={14} /> Fermer
                                  </button>
                                )}
                                {year.status === 'CLOSED' && (
                                  <button
                                    onClick={() => { handleArchive(year); setOpenMenuId(null); }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                                  >
                                    <Archive size={14} /> Archiver
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setDuplicateModal({ open: true, year, newLabel: '' });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                                >
                                  <Copy size={14} /> Dupliquer
                                </button>
                                <button
                                  onClick={() => { setEditing(year); setModalOpen(true); setOpenMenuId(null); }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                                >
                                  <Edit size={14} /> Modifier
                                </button>
                                {year.status !== 'ACTIVE' && (
                                  <>
                                    <hr className="my-1 border-gray-100 dark:border-slate-600" />
                                    <button
                                      onClick={() => { setDeleteModal({ open: true, year }); setOpenMenuId(null); }}
                                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Supprimer
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-slate-100'}`}>
                      {year.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                      {formatDate(year.startDate)} → {formatDate(year.endDate)}
                    </p>

                    {year.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {year.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs">
                      <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <TrendingUp size={12} />
                        {year._count?.studentEnrollments || 0} inscription(s)
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {year._count?.invoices || 0} facture(s)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal création/édition */}
        <AcademicYearFormModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSuccess={() => {
            setSuccess(editing ? 'Année modifiée' : 'Année créée');
            fetchYears();
            setTimeout(() => setSuccess(''), 3000);
          }}
          year={editing}
        />

        {/* Modal duplication */}
        <Modal
          isOpen={duplicateModal.open}
          onClose={() => setDuplicateModal({ open: false, year: null, newLabel: '' })}
          title="Dupliquer l'année académique"
          footer={
            <>
              <Button variant="outline" onClick={() => setDuplicateModal({ open: false, year: null, newLabel: '' })}>
                Annuler
              </Button>
              <Button onClick={handleDuplicate} disabled={!duplicateModal.newLabel}>
                <Copy size={16} />
                Dupliquer
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                L'année <strong>{duplicateModal.year?.label}</strong> sera copiée avec toutes ses configurations
                (semestres, dates d'inscription, etc.). Les dates seront décalées d'un an.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Nouveau libellé *
              </label>
              <input
                type="text"
                value={duplicateModal.newLabel}
                onChange={(e) => setDuplicateModal({ ...duplicateModal, newLabel: e.target.value })}
                placeholder="Ex: 2026-2027"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Modal>

        {/* Modal suppression */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, year: null })}
          title="Supprimer l'année académique"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, year: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer l'année <strong>{deleteModal.year?.label}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Action irréversible. Impossible si des inscriptions ou factures sont rattachées.
          </p>
        </Modal>
      </main>
    </>
  );
}