import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FileText, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

export default function ExamBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Infos de l'examen
  const [examInfo, setExamInfo] = useState({
    title: '',
    description: '',
    duration: 60, // minutes
    passingScore: 10,
  });

  // Liste des questions (avec les nouveaux champs)
  const [questions, setQuestions] = useState([
    { 
      question: '', 
      type: 'SHORT_ANSWER', 
      options: ['', '', '', ''], 
      correctAnswer: '', 
      points: 1, 
      timeLimit: 30 // secondes par défaut
    }
  ]);

  // Gestion des questions
  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      question: '', 
      type: 'SHORT_ANSWER', 
      options: ['', '', '', ''], 
      correctAnswer: '', 
      points: 1, 
      timeLimit: 30 
    }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examInfo.title) return setError('Le titre est requis.');

    // Vérification basique
    for (const q of questions) {
      if (!q.question) return setError('Toutes les questions doivent avoir un texte.');
      if (q.type === 'SHORT_ANSWER' && !q.correctAnswer) return setError('La réponse attendue est requise pour les questions libres.');
      if (q.type === 'MULTIPLE_CHOICE' && !q.correctAnswer) return setError('Veuillez sélectionner la bonne réponse pour le QCM.');
      if (q.type === 'TRUE_FALSE' && !q.correctAnswer) return setError('Veuillez choisir Vrai ou Faux.');
    }

    setLoading(true);
    setError('');

    try {
      // 1. Créer l'examen
      const examRes = await api.post('/exams', {
        ...examInfo,
        courseId: parseInt(courseId),
      });
      const examId = examRes.data.data.id;

      // 2. Ajouter les questions une par une
      for (const q of questions) {
        const payload = {
          question: q.question,
          type: q.type,
          options: q.type === 'MULTIPLE_CHOICE' ? q.options : null,
          correctAnswer: q.correctAnswer,
          points: parseInt(q.points),
          timeLimit: parseInt(q.timeLimit),
        };
        
        await api.post(`/exams/${examId}/questions`, payload);
      }

      setSuccess('Examen créé avec succès !');
      setTimeout(() => {
        navigate(`/courses/${courseId}`); // Retour au cours
      }, 2000);

    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la création de l\'examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Créer un examen"
        subtitle="Configurez vos questions, le type et le temps alloué"
        badge="Enseignant"
        action={
          <Link to={`/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} /> Retour au cours
            </Button>
          </Link>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* INFOS EXAMEN */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> Informations générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Titre de l'examen</label>
                <input
                  type="text"
                  value={examInfo.title}
                  onChange={(e) => setExamInfo({ ...examInfo, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600"
                  placeholder="Ex: Examen de mi-parcours PHP"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Durée totale (minutes)</label>
                <input
                  type="number"
                  value={examInfo.duration}
                  onChange={(e) => setExamInfo({ ...examInfo, duration: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note de passage (sur 20)</label>
                <input
                  type="number"
                  value={examInfo.passingScore}
                  onChange={(e) => setExamInfo({ ...examInfo, passingScore: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">Q{index + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-4 pr-12">
                  {/* Texte de la question */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                      Énoncé de la question (Collez ici)
                    </label>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 text-sm font-medium"
                      placeholder="Ex: Quelle est la capitale de Madagascar ?"
                      required
                    />
                  </div>

                  {/* Type & Temps */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Type de question</label>
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm"
                      >
                        <option value="SHORT_ANSWER">Réponse libre (Texte)</option>
                        <option value="MULTIPLE_CHOICE">QCM (Choix multiple)</option>
                        <option value="TRUE_FALSE">Vrai ou Faux</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-500 uppercase flex items-center gap-1">
                        <Clock size={12}/> Temps (secondes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={q.timeLimit}
                        onChange={(e) => handleQuestionChange(index, 'timeLimit', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* Zone dynamique selon le type */}
                  {q.type === 'SHORT_ANSWER' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-400">
                        Réponse attendue
                      </label>
                      <textarea
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm"
                        placeholder="Antananarivo"
                      />
                    </div>
                  )}

                  {q.type === 'MULTIPLE_CHOICE' && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3">Options (Cochez la bonne réponse)</p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              checked={q.correctAnswer === opt && opt !== ''}
                              onChange={() => handleQuestionChange(index, 'correctAnswer', opt)}
                              className="w-4 h-4 text-indigo-600"
                              disabled={!opt}
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(index, i, e.target.value)}
                              placeholder={`Option ${i + 1}`}
                              className="flex-1 px-3 py-1.5 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.type === 'TRUE_FALSE' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-400">
                        Réponse correcte
                      </label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        className="w-full px-4 py-2 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm"
                      >
                        <option value="">-- Choisir --</option>
                        <option value="Vrai">Vrai</option>
                        <option value="Faux">Faux</option>
                      </select>
                    </div>
                  )}

                  <div className="w-32">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                      Barème (Points)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={q.points}
                      onChange={(e) => handleQuestionChange(index, 'points', e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BOUTONS D'ACTION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuestion}
              className="w-full sm:w-auto"
            >
              <Plus size={16} /> Ajouter une autre question
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto !bg-indigo-600"
            >
              <Save size={16} />
              {loading ? 'Enregistrement...' : 'Enregistrer l\'examen'}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}