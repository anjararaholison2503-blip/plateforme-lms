import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Edit, Trash2, Users as UsersIcon, Calendar,
  Award, Clock, Plus, UserPlus, X, Mail, UserMinus, CheckCircle2,
  Building2, GraduationCap, FolderOpen, Upload, Megaphone,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  formatDate, formatUserName, getInitials,
} from '../../utils/format';
import MaterialList from '../../components/common/MaterialList';
import MaterialUploadModal from '../../components/common/MaterialUploadModal';
import ProgramManager from '../../components/common/ProgramManager';
import AnnouncementManager from '../../components/common/AnnouncementManager';


const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'green' },
  ARCHIVED: { label: 'Archivé', color: 'yellow' },
};

const ENROLLMENT_STATUS = {
  ACTIVE: { label: 'Actif', color: 'green' },
  COMPLETED: { label: 'Terminé', color: 'blue' },
  DROPPED: { label: 'Abandonné', color: 'red' },
  PENDING: { label: 'En attente', color: 'yellow' },
};

export default function CourseDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Formulaires
  const [editForm, setEditForm] = useState({});
  const [teachersList, setTeachersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [teachingUnitsList, setTeachingUnitsList] = useState([]);

  const [teacherForm, setTeacherForm] = useState({ teacherId: '', role: 'MAIN' });
  const [classForm, setClassForm] = useState({ classId: '' });
  const [sessionForm, setSessionForm] = useState({
    name: '', code: '', academicYear: '2025-2026',
    startDate: '', endDate: '', capacity: 30, description: '',
  });
  const [enrollForm, setEnrollForm] = useState({ studentId: '' });

  const [saving, setSaving] = useState(false);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
      setEditForm({
        title: res.data.data.title,
        code: res.data.data.code,
        description: res.data.data.description || '',
        credits: res.data.data.credits,
        hours: res.data.data.hours,
        status: res.data.data.status,
        color: res.data.data.color || '#3B82F6',
        unitId: res.data.data.unitId || '',
        teachingUnitId: res.data.data.teachingUnitId || '',
        coefficient: res.data.data.coefficient || 1,
      });
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

 useEffect(() => {
  Promise.all([
    api.get('/users?role=TEACHER&limit=100').catch(() => ({ data: { data: [] } })),
    api.get('/institution/units').catch(() => ({ data: { data: [] } })),
    api.get('/teaching-units').catch(() => ({ data: { data: [] } })),
  ]).then(([teachersRes, unitsRes, tuRes]) => {
    setTeachersList(teachersRes.data.data || []);
    setUnitsList(unitsRes.data.data || []);
    setClassesList((unitsRes.data.data || []).filter((u) => u.type === 'CLASS'));
    setTeachingUnitsList(tuRes.data.data || []);
  });
}, []);

  // ═══════ ACTIONS COURS ═══════
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (payload.unitId === '') payload.unitId = null;
      if (payload.teachingUnitId === '') payload.teachingUnitId = null;
      payload.credits = parseInt(payload.credits) || 0;
      payload.hours = parseInt(payload.hours) || 0;
      payload.coefficient = parseInt(payload.coefficient) || 1;

      await api.put(`/courses/${id}`, payload);
      setSuccess('Cours mis à jour');
      setEditModalOpen(false);
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await api.delete(`/courses/${id}`);
      navigate('/courses');
    } catch (err) {
      setError(err.userMessage);
      setDeleteModalOpen(false);
    }
  };

  // ═══════ ACTIONS ENSEIGNANTS ═══════
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/courses/${id}/teachers`, {
        teacherId: parseInt(teacherForm.teacherId),
        role: teacherForm.role,
      });
      setSuccess('Enseignant ajouté');
      setTeacherModalOpen(false);
      setTeacherForm({ teacherId: '', role: 'MAIN' });
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!confirm('Retirer cet enseignant du cours ?')) return;
    try {
      await api.delete(`/courses/${id}/teachers/${teacherId}`);
      setSuccess('Enseignant retiré');
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══════ ACTIONS CLASSES ═══════
  const handleAddClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/courses/${id}/classes`, {
        classId: parseInt(classForm.classId),
      });
      setSuccess('Classe attribuée');
      setClassModalOpen(false);
      setClassForm({ classId: '' });
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!confirm('Retirer cette classe du cours ?')) return;
    try {
      await api.delete(`/courses/${id}/classes/${classId}`);
      setSuccess('Classe retirée');
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══════ ACTIONS SESSIONS ═══════
  const openCreateSession = () => {
    setEditingSession(null);
    setSessionForm({
      name: '', code: '', academicYear: '2025-2026',
      startDate: '', endDate: '', capacity: 30, description: '',
    });
    setSessionModalOpen(true);
  };

  const openEditSession = (session) => {
    setEditingSession(session);
    setSessionForm({
      name: session.name,
      code: session.code,
      academicYear: session.academicYear,
      startDate: session.startDate.slice(0, 16),
      endDate: session.endDate.slice(0, 16),
      capacity: session.capacity,
      description: session.description || '',
    });
    setSessionModalOpen(true);
  };

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...sessionForm,
        startDate: new Date(sessionForm.startDate).toISOString(),
        endDate: new Date(sessionForm.endDate).toISOString(),
        capacity: parseInt(sessionForm.capacity) || 30,
      };

      if (editingSession) {
        await api.put(`/courses/sessions/${editingSession.id}`, payload);
        setSuccess('Session modifiée');
      } else {
        await api.post(`/courses/${id}/sessions`, payload);
        setSuccess('Session créée');
      }
      setSessionModalOpen(false);
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (session) => {
    if (!confirm(`Supprimer la session "${session.name}" ?`)) return;
    try {
      await api.delete(`/courses/sessions/${session.id}`);
      setSuccess('Session supprimée');
      await fetchCourse();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══════ ACTIONS INSCRIPTIONS ═══════
  const openEnrollModal = async (session) => {
    setSelectedSession(session);
    setEnrollForm({ studentId: '' });
    setEnrollModalOpen(true);
    try {
      const res = await api.get('/users?role=STUDENT&limit=200');
      setStudentsList(res.data.data || []);
    } catch {
      setStudentsList([]);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(
        `/courses/sessions/${selectedSession.id}/enrollments`,
        { studentId: parseInt(enrollForm.studentId) }
      );
      setSuccess('Étudiant inscrit');
      await fetchCourse();
      const updatedCourse = await api.get(`/courses/${id}`);
      const updatedSession = updatedCourse.data.data.sessions.find(
        (s) => s.id === selectedSession.id
      );
      if (updatedSession) setSelectedSession(updatedSession);
      setEnrollForm({ studentId: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <PageHeader title="Cours introuvable" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Ce cours n\'existe pas'} />
          <Link to="/courses" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft size={16} /> Retour aux cours
            </Button>
          </Link>
        </main>
      </>
    );
  }

  const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;

  return (
    <>
      <PageHeader
        title={course.title}
        subtitle={`${course.code} · ${course.unit?.name || 'Aucune unité'}`}
        badge="Administrateur"
        action={
          <Link to="/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
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

        {/* Bandeau principal */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${course.color || '#4f46e5'}1a` }}
              >
                <BookOpen size={24} style={{ color: course.color || '#4f46e5' }} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {statusConf.label}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight mb-1">{course.title}</h1>
                {course.description && (
                  <p className="text-gray-500 dark:text-slate-400 text-sm max-w-2xl">{course.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox icon={Calendar} label="Sessions" value={course.sessions?.length || 0} color="blue" />
          <StatBox icon={UsersIcon} label="Inscrits" value={course.enrolledCount || 0} color="green" />
          <StatBox icon={Award} label="Crédits" value={course.credits} color="purple" />
          <StatBox icon={Clock} label="Heures" value={course.hours} color="yellow" />
        </div>

        {/* Enseignants */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap size={18} />
              Enseignants
            </h3>
            <Button size="sm" onClick={() => setTeacherModalOpen(true)}>
              <UserPlus size={14} />
              Ajouter
            </Button>
          </div>
          <div className="p-5">
            {course.teachers && course.teachers.length > 0 ? (
              <ul className="space-y-2">
                {course.teachers.map((ct) => (
                  <li
                    key={ct.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                      {getInitials(ct.teacher)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {formatUserName(ct.teacher)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{ct.teacher.email}</p>
                    </div>
                    <Badge color={ct.role === 'MAIN' ? 'blue' : 'gray'}>
                      {ct.role === 'MAIN' ? 'Principal' : 'Assistant'}
                    </Badge>
                    <button
                      onClick={() => handleRemoveTeacher(ct.teacherId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer"
                    >
                      <UserMinus size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={UsersIcon}
                title="Aucun enseignant"
                description="Ajoutez un enseignant à ce cours"
              />
            )}
          </div>
        </div>

        {/* Classes attribuées */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 size={18} />
              Classes attribuées
            </h3>
            <Button size="sm" onClick={() => setClassModalOpen(true)}>
              <Plus size={14} />
              Attribuer une classe
            </Button>
          </div>
          <div className="p-5">
            {course.classes && course.classes.length > 0 ? (
              <ul className="space-y-2">
                {course.classes.map((cc) => (
                  <li
                    key={cc.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <UsersIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {cc.class.name}
                      </p>
                      {cc.class.code && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                          {cc.class.code}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveClass(cc.classId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Building2}
                title="Aucune classe attribuée"
                description="Attribuez une classe pour que ses étudiants voient ce cours"
              />
            )}
          </div>
        </div>

{/* Annonces */}
<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
    <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
      <Megaphone size={18} />
      Annonces
    </h3>
  </div>
  <div className="p-5">
    <AnnouncementManager courseId={parseInt(id)} userRole="ADMIN" />
  </div>
</div>

{/* Programme / Syllabus */}
<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
  <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
    <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
      <BookOpen size={18} />
      Programme du cours
    </h3>
  </div>
  <div className="p-5">
    <ProgramManager courseId={parseInt(id)} userRole="ADMIN" />
  </div>
</div>


            {/* Supports pédagogiques */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <FolderOpen size={18} />
                Supports pédagogiques
              </h3>
              <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                <Upload size={14} />
                Déposer un support
              </Button>
            </div>
            <div className="p-5">
              <MaterialList
                courseId={parseInt(id)}
                userRole="ADMIN"
                onUploadClick={() => setUploadModalOpen(true)}
                onExtend={(material) => {
                  alert('Prolongation à venir');
                }}
                onDelete={async (material) => {
                  if (!confirm(`Supprimer "${material.title}" ?`)) return;
                  try {
                    await api.delete(`/materials/${material.id}`);
                    setRefreshKey((k) => k + 1);
                  } catch (err) {
                    alert(err.userMessage);
                  }
                }}
                refreshKey={refreshKey}
              />
            </div>
          </div>

{/* Modal d'upload */}
<MaterialUploadModal
  isOpen={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  courseId={parseInt(id)}
  onSuccess={() => {
    setRefreshKey((k) => k + 1);
    setSuccess('Support déposé avec succès');
    setTimeout(() => setSuccess(''), 3000);
  }}
/>

        {/* Sessions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={18} />
              Sessions
            </h3>
            <Button size="sm" onClick={openCreateSession}>
              <Plus size={14} />
              Nouvelle session
            </Button>
          </div>
          <div className="p-5">
            {course.sessions && course.sessions.length > 0 ? (
              <div className="space-y-3">
                {course.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 dark:text-slate-200">
                            {session.name}
                          </h4>
                          <Badge color="gray">{session.code}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                          <span>{session.academicYear}</span>
                          <span>•</span>
                          <span>{formatDate(session.startDate)} → {formatDate(session.endDate)}</span>
                          <span>•</span>
                          <span>{session._count?.enrollments || 0}/{session.capacity} inscrits</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditSession(session)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                          title="Modifier"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => openEnrollModal(session)}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <UsersIcon size={14} />
                      Gérer les inscriptions ({session._count?.enrollments || 0})
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Aucune session"
                description="Créez une session pour commencer à inscrire des étudiants"
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Modifier le cours"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>Annuler</Button>
              <Button onClick={handleUpdateCourse} loading={saving}>Enregistrer</Button>
            </>
          }
        >
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <Input label="Titre" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
            <Input label="Code" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Crédits" type="number" value={editForm.credits} onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })} />
              <Input label="Heures" type="number" value={editForm.hours} onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })} />
            </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Statut
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <Input
              label="Coefficient"
              type="number"
              min="1"
              max="10"
              value={editForm.coefficient}
              onChange={(e) => setEditForm({ ...editForm, coefficient: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Unité d'Enseignement
            </label>
            <select
              value={editForm.teachingUnitId}
              onChange={(e) => setEditForm({ ...editForm, teachingUnitId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
            >
              <option value="">— Aucune (matière indépendante) —</option>
              {teachingUnitsList.map((tu) => (
                <option key={tu.id} value={tu.id}>
                  [{tu.code}] {tu.name}
                </option>
              ))}
            </select>
          </div>
          </form>
        </Modal>

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Supprimer le cours"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
              <Button variant="danger" onClick={handleDeleteCourse}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer <strong>{course.title}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Action irréversible. Toutes les sessions seront supprimées.
          </p>
        </Modal>

        {/* Modal Ajouter Enseignant */}
        <Modal
          isOpen={teacherModalOpen}
          onClose={() => setTeacherModalOpen(false)}
          title="Ajouter un enseignant"
          footer={
            <>
              <Button variant="outline" onClick={() => setTeacherModalOpen(false)}>Annuler</Button>
              <Button onClick={handleAddTeacher} loading={saving}>Ajouter</Button>
            </>
          }
        >
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Enseignant</label>
              <select
                value={teacherForm.teacherId}
                onChange={(e) => setTeacherForm({ ...teacherForm, teacherId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                required
              >
                <option value="">— Sélectionner —</option>
                {teachersList
                  .filter((t) => !course.teachers?.some((ct) => ct.teacherId === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.email})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Rôle</label>
              <select
                value={teacherForm.role}
                onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
              >
                <option value="MAIN">Principal</option>
                <option value="ASSISTANT">Assistant</option>
              </select>
            </div>
          </form>
        </Modal>

        {/* Modal Attribuer Classe */}
        <Modal
          isOpen={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          title="Attribuer une classe"
          footer={
            <>
              <Button variant="outline" onClick={() => setClassModalOpen(false)}>Annuler</Button>
              <Button onClick={handleAddClass} loading={saving}>Attribuer</Button>
            </>
          }
        >
          <form onSubmit={handleAddClass} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Classe</label>
              <select
                value={classForm.classId}
                onChange={(e) => setClassForm({ classId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                required
              >
                <option value="">— Sélectionner —</option>
                {classesList
                  .filter((c) => !course.classes?.some((cc) => cc.classId === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </form>
        </Modal>

        {/* Modal Session */}
        <Modal
          isOpen={sessionModalOpen}
          onClose={() => setSessionModalOpen(false)}
          title={editingSession ? 'Modifier la session' : 'Nouvelle session'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setSessionModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmitSession} loading={saving}>
                {editingSession ? 'Enregistrer' : 'Créer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitSession} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom" value={sessionForm.name} onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })} required />
              <Input label="Code" value={sessionForm.code} onChange={(e) => setSessionForm({ ...sessionForm, code: e.target.value.toUpperCase() })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Année" value={sessionForm.academicYear} onChange={(e) => setSessionForm({ ...sessionForm, academicYear: e.target.value })} required />
              <Input label="Capacité" type="number" value={sessionForm.capacity} onChange={(e) => setSessionForm({ ...sessionForm, capacity: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Début" type="datetime-local" value={sessionForm.startDate} onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })} required />
              <Input label="Fin" type="datetime-local" value={sessionForm.endDate} onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
              />
            </div>
          </form>
        </Modal>

        {/* Modal Inscriptions */}
        <Modal
          isOpen={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          title={`Inscriptions — ${selectedSession?.name || ''}`}
          size="lg"
          footer={<Button variant="outline" onClick={() => setEnrollModalOpen(false)}>Fermer</Button>}
        >
          {selectedSession && (
            <EnrollmentManager
              session={selectedSession}
              studentsList={studentsList}
              enrollForm={enrollForm}
              setEnrollForm={setEnrollForm}
              onEnroll={handleEnrollStudent}
              saving={saving}
              onRefresh={async () => {
                const updatedCourse = await api.get(`/courses/${id}`);
                const updatedSession = updatedCourse.data.data.sessions.find(
                  (s) => s.id === selectedSession.id
                );
                if (updatedSession) setSelectedSession(updatedSession);
                await fetchCourse();
              }}
            />
          )}
        </Modal>
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════

function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function EnrollmentManager({ session, studentsList, enrollForm, setEnrollForm, onEnroll, saving, onRefresh }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/sessions/${session.id}/enrollments`);
      setEnrollments(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, [session.id]);

  const handleEnroll = async (e) => {
    await onEnroll(e);
    await fetchEnrollments();
  };

  const handleRemove = async (enrollmentId) => {
    if (!confirm('Retirer cet étudiant de la session ?')) return;
    try {
      await api.delete(`/courses/enrollments/${enrollmentId}`);
      await fetchEnrollments();
      await onRefresh();
    } catch (err) {
      alert(err.userMessage);
    }
  };

  const enrolledIds = enrollments.map((e) => e.studentId);
  const availableStudents = studentsList.filter((s) => !enrolledIds.includes(s.id));

  return (
    <div className="space-y-5">
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-sm font-medium text-primary-900 dark:text-primary-300 mb-2">
          Inscrire un étudiant
        </p>
        <form onSubmit={handleEnroll} className="flex gap-2">
          <select
            value={enrollForm.studentId}
            onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg"
            required
          >
            <option value="">— Sélectionner un étudiant —</option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.email})
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" loading={saving} disabled={!enrollForm.studentId}>
            <UserPlus size={14} />
            Inscrire
          </Button>
        </form>
      </div>

      {loading ? (
        <Spinner className="py-10" />
      ) : enrollments.length === 0 ? (
        <EmptyState icon={UsersIcon} title="Aucun étudiant inscrit" description="Ajoutez des étudiants à cette session" />
      ) : (
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
            {enrollments.map((enr) => (
              <li key={enr.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 group">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs">
                  {getInitials(enr.student)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                    {formatUserName(enr.student)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{enr.student.email}</p>
                </div>
                <Badge color={ENROLLMENT_STATUS[enr.status]?.color || 'gray'}>
                  {ENROLLMENT_STATUS[enr.status]?.label || enr.status}
                </Badge>
                <button
                  onClick={() => handleRemove(enr.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
