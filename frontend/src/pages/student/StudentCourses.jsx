import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, RefreshCw, Calendar, Award, Eye,
  LayoutGrid, List, GraduationCap, FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'green' },
  ARCHIVED: { label: 'Archivé', color: 'yellow' },
};

export default function StudentCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const debouncedSearch = useDebounce(search, 400);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get('/courses', { params });
      setCourses(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <PageHeader
        title="Mes cours"
        subtitle={`Cours de ma classe : ${user?.unit?.name || 'L1-INFO-A'}`}
        badge="Étudiant"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <BookOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Mes cours
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {courses.length}
                </p>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Award size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Crédits
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {courses.reduce((s, c) => s + (c.credits || 0), 0)}
                </p>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <FileText size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Volume horaire
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                  {courses.reduce((s, c) => s + (c.hours || 0), 0)}h
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={fetchCourses}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <RefreshCw size={16} />
          </button>

          <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Liste des cours */}
        {loading ? (
          <Spinner className="py-20" />
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={BookOpen}
              title="Aucun cours disponible"
              description="Vos cours apparaîtront ici une fois assignés à votre classe"
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <StudentCourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <StudentCourseList
              courses={courses}
              onClick={(c) => navigate(`/courses/${c.id}`)}
            />
          </div>
        )}
      </main>
    </>
  );
}

function StudentCourseCard({ course, onClick }) {
  const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
    >
      <div className="h-2" style={{ backgroundColor: course.color || '#10b981' }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${course.color || '#10b981'}20` }}
          >
            <BookOpen
              size={22}
              style={{ color: course.color || '#10b981' }}
              strokeWidth={2.5}
            />
          </div>
          <Badge color={statusConf.color}>{statusConf.label}</Badge>
        </div>

        <div className="mb-2">
          <span className="text-xs font-mono text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            {course.code}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {course._count?.sessions || 0} session(s)
          </span>
          {course.credits > 0 && (
            <span className="ml-auto flex items-center gap-1 text-gray-400">
              <Award size={12} /> {course.credits} cr.
            </span>
          )}
        </div>

        {/* Indicateur lecture seule */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <Eye size={12} />
            <span className="font-medium">Consultation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentCourseList({ courses, onClick }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Cours</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Statut</th>
          <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Sessions</th>
          <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Crédits</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => {
          const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
          return (
            <tr
              key={course.id}
              onClick={() => onClick(course)}
              className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: course.color || '#10b981' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{course.code}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge color={statusConf.color}>{statusConf.label}</Badge>
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-slate-300">
                {course._count?.sessions || 0}
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-700 dark:text-slate-300">
                {course.credits || 0}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}