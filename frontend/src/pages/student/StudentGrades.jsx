import { useEffect, useState } from 'react';
import { BookOpen, Award, ChevronRight, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

export default function StudentGrades() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pour le modal de détails
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    api.get('/grades/me')
      .then(res => setCourses(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openDetails = async (course) => {
    setSelectedCourse(course);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/grades/course/${course.courseId}`);
      setDetails(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <>
      <PageHeader title="Mes Notes" subtitle="Consultez vos résultats par matière" badge="Étudiant" />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Mes matières</h3>
            </div>
            
            {courses.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Aucune note disponible pour le moment.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {courses.map((c) => (
                  <button
                    key={c.courseId}
                    onClick={() => openDetails(c)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-slate-100">{c.courseTitle}</p>
                        <p className="text-sm text-gray-500">{c.courseCode} · {c.totalEvaluations} évaluation(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${c.average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {c.average} <span className="text-sm font-normal text-gray-400">/ 20</span>
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DÉTAILS */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-bold">{selectedCourse.courseTitle}</h3>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-rose-500"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? <Spinner /> : details.length === 0 ? <p className="text-center text-gray-500">Aucun détail disponible.</p> : (
                <div className="space-y-3">
                  {details.map(d => {
                    const noteSur20 = (Number(d.score) / d.max) * 20;
                    return (
                      <div key={d.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-slate-200">{d.title}</p>
                          <p className="text-xs text-gray-500">{d.type} · {new Date(d.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <p className={`font-bold ${noteSur20 >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {noteSur20.toFixed(2)} / 20
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}