import MaterialList from '../../components/common/MaterialList';
import MaterialUploadModal from '../../components/common/MaterialUploadModal';
import QuizGenerator from './QuizGenerator';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users as UsersIcon, Calendar, Award, Clock,
  GraduationCap, Eye, Upload, FolderOpen, Megaphone, Sparkles, CheckCircle2, Plus, MessageSquare, 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import { formatDate, formatUserName, getInitials } from '../../utils/format';
import ProgramManager from '../../components/common/ProgramManager';
import AnnouncementManager from '../../components/common/AnnouncementManager';
import QuizList from '../../components/common/QuizList';
import ExamList from '../../components/common/ExamList';
import ForumManager from '../../components/common/ForumManager';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'green' },
  ARCHIVED: { label: 'Archivé', color: 'yellow' },
};

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [quizGeneratorOpen, setQuizGeneratorOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

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
              <ArrowLeft size={16} /> Retour
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
        badge="Enseignant"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizGeneratorOpen(true)}
              className="!bg-indigo-50 !text-indigo-700 !border-indigo-200 hover:!bg-indigo-100 dark:!bg-indigo-900/30 dark:!text-indigo-300"
            >
              <Sparkles size={16} />
              Générer un quiz IA
            </Button>
            <Link to="/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
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

        {/* Bandeau */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${course.color || '#4f46e5'}1a` }}
            >
              <BookOpen size={24} style={{ color: course.color || '#4f46e5' }} />
            </div>
            <div className="flex-1 min-w-0">
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
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox icon={Calendar} label="Sessions" value={course.sessions?.length || 0} color="blue" />
          <StatBox icon={UsersIcon} label="Étudiants" value={course.enrolledCount || 0} color="green" />
          <StatBox icon={Award} label="Crédits" value={course.credits} color="purple" />
          <StatBox icon={Clock} label="Heures" value={course.hours} color="yellow" />
        </div>

        {/* Annonces */}

        {/* Forum */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare size={18} /> Forum & Visioconférence
            </h3>
          </div>
          <div className="p-5">
            <ForumManager courseId={parseInt(id)} userRole="TEACHER" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Megaphone size={18} />
              Annonces
            </h3>
          </div>
          <div className="p-5">
            <AnnouncementManager courseId={parseInt(id)} userRole="TEACHER" />
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
            <ProgramManager courseId={parseInt(id)} userRole="TEACHER" />
          </div>
        </div>

        {/* Supports pédagogiques */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <FolderOpen size={18} />
              Supports pédagogiques
            </h3>
          </div>
          <div className="p-5">
            <MaterialList
              courseId={parseInt(id)}
              userRole="TEACHER"
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
              {/* ═══ QUIZ DU COURS ═══ */}
{/* ═══ EXAMENS DU COURS ═══ */}
<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
    <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
      <CheckCircle2 size={18} className="text-emerald-600" />
      Examens en ligne
    </h3>
    <Link
      to={`/courses/${id}/exams/create`}
      className="text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
    >
      <Plus size={14} /> Créer un examen
    </Link>
  </div>
<div className="p-5">
  <ExamList courseId={parseInt(id)} userRole="TEACHER" />
</div>
</div>


<div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
    <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
      <Sparkles size={18} className="text-indigo-600" />
      Quiz du cours
    </h3>
    <button
      onClick={() => setQuizGeneratorOpen(true)}
      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
    >
      <Sparkles size={14} />
      Générer un nouveau quiz
    </button>
  </div>
  <div className="p-5">
    <QuizList courseId={parseInt(id)} userRole="TEACHER" key={refreshKey} />
  </div>
</div>
        {/* Modal d'upload matériel */}
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

        {/* ═══ Modal Générateur de Quiz IA ═══ */}
        <QuizGenerator
          isOpen={quizGeneratorOpen}
          onClose={() => setQuizGeneratorOpen(false)}
          courseId={parseInt(id)}
onSuccess={() => {
  setSuccess('✨ Quiz en cours de generation. Revenez dans quelques secondes.');
  setRefreshKey((k) => k + 1);
  setTimeout(() => setSuccess(''), 5000);
}}
        />

        {/* Enseignants */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap size={18} />
              Enseignants du cours
            </h3>
          </div>
          <div className="p-5">
            {course.teachers && course.teachers.length > 0 ? (
              <ul className="space-y-2">
                {course.teachers.map((ct) => (
                  <li
                    key={ct.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30"
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
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={UsersIcon}
                title="Aucun enseignant"
                description="Vous êtes le seul enseignant de ce cours"
              />
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={18} />
              Sessions
            </h3>
          </div>
          <div className="p-5">
            {course.sessions && course.sessions.length > 0 ? (
              <div className="space-y-3">
                {course.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 dark:text-slate-200">
                        {session.name}
                      </h4>
                      <Badge color="gray">{session.code}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                      <span>{session.academicYear}</span>
                      <span>•</span>
                      <span>{formatDate(session.startDate)} → {formatDate(session.endDate)}</span>
                      <span>•</span>
                      <span>{session._count?.enrollments || 0}/{session.capacity} inscrits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Aucune session"
                description="L'administrateur n'a pas encore créé de session"
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

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