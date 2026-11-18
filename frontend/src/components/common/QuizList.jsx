import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileQuestion, Play, Trash2, Eye, Clock,
  Award, Shield, CheckCircle2, Lock, Send, EyeOff,
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'emerald' },
  CLOSED: { label: 'Fermé', color: 'amber' },
  ARCHIVED: { label: 'Archivé', color: 'gray' },
};

export default function QuizList({ courseId, userRole, onQuizClick }) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN';

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}/quizzes`);
      setQuizzes(res.data.data || []);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchQuizzes();
  }, [courseId]);

  const handleDelete = async (quiz) => {
    if (!confirm(`Supprimer le quiz "${quiz.title}" ?`)) return;
    try {
      await api.delete(`/quizzes/${quiz.id}`);
      fetchQuizzes();
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };

  const handlePublish = async (quiz) => {
    if (!confirm(`Publier le quiz "${quiz.title}" ? Les étudiants pourront le passer.`)) return;
    try {
      await api.patch(`/quizzes/${quiz.id}/publish`);
      fetchQuizzes();
    } catch (err) {
      alert(err.userMessage || 'Erreur lors de la publication');
    }
  };

  const handleUnpublish = async (quiz) => {
    if (!confirm(`Remettre "${quiz.title}" en brouillon ?`)) return;
    try {
      await api.patch(`/quizzes/${quiz.id}/unpublish`);
      fetchQuizzes();
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };

  const handleStart = (quiz) => {
    navigate(`/quiz/${quiz.id}/runner`);
  };

  const handleView = (quiz) => {
    if (onQuizClick) onQuizClick(quiz);
    else navigate(`/quiz/${quiz.id}`);
  };

  if (loading) {
    return <Spinner className="py-8" />;
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600 dark:text-rose-400 p-4">{error}</p>
    );
  }

  if (quizzes.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Aucun quiz"
        description={
          isTeacher
            ? 'Générez votre premier quiz par IA depuis cette page'
            : "L'enseignant n'a pas encore publié de quiz"
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => {
        const statusConf = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.DRAFT;
        const questionCount = quiz._count?.questions || 0;
        const attemptCount = quiz._count?.attempts || 0;

        return (
          <div
            key={quiz.id}
            className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icône */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <FileQuestion size={22} className="text-white" />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 dark:text-slate-200 truncate">
                    {quiz.title}
                  </h4>
                  <Badge color={statusConf.color}>{statusConf.label}</Badge>
                </div>

                {quiz.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                {/* Méta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileQuestion size={12} />
                    {questionCount} question{questionCount > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {quiz.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={12} />
                    {quiz.passingScore}/20
                  </span>
                  {quiz.aiGenerated && (
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <Sparkles size={12} />
                      Généré par IA
                    </span>
                  )}
                  {quiz.detectTabSwitch && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Shield size={12} />
                      Anti-triche
                    </span>
                  )}
                  {isTeacher && attemptCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} />
                      {attemptCount} tentative{attemptCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              {isTeacher ? (
                <>
                  <button
                    onClick={() => handleView(quiz)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <Eye size={14} />
                    Voir les questions
                  </button>

                  {quiz.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(quiz)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Send size={14} />
                      Publier
                    </button>
                  )}

                  {quiz.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleUnpublish(quiz)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      <EyeOff size={14} />
                      Dépublier
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(quiz)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg ml-auto"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </>
              ) : (
                <>
                  {quiz.status === 'PUBLISHED' ? (
                    <button
                      onClick={() => handleStart(quiz)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-auto"
                    >
                      <Play size={14} />
                      Commencer le quiz
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 ml-auto">
                      <Lock size={12} />
                      Non publié
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}