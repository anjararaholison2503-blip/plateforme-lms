import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertTriangle, Camera, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

export default function ExamRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const tabSwitchCount = useRef(0);

  // États
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // Chronos
  const [globalTimeLeft, setGlobalTimeLeft] = useState(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0); 
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [warning, setWarning] = useState('');

  // 1. INITIALISATION (Chargement + Webcam + Anti-triche)
  useEffect(() => {
    const initExam = async () => {
      try {
        const res = await api.get(`/exams/${id}/take`);
        setExam(res.data.data);
        setGlobalTimeLeft(res.data.data.duration * 60);
        
        // Initialiser le chrono de la 1ère question avec la valeur de l'enseignant
        if (res.data.data.questions.length > 0) {
          setQuestionTimeLeft(res.data.data.questions[0].timeLimit || 60);
        }

        // Activer la Webcam
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(err.userMessage || err.response?.data?.message || "Impossible de charger l'examen");
      } finally {
        setLoading(false);
      }
    };
    initExam();

    // Détecteur de changement d'onglet
    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setWarning(`⚠️ Changement de fenêtre détecté (${tabSwitchCount.current}/3). Au 3ème, l'examen sera soumis !`);
        
        if (tabSwitchCount.current >= 3) {
          handleSubmit(true); // Soumission forcée
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [id]);

  // 2. CHRONO GLOBAL (Temps total de l'examen)
  useEffect(() => {
    if (!globalTimeLeft || result || submitting) return;
    if (globalTimeLeft <= 0) {
      handleSubmit(true); // Temps écoulé = note 0
      return;
    }
    const timer = setInterval(() => setGlobalTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [globalTimeLeft, result, submitting]);

  // 3. CHRONO PAR QUESTION (Passage automatique)
  useEffect(() => {
    if (!exam || result || submitting) return;
    
    if (questionTimeLeft <= 0) {
      // Temps de la question écoulé : on passe à la suivante
      if (currentQIndex < exam.questions.length - 1) {
        const nextIndex = currentQIndex + 1;
        setCurrentQIndex(nextIndex);
        // Reset avec le temps de la question SUIVANTE
        setQuestionTimeLeft(exam.questions[nextIndex].timeLimit || 60); 
      } else {
        handleSubmit(); // Fin de l'examen si c'était la dernière question
      }
      return;
    }
    
    const qTimer = setInterval(() => setQuestionTimeLeft(t => t - 1), 1000);
    return () => clearInterval(qTimer);
  }, [questionTimeLeft, currentQIndex, exam, result, submitting]);

  // 4. SOUMISSION
  const handleSubmit = async (isForced = false) => {
    if (submitting || result) return;
    
    if (!isForced && !confirm('Terminer l\'examen et soumettre vos réponses ?')) return;
    
    setSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId),
      answer: ans
    }));

    try {
      const res = await api.post(`/exams/${id}/submit`, { answers: formattedAnswers, timeout: isForced });
      setResult(res.data.data);
    } catch (err) {
      setError(err.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Spinner size={40} /></div>;
  if (error) return <div className="p-8 text-center text-rose-600 font-bold">{error}</div>;
  if (!exam || !exam.questions || exam.questions.length === 0) return <div className="p-8 text-center">Aucune question dans cet examen.</div>;

  // --- ÉCRAN DE RÉSULTAT ---
  if (result) {
    return (
      <>
        <PageHeader title="Examen terminé" />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-lg">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Examen soumis !</h2>
            <p className="text-gray-500 mb-6">Merci d'avoir répondu.</p>
            <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-6">
              <p className="text-sm text-gray-500 mb-1">Votre note</p>
              <p className="text-4xl font-bold text-indigo-600">{result.score}/20</p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full">Retour au tableau de bord</Button>
          </div>
        </main>
      </>
    );
  }

  const currentQuestion = exam.questions[currentQIndex];
  const totalTimeForQuestion = currentQuestion.timeLimit || 60;

  // --- ÉCRAN DE PASSAGE ---
  return (
    <>
      <PageHeader 
        title={exam.title} 
        subtitle={`Question ${currentQIndex + 1} sur ${exam.questions.length}`}
        action={
          <div className="flex items-center gap-4">
            {/* Webcam miniature */}
            <video ref={videoRef} autoPlay muted className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 bg-black shadow-md" />
            
            {/* Chrono Global */}
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-mono font-bold">
              <Clock size={18} /> {Math.floor(globalTimeLeft / 60)}:{(globalTimeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        }
      />
      
      <main className="flex-1 p-4 sm:p-8 bg-gray-50 dark:bg-slate-900 overflow-y-auto pb-20">
        <div className="max-w-3xl mx-auto">
          
          {warning && (
            <div className="mb-6 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl flex items-center gap-3 shadow-sm">
              <ShieldAlert size={20} /> {warning}
            </div>
          )}

          {/* Barre de temps de la question */}
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-600 dark:text-slate-400">Temps restant pour cette question :</span>
            <span className={`font-bold ${questionTimeLeft < 5 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
              {questionTimeLeft} sec
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ${questionTimeLeft < 5 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${(questionTimeLeft / totalTimeForQuestion) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-md">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-lg flex items-center justify-center flex-shrink-0">
                {currentQIndex + 1}
              </span>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-800 dark:text-slate-100">{currentQuestion.question}</p>
                <p className="text-sm text-gray-500 mt-2">{currentQuestion.points} point(s)</p>
              </div>
            </div>
            
            {/* ZONE DYNAMIQUE DE RÉPONSE */}
            <div className="mt-6">
              {/* 1. SI C'EST UN QCM */}
              {currentQuestion.type === 'MULTIPLE_CHOICE' && Array.isArray(currentQuestion.options) && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => (
                    <label key={i} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-indigo-300'}`}>
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        value={opt}
                        checked={answers[currentQuestion.id] === opt}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <span className="text-lg text-gray-800 dark:text-slate-200">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* 2. SI C'EST VRAI OU FAUX */}
              {currentQuestion.type === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-4">
                  {['Vrai', 'Faux'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [currentQuestion.id]: opt })}
                      className={`p-8 border-2 rounded-2xl text-2xl font-bold transition-all ${
                        answers[currentQuestion.id] === opt ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-emerald-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* 3. SI C'EST UNE RÉPONSE LIBRE */}
              {currentQuestion.type === 'SHORT_ANSWER' && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  placeholder="Écrivez votre réponse ici..."
                  className="w-full p-4 border-2 border-gray-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 text-base min-h-[120px] focus:border-indigo-500 focus:ring-0 outline-none"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Bouton de fin */}
          <div className="mt-8 flex justify-end">
            <Button onClick={() => handleSubmit(false)} disabled={submitting} className="!bg-emerald-600 !px-8 !py-3 text-lg">
              {submitting ? 'Correction...' : 'Terminer et soumettre'}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}