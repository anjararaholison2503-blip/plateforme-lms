import { useEffect, useState } from 'react';
import {
  BookOpen, Users, ClipboardList, Calendar, Upload, Plus,
  TrendingUp, Award, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import QuickAction from '../../components/common/QuickAction';
import ActivityFeed from '../../components/common/ActivityFeed';
import CourseCardCompact from '../../components/common/CourseCardCompact';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, eventsRes] = await Promise.all([
          api.get('/courses?limit=6'),
          api.get('/calendar/upcoming?limit=5'),
        ]);
        setCourses(coursesRes.data.data || []);
        setEvents(eventsRes.data.data || []);
      } catch (err) {
        setError(err.userMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.enrolledCount || 0),
    0
  );
  const totalSessions = courses.reduce(
    (sum, c) => sum + (c._count?.sessions || 0),
    0
  );

  if (loading) {
    return (
      <>
        <PageHeader title="Tableau de bord" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Bonjour, ${user?.firstName}`}
        subtitle="Votre espace enseignant"
        badge="Enseignant"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* ═══════ INDICATEURS CLÉS ═══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Mes cours"
            value={courses.length}
            subtitle="Cours assignés"
            color="blue"
          />
          <StatCard
            icon={Users}
            label="Mes étudiants"
            value={totalStudents}
            subtitle="Total inscrits"
            color="green"
          />
          <StatCard
            icon={Calendar}
            label="Sessions actives"
            value={totalSessions}
            subtitle="En cours"
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Crédits enseignés"
            value={courses.reduce((s, c) => s + (c.credits || 0), 0)}
            subtitle="Total crédits"
            color="yellow"
          />
        </div>

        {/* ═══════ GRILLE ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-5">
        {/* ═══════ ACTIONS PRINCIPALES ═══════ */}
        {/* <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <BookOpen size={16} />
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Espace enseignant
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            Partagez vos supports et suivez vos étudiants
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Déposez vos cours, exercices et corrigés. Suivez la progression
            de vos étudiants et consultez les inscriptions à vos sessions.
          </p>
        </section> */}

            {/* Mes cours */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  Mes cours
                </h3>
                <Link
                  to="/courses"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Voir tous →
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                  <EmptyState
                    icon={BookOpen}
                    title="Aucun cours assigné"
                    description="L'administrateur vous assignera des cours prochainement"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <CourseCardCompact
                      key={course.id}
                      course={course}
                      variant="teacher"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Actions rapides
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <QuickAction
                  icon={Upload}
                  label="Déposer un support"
                  description="PDF, vidéo, document"
                  to="/courses"
                  color="blue"
                />
                <QuickAction
                  icon={ClipboardList}
                  label="Saisir des notes"
                  description="Évaluer mes étudiants"
                  to="/grades"
                  color="green"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            <ActivityFeed
              events={events}
              title="Mon agenda"
              emptyMessage="Aucun événement"
            />

            {/* Info card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Clock size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Temps d'enseignement
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-slate-100">
                    {courses.reduce((s, c) => s + (c.hours || 0), 0)}h
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Total des heures sur vos cours assignés
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </>
  );
}