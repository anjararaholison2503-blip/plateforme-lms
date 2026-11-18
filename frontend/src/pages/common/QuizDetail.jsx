import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileQuestion, Sparkles, CheckCircle2, Clock, Award,
  Shield, Send, EyeOff, Trash2, AlertCircle, Lock,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'emerald' },
  CLOSED: { label: 'Fermé', color: 'amber' },
  ARCHIVED: { label: 'Archivé', color: 'gray' },
};

const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'QCM',
  TRUE_FALSE: 'Vrai/Faux',
  SHORT_ANSWER: 'Réponse courte',
  FILL_IN_BLANK: 'Texte à trous',
};

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuiz(); }, [id]);

  const handlePublish = async () => {
    if (!confirm(`Publier le quiz "${quiz.title}" ? Les étudiants pourront le passer.`)) return;
    try {
      await api.patch(`/quizzes/${quiz.id}/publish`);
      setSuccess('Quiz publié avec succès');
      fetchQuiz();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm(`Remettre "${quiz.title}" en brouillon ?`)) return;
    try {
      await api.patch(`/quizzes/${quiz.id}/unpublish`);
      setSuccess('Quiz remis en brouillon');
      fetchQuiz();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement "${quiz.title}" ?`)) return;
    try {
      await api.delete(`/quizzes/${quiz.id}`);
      navigate(-1);
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };

  const handleStart = () => {
    navigate(`/quiz/${quiz.id}/runner`);
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

  if (error || !quiz) {
    return (
      <>
        <PageHeader title="Quiz introuvable" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Ce quiz n\'existe pas'} />
          <Link to="/courses" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft size={16} /> Retour
            </Button>
          </Link>
        </main>
      </>
    );
  }

  const statusConf = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.DRAFT;
  const questions = quiz.questions || [];

  return (
    <>
      <PageHeader
        title={quiz.title}
        subtitle={`${questions.length} question${questions.length > 1 ? 's' : ''} · ${quiz.duration} min · Note de passage : ${quiz.passingScore}/20`}
        badge={isTeacher ? 'Enseignant' : 'Quiz'}
        action={
          <div className="flex items-center gap-2">
            {isTeacher && quiz.status === 'DRAFT' && (
              <Button size="sm" onClick={handlePublish} className="!bg-emerald-600">
                <Send size={16} /> Publier
              </Button>
            )}
            {isTeacher && quiz.status === 'PUBLISHED' && (
              <Button size="sm" variant="outline" onClick={handleUnpublish}>
                <EyeOff size={16} /> Dépublier
              </Button>
            )}
            {!isTeacher && quiz.status === 'PUBLISHED' && (
              <Button size="sm" onClick={handleStart}>
                <Send size={16} /> Commencer
              </Button>
            )}
            <Link to="/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} /> Retour
              </Button>
            </Link>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        {/* Bandeau d'infos */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Badge color={statusConf.color}>{statusConf.label}</Badge>
            {quiz.aiGenerated && (
              <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                <Sparkles size={14} /> Généré par IA
              </span>
            )}
            {quiz.detectTabSwitch && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Shield size={14} /> Anti-triche activé
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Clock size={14} /> {quiz.duration} minutes
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <Award size={14} /> Note de passage : {quiz.passingScore}/20
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <AlertCircle size={14} /> Max tentatives : {quiz.maxAttempts}
            </span>
          </div>

          {quiz.description && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-4">
              {quiz.description}
            </p>
          )}

          {isTeacher && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleDelete} className="!text-rose-600">
                <Trash2 size={14} /> Supprimer le quiz
              </Button>
            </div>
          )}
        </div>

        {/* Liste des questions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <FileQuestion size={18} />
            Questions ({questions.length})
          </h3>

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-gray-300 dark:text-slate-600 mb-2" size={48} />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Aucune question générée. L'IA est peut-être encore en train de travailler.
              </p>
              <Button size="sm" variant="outline" onClick={fetchQuiz} className="mt-3">
                Rafraîchir
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-300">
                          {TYPE_LABELS[q.type] || q.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {q.points} point{q.points > 1 ? 's' : ''}
                        </span>
                        {q.difficulty && (
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            · {q.difficulty}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">
                        {q.question}
                      </p>

                      {/* Options QCM */}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="space-y-1.5">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-gray-50 dark:bg-slate-700/40 text-gray-600 dark:text-slate-400'
                              }`}
                            >
                              {opt.isCorrect ? (
                                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-slate-600 flex-shrink-0" />
                              )}
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Réponse courte */}
                      {q.correctAnswer && !Array.isArray(q.options) && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-800 dark:text-emerald-300">
                          <span className="font-medium">Réponse :</span> {q.correctAnswer}
                        </div>
                      )}

                      {/* Explication */}
                      {q.explanation && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 italic">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}