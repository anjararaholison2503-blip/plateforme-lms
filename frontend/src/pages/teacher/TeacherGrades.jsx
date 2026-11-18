import { useEffect, useState } from 'react';
import { BookOpen, Users, Search, Filter, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

export default function TeacherGrades() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, PASSED_EXAM, NOT_PASSED_EXAM

  useEffect(() => {
    api.get('/grades/teacher-courses')
      .then(res => setCourses(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const loadStudents = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const res = await api.get(`/grades/teacher-course/${course.id}`);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des étudiants
  const filteredStudents = students.filter(s => {
    const matchSearch = `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'PASSED_EXAM') return matchSearch && s.hasPassedExam;
    if (filterType === 'NOT_PASSED_EXAM') return matchSearch && !s.hasPassedExam;
    return matchSearch;
  });

  if (loading && !selectedCourse) return <Spinner className="py-20" />;

  return (
    <>
      <PageHeader 
        title={selectedCourse ? `Notes : ${selectedCourse.title}` : "Gestion des Notes"} 
        subtitle={selectedCourse ? "Liste des étudiants et résultats" : "Sélectionnez une matière pour voir les notes"}
        badge="Enseignant"
        action={
          selectedCourse && (
            <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-sm font-medium bg-white border px-4 py-2 rounded-lg hover:bg-gray-50">
              <ArrowLeft size={16} /> Retour aux matières
            </button>
          )
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        
        {/* VUE 1 : LISTE DES MATIÈRES */}
        {!selectedCourse ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {courses.map(course => (
              <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-6">{course.code}</p>
                <button 
                  onClick={() => loadStudents(course)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                >
                  <Users size={16} /> Voir les notes
                </button>
              </div>
            ))}
            {courses.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10">Vous n'enseignez dans aucun cours.</p>}
          </div>
        ) : (
          
          /* VUE 2 : TABLEAU DES ÉTUDIANTS ET NOTES */
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              
              {/* Barre de recherche et filtres */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50 dark:bg-slate-800/50">
                <div className="relative w-full sm:w-96">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm font-medium"
                  >
                    <option value="ALL">Tous les étudiants</option>
                    <option value="PASSED_EXAM">A passé l'examen</option>
                    <option value="NOT_PASSED_EXAM">N'a pas passé l'examen</option>
                  </select>
                </div>
              </div>

              {/* Tableau */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-slate-800 text-gray-500 text-sm border-b dark:border-slate-700">
                      <th className="p-4 font-medium">Matricule</th>
                      <th className="p-4 font-medium">Nom complet</th>
                      <th className="p-4 font-medium">Statut Examen</th>
                      <th className="p-4 font-medium text-right">Moyenne</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {loading ? (
                      <tr><td colSpan="4" className="p-8 text-center"><Spinner /></td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">Aucun étudiant trouvé.</td></tr>
                    ) : (
                      filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="p-4 text-sm font-mono text-gray-600">{student.matricule || '—'}</td>
                          <td className="p-4 text-sm font-medium text-gray-800 dark:text-slate-200">{student.firstName} {student.lastName}</td>
                          <td className="p-4">
                            {student.hasPassedExam ? (
                              <Badge color="emerald">A passé</Badge>
                            ) : (
                              <Badge color="rose">Non passé</Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {student.average ? (
                              <span className={`text-lg font-bold ${student.average >= 10 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {student.average} <span className="text-xs text-gray-400">/ 20</span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Aucune note</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}