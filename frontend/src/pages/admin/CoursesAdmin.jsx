import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Search, RefreshCw, MoreVertical, Edit, Trash2,
  Users as UsersIcon, Calendar, Clock, Award, Eye, FileText,
  LayoutGrid, List, GraduationCap,
} from 'lucide-react';
import { Layers } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import {
  translateUnitType, formatUserName, getInitials,
} from '../../utils/format';

// Configuration par statut
const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'green' },
  ARCHIVED: { label: 'Archivé', color: 'yellow' },
};

const COLOR_OPTIONS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
];

const emptyForm = {
  title: '',
  code: '',
  description: '',
  credits: 0,
  hours: 0,
  status: 'DRAFT',
  color: '#3B82F6',
  unitId: '',
  teachingUnitId: '',
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const debouncedSearch = useDebounce(search, 400);

  const [units, setUnits] = useState([]);
  const [teachingUnits, setTeachingUnits] = useState([]); // 
  const [filterTeachingUnit, setFilterTeachingUnit] = useState(''); // 
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });

  // ============ CHARGEMENT ============
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;
      if (filterUnit) params.unitId = filterUnit;
      if (filterTeachingUnit) params.teachingUnitId = filterTeachingUnit; 

      const res = await api.get('/courses', { params });
      setCourses(res.data.data);
      setPagination(res.data.pagination);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
}, [page, debouncedSearch, filterStatus, filterUnit, filterTeachingUnit]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

useEffect(() => {
  Promise.all([
    api.get('/institution/units').catch(() => ({ data: { data: [] } })),
    api.get('/teaching-units').catch(() => ({ data: { data: [] } })),
  ]).then(([unitsRes, tuRes]) => {
    setUnits(unitsRes.data.data || []);
    setTeachingUnits(tuRes.data.data || []);
  });
}, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterStatus, filterUnit]);

  // Fermer le menu contextuel au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ============ ACTIONS ============
  const openCreateModal = () => {
    setModalMode('create');
    setEditingCourse(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

const openEditModal = (course) => {
  setModalMode('edit');
  setEditingCourse(course);
  setFormData({
    title: course.title,
    code: course.code,
    description: course.description || '',
    credits: course.credits || 0,
    hours: course.hours || 0,
    status: course.status,
    color: course.color || '#3B82F6',
    unitId: course.unitId || '',
    teachingUnitId: course.teachingUnitId || '',
  });
  setOpenMenuId(null);
  setModalOpen(true);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...formData };
      if (payload.unitId === '') payload.unitId = null;
      if (payload.teachingUnitId === '') payload.teachingUnitId = null;
      payload.credits = parseInt(payload.credits) || 0;
      payload.hours = parseInt(payload.hours) || 0;

      if (modalMode === 'create') {
        await api.post('/courses', payload);
        setSuccess('Cours créé avec succès');
      } else {
        await api.put(`/courses/${editingCourse.id}`, payload);
        setSuccess('Cours modifié avec succès');
      }
      setModalOpen(false);
      await fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deleteModal.course.id}`);
      setSuccess('Cours supprimé avec succès');
      setDeleteModal({ open: false, course: null });
      await fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, course: null });
    }
  };

  // ============ FILTRES ONGLETS ============
  const tabs = [
    { value: '', label: 'Tous', icon: LayoutGrid },
    { value: 'PUBLISHED', label: 'Publiés', icon: Eye },
    { value: 'DRAFT', label: 'Brouillons', icon: FileText },
    { value: 'ARCHIVED', label: 'Archivés', icon: Award },
  ];

  return (
    <>
      <Header
        title="Cours"
        subtitle="Gérez les cours, sessions et inscriptions"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus size={16} />
            Nouveau cours
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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

        {/* ============ BARRE D'OUTILS ============ */}
        <div className="mb-6 space-y-4">
          {/* Onglets de statut */}
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  filterStatus === tab.value
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Recherche + filtres */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100"
            >
              <option value="">Toutes les unités</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select
              value={filterTeachingUnit}
              onChange={(e) => setFilterTeachingUnit(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100"
            >
              <option value="">Toutes les UE</option>
              {teachingUnits.map((tu) => (
                <option key={tu.id} value={tu.id}>
                  [{tu.code}] {tu.name}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={fetchCourses}>
              <RefreshCw size={14} />
            </Button>

            <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ============ CONTENU ============ */}
        {loading ? (
          <Spinner className="py-20" />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucun cours"
            description="Créez votre premier cours pour commencer"
            action={
              <Button onClick={openCreateModal}>
                <Plus size={16} />
                Créer un cours
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <GridView
            courses={courses}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            menuRef={menuRef}
            onEdit={openEditModal}
            onDelete={(course) => setDeleteModal({ open: true, course })}
            onView={(course) => navigate(`/courses/${course.id}`)}
          />
        ) : (
          <ListView
            courses={courses}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            menuRef={menuRef}
            onEdit={openEditModal}
            onDelete={(course) => setDeleteModal({ open: true, course })}
            onView={(course) => navigate(`/courses/${course.id}`)}
          />
        )}

        {/* ============ PAGINATION ============ */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {pagination.total} cours — Page {pagination.page} sur {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {/* ============ MODAL CRÉATION / ÉDITION ============ */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalMode === 'create' ? 'Nouveau cours' : 'Modifier le cours'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} loading={saving}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Aperçu couleur + titre */}
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: formData.color }}
              >
                <BookOpen size={28} className="text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  label="Titre du cours"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Introduction à la Programmation"
                  required
                />
                <Input
                  label="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: INFO101"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Décrivez brièvement le contenu du cours..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Unité d'Enseignement (optionnel)
              </label>
              <select
                value={formData.teachingUnitId || ''}
                onChange={(e) => setFormData({ ...formData, teachingUnitId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">— Aucune (matière indépendante) —</option>
                {teachingUnits.map((tu) => (
                  <option key={tu.id} value={tu.id}>
                    [{tu.code}] {tu.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Crédits + Heures */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Crédits"
                type="number"
                min="0"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              />
              <Input
                label="Heures"
                type="number"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              />
            </div>

            {/* Statut + Unité */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Unité
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="">— Aucune —</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({translateUnitType(u.type)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Couleur
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-9 h-9 rounded-lg transition-transform ${
                      formData.color === c
                        ? 'ring-2 ring-offset-2 ring-primary-500 scale-110 dark:ring-offset-slate-800'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer"
                  title="Couleur personnalisée"
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* ============ MODAL SUPPRESSION ============ */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, course: null })}
          title="Confirmer la suppression"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, course: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer le cours <strong>{deleteModal.course?.title}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Toutes les sessions liées seront également supprimées. Cette action est irréversible.
          </p>
        </Modal>
      </main>
    </>
  );
}

// ============================================================
// VUE GRILLE (Cartes)
// ============================================================
function GridView({ courses, openMenuId, setOpenMenuId, menuRef, onEdit, onDelete, onView }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((course) => {
        const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
        return (
          <div
            key={course.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-600 transition-all overflow-hidden group cursor-pointer"
            onClick={() => onView(course)}
          >
            {/* Bandeau coloré */}
            <div
              className="h-2"
              style={{ backgroundColor: course.color || '#3B82F6' }}
            />

            <div className="p-5">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${course.color || '#3B82F6'}20` }}
                >
                  <BookOpen
                    size={22}
                    style={{ color: course.color || '#3B82F6' }}
                  />
                </div>

                <div className="relative" ref={openMenuId === course.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === course.id ? null : course.id);
                    }}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === course.id && (
                    <div className="absolute right-0 top-8 z-10 w-44 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-1 animate-fade-in">
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(course); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Eye size={14} /> Voir les détails
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                      >
                        <Edit size={14} /> Modifier
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-slate-600" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(course); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Code + Statut */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {course.code}
                </span>
                <Badge color={statusConf.color}>{statusConf.label}</Badge>
                {course.teachingUnit && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                    <Layers size={10} />
                    {course.teachingUnit.code}
                  </span>
                )}
              </div>

              {/* Titre */}
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {course.title}
              </h3>

              {/* Description tronquée */}
              {course.description && (
                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {course._count?.sessions || 0} session(s)
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon size={13} /> {course.enrolledCount || 0}
                </span>
                {course.credits > 0 && (
                  <span className="flex items-center gap-1">
                    <Award size={13} /> {course.credits} cr.
                  </span>
                )}
              </div>

              {/* Enseignant principal */}
              {course.teachers && course.teachers.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-[10px]">
                    {getInitials(course.teachers[0].teacher)}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-slate-400 truncate">
                    {formatUserName(course.teachers[0].teacher)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// VUE LISTE (Tableau compact)
// ============================================================
function ListView({ courses, openMenuId, setOpenMenuId, menuRef, onEdit, onDelete, onView }) {
  return (
    <Card noPadding>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Cours</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Statut</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Unité</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Sessions</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Inscrits</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
              return (
                <tr
                  key={course.id}
                  className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => onView(course)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.color || '#3B82F6' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">{course.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge color={statusConf.color}>{statusConf.label}</Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 dark:text-slate-400">
                    {course.unit ? course.unit.name : '—'}
                    {course.teachingUnit && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                          <Layers size={10} />
                          {course.teachingUnit.code}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-slate-300">
                    {course._count?.sessions || 0}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-slate-300">
                    {course.enrolledCount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                        title="Modifier"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(course); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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
    </Card>
  );
}