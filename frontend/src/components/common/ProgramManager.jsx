import { useEffect, useState } from 'react';
import { Plus, RefreshCw, BookOpen, Clock, Layers, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import ModuleCard from './ModuleCard';
import ModuleFormModal from './ModuleFormModal';
import LessonFormModal from './LessonFormModal';
import api from '../../services/api';

export default function ProgramManager({ courseId, userRole }) {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [moduleModal, setModuleModal] = useState({ open: false, module: null });
  const [lessonModal, setLessonModal] = useState({ open: false, moduleId: null, lesson: null });

  const canEdit = userRole === 'ADMIN' || userRole === 'TEACHER';

  const fetchProgram = async () => {
    setLoading(true);
    try {
      const [programRes, statsRes] = await Promise.all([
        api.get(`/programs/course/${courseId}`),
        api.get(`/programs/course/${courseId}/stats`),
      ]);
      setModules(programRes.data.data);
      setStats(statsRes.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [courseId]);

  // ═══ Module actions ═══
  const openCreateModule = () => {
    setModuleModal({ open: true, module: null });
  };

  const openEditModule = (module) => {
    setModuleModal({ open: true, module });
  };

  const handleDeleteModule = async (module) => {
    if (!confirm(`Supprimer le module "${module.title}" et ses ${module.lessons?.length || 0} leçon(s) ?`)) return;

    try {
      await api.delete(`/programs/module/${module.id}`);
      setSuccess('Module supprimé');
      await fetchProgram();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  // ═══ Lesson actions ═══
  const openCreateLesson = (module) => {
    setLessonModal({ open: true, moduleId: module.id, lesson: null });
  };

  const openEditLesson = (lesson) => {
    setLessonModal({ open: true, moduleId: lesson.moduleId, lesson });
  };

  const handleDeleteLesson = async (lesson) => {
    if (!confirm(`Supprimer la leçon "${lesson.title}" ?`)) return;

    try {
      await api.delete(`/programs/lesson/${lesson.id}`);
      setSuccess('Leçon supprimée');
      await fetchProgram();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  if (loading) {
    return <Spinner className="py-10" />;
  }

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Stats + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {stats && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Layers size={13} />
              {stats.modulesCount} module(s)
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={13} />
              {stats.lessonsCount} leçon(s)
            </span>
            {stats.totalDurationMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {Math.round(stats.totalDurationMinutes / 60)}h {stats.totalDurationMinutes % 60}min
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProgram}>
            <RefreshCw size={14} />
          </Button>
          {canEdit && (
            <Button size="sm" onClick={openCreateModule}>
              <Plus size={16} />
              Nouveau module
            </Button>
          )}
        </div>
      </div>

      {/* Liste des modules */}
      {modules.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Aucun module"
          description={canEdit
            ? "Commencez par créer un module pour structurer votre cours"
            : "Le programme du cours n'a pas encore été publié"
          }
          action={canEdit ? (
            <Button onClick={openCreateModule}>
              <Plus size={16} />
              Créer le premier module
            </Button>
          ) : null}
        />
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              canEdit={canEdit}
              onEdit={openEditModule}
              onDelete={handleDeleteModule}
              onAddLesson={openCreateLesson}
              onEditLesson={openEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ModuleFormModal
        isOpen={moduleModal.open}
        onClose={() => setModuleModal({ open: false, module: null })}
        onSuccess={() => {
          setSuccess(moduleModal.module ? 'Module modifié' : 'Module créé');
          fetchProgram();
          setTimeout(() => setSuccess(''), 3000);
        }}
        courseId={courseId}
        module={moduleModal.module}
      />

      <LessonFormModal
        isOpen={lessonModal.open}
        onClose={() => setLessonModal({ open: false, moduleId: null, lesson: null })}
        onSuccess={() => {
          setSuccess(lessonModal.lesson ? 'Leçon modifiée' : 'Leçon créée');
          fetchProgram();
          setTimeout(() => setSuccess(''), 3000);
        }}
        moduleId={lessonModal.moduleId}
        lesson={lessonModal.lesson}
      />
    </div>
  );
}