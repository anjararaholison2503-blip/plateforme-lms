import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2, Shield,
  FileQuestion, Send, Lock,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

export default function QuizRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, emit } = useSocket();
  const tabSwitchCount = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [warning, setWarning] = useState(null);
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // ═══ DÉMARRAGE DU QUIZ ═══
  useEffect(() => {
    const startAttempt = async () => {
      setLoading(true);
      try {
        const res = await api.post(`/quizzes/${id}/attempts/start`);
        const { attempt, quiz } = res.data.data;
        setAttempt(attempt);
        setQuiz(quiz);
        setQuestions(quiz.questions);
        setTimeLeft(quiz.duration * 60);

        if (socket) {
          socket.emit('quiz:start', { attemptId: attempt.id });
        }
      } catch (err) {
        setError(err.userMessage || err.message || 'Erreur au démarrage');
      } finally {
        setLoading(false);
      }
    };
    startAttempt();
  }, [id, socket]);

  // ═══ MINUTEUR ═══
  useEffect(() => {
    if (!timeLeft || locked || finished) return;
    if (timeLeft <= 0) {
      submitQuiz(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, locked, finished]);

  // ═══ SURVEILLANCE ANTI-TRICHE ═══
  useEffect(() => {
    if (!attempt || locked || finished) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;

        emit('quiz:tab-switch', {
          attemptId: attempt.id,
          count: tabSwitchCount.current,
          timestamp: new Date().toISOString(),
        });

        setWarning({
          count: tabSwitchCount.current,
          max: quiz.maxTabSwitches,
          message: `⚠️ Changement de fenêtre détecté (${tabSwitchCount.current}/${quiz.maxTabSwitches})`,
        });

        if (tabSwitchCount.current >= quiz.maxTabSwitches) {
          setLocked(true);
          emit('quiz:auto-submit', {
            attemptId: attempt.id,
            reason: 'TAB_SWITCH_LIMIT',
          });
          submitQuiz(true);
        }
      }
    };

    const handleQuestionChange = (data) => {
      if (!data.newQuestion) return;
      // Remplacer la question actuelle par la nouvelle
      setQuestions((prev) => {
        const copy = [...prev];
        copy[currentIdx] = data.newQuestion;
        return copy;
      });
      setWarning({
        count: tabSwitchCount.current,
        max: quiz.maxTabSwitches,
        message: `🔀 La question a été remplacée suite à une détection de triche`,
      });
    };

    const handleLocked = () => {
      setLocked(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (socket) {
      socket.on('quiz:question-changed', handleQuestionChange);
      socket.on('quiz:locked', handleLocked);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (socket) {
        socket.off('quiz:question-changed', handleQuestionChange);
        socket.off('quiz:locked', handleLocked);
      }
    };
  }, [socket, emit, attempt, quiz, locked, finished, currentIdx]);

  const submitQuiz = async (auto = false) => {
    if (submitting || finished) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: parseInt(qId),
          answer: ans,
        })),
      };
      const res = await api.post(`/attempts/${attempt.id}/submit`, payload);
      setFinished(res.data.data);
    } catch (err) {
      setError(err.userMessage || 'Erreur de soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ═══ ÉTATS DE CHARGEMENT / ERREUR ═══
  if (loading) {
    return (
      <>
        <PageHeader title="Chargement du quiz..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <>
        <PageHeader title="Erreur" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Impossible de charger le quiz'} />
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft size={16} /> Retour
          </Button>
        </main>
      </>
    );
  }

  // ═══ FIN DE QUIZ ═══
  if (finished) {
    const passed = finished.score >= (quiz.passingScore || 10);
    return (
      <>
        <PageHeader title="Quiz terminé" />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-slate-700">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                passed
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-rose-100 dark:bg-rose-900/30'
              }`}
            >
              {passed ? (
                <CheckCircle2 size={40} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={40} className="text-rose-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {passed ? '🎉 Réussi !' : '😔 Non validé'}
            </h2>
            <p className="text-4xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
              {Math.round(finished.score)}/20
            </p>
            {locked && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-sm text-rose-700 dark:text-rose-400">
                🔒 Quiz verrouillé suite à trop de changements de fenêtre. L'enseignant sera notifié.
              </div>
            )}
            <Button onClick={() => navigate(-1)} className="mt-4">
              Retour au cours
            </Button>
          </div>
        </main>
      </>
    );
  }

  // ═══ QUIZ VERROUILLÉ ═══
  if (locked) {
    return (
      <>
        <PageHeader title="Quiz verrouillé" />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-2xl mx-auto bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-8 text-center border border-rose-200 dark:border-rose-800">
            <Lock size={48} className="text-rose-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-rose-800 dark:text-rose-300">
              Quiz verrouillé
            </h2>
            <p className="text-rose-700 dark:text-rose-400 mt-2">
              Trop de changements de fenêtre détectés. Votre quiz a été soumis automatiquement.
            </p>
          </div>
        </main>
      </>
    );
  }

  // ═══ QUIZ EN COURS ═══
  const current = questions[currentIdx];
  if (!current) return null;

  return (
    <>
      <PageHeader
        title={quiz.title}
        subtitle={`Question ${currentIdx + 1}/${questions.length}`}
        badge="Quiz en cours"
        action={
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                timeLeft < 60
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                  : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {warning && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                {warning.message}
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                {warning.count}/{warning.max} avertissements. Au-delà, le quiz sera verrouillé.
              </p>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
              {currentIdx + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
              {current.type === 'MULTIPLE_CHOICE' ? 'QCM' :
               current.type === 'TRUE_FALSE' ? 'Vrai/Faux' :
               current.type === 'SHORT_ANSWER' ? 'Réponse courte' : 'Question'}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {current.points} point{current.points > 1 ? 's' : ''}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">
            {current.question}
          </h3>

          <div className="space-y-2">
            {(current.type === 'MULTIPLE_CHOICE' || current.type === 'TRUE_FALSE') && Array.isArray(current.options) ? (
              current.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    answers[current.id] === opt.text
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${current.id}`}
                    value={opt.text}
                    checked={answers[current.id] === opt.text}
                    onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-gray-800 dark:text-slate-200">{opt.text}</span>
                </label>
              ))
            ) : (
              <input
                type="text"
                value={answers[current.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                placeholder="Votre réponse..."
                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
            >
              <ArrowLeft size={16} /> Précédent
            </Button>

            {currentIdx < questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx(currentIdx + 1)}>
                Suivant
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (confirm('Terminer le quiz et soumettre vos réponses ?')) submitQuiz();
                }}
                disabled={submitting}
              >
                <Send size={16} />
                {submitting ? 'Envoi...' : 'Terminer le quiz'}
              </Button>
            )}
          </div>
        </div>

        {/* Info anti-triche */}
        <div className="max-w-3xl mx-auto mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Shield size={12} />
            Quiz sécurisé — Les changements de fenêtre sont détectés
          </p>
        </div>
      </main>
    </>
  );
}