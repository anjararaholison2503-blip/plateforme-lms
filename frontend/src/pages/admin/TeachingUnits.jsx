import { useEffect, useState, useCallback } from 'react';
import {
  GraduationCap, Plus, Search, RefreshCw, Edit, Trash2, ChevronDown,
  ChevronRight, BookOpen, Users as UsersIcon, Award, Clock, Layers,
  X, Settings, Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
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
import { translateUnitType } from '../../utils/format';

const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];

const SEMESTER_COLORS = {
  S1: 'blue', S2: 'blue',
  S3: 'green', S4: 'green',
  S5: 'purple', S6: 'purple',
  S7: 'yellow', S8: 'yellow',
  S9: 'red', S10: 'red',
};

const emptyForm = {
  code: '',
  name: '',
  description: '',
  semester: '',
  unitId: '',
};

const emptyCourseForm = {
  code: '',
  title: '',
  credits: 0,
  hours: 0,
  coefficient: 1,
  description: '',
  color: '#3B82F6',
};

export default function TeachingUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [expandedUnits, setExpandedUnits] = useState({});
  const [institutionUnits, setInstitutionUnits] = useState([]);

  // Modals
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedUnitForCourse, setSelectedUnitForCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedUnitForClass, setSelectedUnitForClass] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  const [deleteModal, setDeleteModal] = useState({ open: false, unit: null });

  // ═══════ CHARGEMENT ═══════
  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterSemester) params.semester = filterSemester;

      const res = await api.get('/teaching-units', { params });
      setUnits(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterSemester]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  useEffect(() => {
    api.get('/institution/units')
      .then((res) => setInstitutionUnits(res.data.data))
      .catch(() => {});
  }, []);

  // ═══════ CRUD UE ═══════
  const openCreateModal = () => {
    setModalMode('create');
    setEditingUnit(null);
    setFormData(emptyForm);
    setUnitModalOpen(true);
  };

  const openEditModal = (unit) => {
    setModalMode('edit');
    setEditingUnit(unit);
    setFormData({
      code: unit.code,
      name: unit.name,
      description: unit.description || '',
      semester: unit.semester || '',
      unitId: unit.unitId || '',
    });
    setUnitModalOpen(true);
  };

  const handleSubmitUnit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (payload.unitId === '') payload.unitId = null;
      if (payload.semester === '') payload.semester = null;

      if (modalMode === 'create') {
        await api.post('/teaching-units', payload);
        setSuccess('UE créée avec succès');
      } else {
        await api.put(`/teaching-units/${editingUnit.id}`, payload);
        setSuccess('UE modifiée');
      }
      setUnitModalOpen(false);
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/teaching-units/${deleteModal.unit.id}`);
      setSuccess('UE supprimée');
      setDeleteModal({ open: false, unit: null });
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, unit: null });
    }
  };

  // ═══════ GESTION DES MATIÈRES ═══════
  const openCourseModal = (unit) => {
    setSelectedUnitForCourse(unit);
    setCourseForm(emptyCourseForm);
    setCourseModalOpen(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...courseForm,
        credits: parseInt(courseForm.credits) || 0,
        hours: parseInt(courseForm.hours) || 0,
        coefficient: parseInt(courseForm.coefficient) || 1,
      };
      await api.post(`/teaching-units/${selectedUnitForCourse.id}/courses/new`, payload);
      setSuccess('Matière créée et ajoutée à l\'UE');
      setCourseModalOpen(false);
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCourse = async (unitId, courseId, courseTitle) => {
    if (!confirm(`Retirer "${courseTitle}" de cette UE ?\nLa matière ne sera pas supprimée, juste détachée.`)) return;
    try {
      await api.delete(`/teaching-units/${unitId}/courses/${courseId}`);
      setSuccess('Matière retirée de l\'UE');
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══════ GESTION DES CLASSES ═══════
  const openClassModal = async (unit) => {
    setSelectedUnitForClass(unit);
    setSelectedClassIds([]);
    try {
      const res = await api.get('/institution/units?type=CLASS');
      setClassesList(res.data.data);
    } catch {
      setClassesList([]);
    }
    setClassModalOpen(true);
  };

  const handleAssignClasses = async (e) => {
    e.preventDefault();
    if (selectedClassIds.length === 0) return;
    setSaving(true);
    try {
      await api.post(`/teaching-units/${selectedUnitForClass.id}/classes`, {
        classIds: selectedClassIds,
      });
      setSuccess(`${selectedClassIds.length} classe(s) attribuée(s)`);
      setClassModalOpen(false);
      setSelectedClassIds([]);
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveClass = async (unitId, classId, className) => {
    if (!confirm(`Retirer "${className}" de cette UE ?`)) return;
    try {
      await api.delete(`/teaching-units/${unitId}/classes/${classId}`);
      setSuccess('Classe retirée');
      await fetchUnits();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══════ TOGGLE ═══════
  const toggleUnit = (unitId) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // ═══════ RENDU ═══════
  return (
    <>
      <PageHeader
        title="Unités d'Enseignement"
        subtitle="Regroupez les matières en unités cohérentes (système LMD)"
        badge="Administrateur"
        action={
          <Button size="sm" onClick={openCreateModal}>
            <Plus size={16} />
            Nouvelle UE
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

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatBox
            icon={Layers}
            label="Total UE"
            value={units.length}
            color="purple"
          />
          <StatBox
            icon={BookOpen}
            label="Total matières"
            value={units.reduce((sum, u) => sum + (u.coursesCount || 0), 0)}
            color="blue"
          />
          <StatBox
            icon={Award}
            label="Total crédits"
            value={units.reduce((sum, u) => sum + (u.totalCredits || 0), 0)}
            color="green"
          />
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une UE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-100"
          >
            <option value="">Tous les semestres</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>Semestre {s}</option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={fetchUnits}>
            <RefreshCw size={14} />
          </Button>
        </div>

        {/* Liste des UE */}
        {loading ? (
          <Spinner className="py-20" />
        ) : units.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={GraduationCap}
              title="Aucune UE créée"
              description="Commencez par créer votre première unité d'enseignement"
              action={
                <Button onClick={openCreateModal}>
                  <Plus size={16} />
                  Créer une UE
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                expanded={expandedUnits[unit.id]}
                onToggle={() => toggleUnit(unit.id)}
                onEdit={() => openEditModal(unit)}
                onDelete={() => setDeleteModal({ open: true, unit })}
                onAddCourse={() => openCourseModal(unit)}
                onRemoveCourse={(courseId, title) => handleRemoveCourse(unit.id, courseId, title)}
                onManageClasses={() => openClassModal(unit)}
                onRemoveClass={(classId, name) => handleRemoveClass(unit.id, classId, name)}
              />
            ))}
          </div>
        )}

        {/* ═══════ MODAL UE ═══════ */}
        <Modal
          isOpen={unitModalOpen}
          onClose={() => setUnitModalOpen(false)}
          title={modalMode === 'create' ? 'Nouvelle Unité d\'Enseignement' : 'Modifier l\'UE'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setUnitModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmitUnit} loading={saving}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitUnit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Code de l'UE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: UE-LANG-101"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Semestre
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="">— Aucun —</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>Semestre {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Nom de l'UE"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Unité d'enseignement Langues"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Ex: Français, Anglais, Italien..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Filière / Niveau (optionnel)
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">— Aucune —</option>
                {institutionUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({translateUnitType(u.type)})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>

        {/* ═══════ MODAL MATIÈRE ═══════ */}
        <Modal
          isOpen={courseModalOpen}
          onClose={() => setCourseModalOpen(false)}
          title={`Nouvelle matière — ${selectedUnitForCourse?.name || ''}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setCourseModalOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateCourse} loading={saving}>Créer</Button>
            </>
          }
        >
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Code"
                value={courseForm.code}
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                placeholder="Ex: ANG-101"
                required
              />
              <Input
                label="Titre"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Ex: Anglais technique"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Crédits"
                type="number"
                min="0"
                value={courseForm.credits}
                onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
              />
              <Input
                label="Heures"
                type="number"
                min="0"
                value={courseForm.hours}
                onChange={(e) => setCourseForm({ ...courseForm, hours: e.target.value })}
              />
              <Input
                label="Coefficient"
                type="number"
                min="1"
                max="10"
                value={courseForm.coefficient}
                onChange={(e) => setCourseForm({ ...courseForm, coefficient: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Couleur
              </label>
              <input
                type="color"
                value={courseForm.color}
                onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 dark:border-slate-600 cursor-pointer"
              />
            </div>
          </form>
        </Modal>

        {/* ═══════ MODAL CLASSES ═══════ */}
        <Modal
          isOpen={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          title={`Attribuer des classes — ${selectedUnitForClass?.name || ''}`}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setClassModalOpen(false)}>Annuler</Button>
              <Button onClick={handleAssignClasses} loading={saving} disabled={selectedClassIds.length === 0}>
                Attribuer {selectedClassIds.length > 0 ? `(${selectedClassIds.length})` : ''}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Sélectionnez les classes qui suivront cette UE. Toutes les matières de l'UE seront automatiquement accessibles à ces classes.
            </p>

            {classesList.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Aucune classe disponible"
                description="Créez d'abord des classes dans la page Structure"
              />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {classesList
                  .filter((c) => !selectedUnitForClass?.classes?.some((cc) => cc.classId === c.id))
                  .map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClassIds.includes(c.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedClassIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClassIds([...selectedClassIds, c.id]);
                          } else {
                            setSelectedClassIds(selectedClassIds.filter((id) => id !== c.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{c.name}</p>
                        {c.code && <p className="text-xs text-gray-400 font-mono">{c.code}</p>}
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </Modal>

        {/* ═══════ MODAL SUPPRESSION ═══════ */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, unit: null })}
          title="Supprimer l'UE"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, unit: null })}>Annuler</Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer l'UE <strong>{deleteModal.unit?.name}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Les matières ne seront pas supprimées, elles seront juste détachées de l'UE.
          </p>
        </Modal>
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function UnitCard({ unit, expanded, onToggle, onEdit, onDelete, onAddCourse, onRemoveCourse, onManageClasses, onRemoveClass }) {
  const semesterColor = SEMESTER_COLORS[unit.semester] || 'gray';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* En-tête */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={22} className="text-violet-600 dark:text-violet-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-300">
                {unit.code}
              </span>
              {unit.semester && (
                <Badge color={semesterColor}>Semestre {unit.semester}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-slate-100">
              {unit.name}
            </h3>
            {unit.description && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{unit.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="flex flex-wrap items-center gap-4 mt-4 ml-12 text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <BookOpen size={13} /> {unit.coursesCount || 0} matière(s)
          </span>
          <span className="flex items-center gap-1">
            <Award size={13} /> {unit.totalCredits || 0} crédits
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {unit.totalHours || 0}h
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon size={13} /> {unit.classesCount || 0} classe(s)
          </span>
        </div>
      </div>

      {/* Contenu détaillé */}
      {expanded && (
        <div className="p-5 space-y-5">
          {/* Matières */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen size={16} />
                Matières ({unit.courses?.length || 0})
              </h4>
              <Button size="sm" variant="outline" onClick={onAddCourse}>
                <Plus size={14} />
                Ajouter une matière
              </Button>
            </div>

            {unit.courses && unit.courses.length > 0 ? (
              <div className="space-y-2">
                {unit.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30 group"
                  >
                    <div
                      className="w-2 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: course.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 dark:text-slate-400">
                          {course.code}
                        </span>
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                          {course.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                      <span>{course.credits} cr.</span>
                      <span>{course.hours}h</span>
                      <span>Coef. {course.coefficient}</span>
                    </div>
                    <button
                      onClick={() => onRemoveCourse(course.id, course.title)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer de l'UE"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
                Aucune matière dans cette UE
              </p>
            )}
          </div>

          {/* Classes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <UsersIcon size={16} />
                Classes attribuées ({unit.classes?.length || 0})
              </h4>
              <Button size="sm" variant="outline" onClick={onManageClasses}>
                <Plus size={14} />
                Attribuer des classes
              </Button>
            </div>

            {unit.classes && unit.classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {unit.classes.map((cc) => (
                  <div
                    key={cc.id}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group"
                  >
                    <UsersIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      {cc.class.name}
                    </span>
                    <button
                      onClick={() => onRemoveClass(cc.classId, cc.class.name)}
                      className="p-0.5 text-emerald-700 hover:text-red-600 dark:text-emerald-400"
                      title="Retirer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
                Aucune classe attribuée
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}