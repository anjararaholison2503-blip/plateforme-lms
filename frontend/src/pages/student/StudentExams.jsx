import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, Play, BookOpen } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/exams/my-exams')
      .then(res => setExams(res.data.data || []))
      .catch(err => setError(err.userMessage || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Spinner size={40} /></div>;

  return (
    <>
      <PageHeader 
        title="Mes Examens" 
        subtitle="Retrouvez ici tous les examens en ligne de vos cours"
        badge="Étudiant"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <Alert type="error" message={error} className="mb-4" />}

        {exams.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-700">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Aucun examen disponible</h3>
            <p className="text-gray-500 dark:text-slate-400">Vous n'avez pas d'examen à passer pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => {
              const attempt = exam.attempts[0]; // Si l'étudiant a déjà passé l'examen
              const isDone = !!attempt;

              return (
                <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                      <FileText size={24} />
                    </div>
                    {isDone ? (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Terminé
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        À passer
                      </span>
                    )}
                  </div>

                  <div className="flex-1 mb-4">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1 flex items-center gap-1">
                      <BookOpen size={12} /> {exam.course.code} - {exam.course.title}
                    </p>
                    <h4 className="font-bold text-gray-800 dark:text-slate-100 text-lg leading-tight mb-2">
                      {exam.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration} min</span>
                      <span>{exam._count.questions} question(s)</span>
                    </div>
                  </div>

                  {isDone ? (
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700 text-center">
                      <p className="text-sm text-gray-500 mb-1">Votre note</p>
                      <p className="text-2xl font-bold text-emerald-600">{attempt.score} / 20</p>
                    </div>
                  ) : (
                    <Link
                      to={`/exam/${exam.id}/runner`}
                      className="w-full py-2.5 bg-indigo-600 text-white text-center rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={16} /> Passer l'examen
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}