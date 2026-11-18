import { useEffect, useState } from 'react';
import {
  BookOpen, Award, Calendar, ClipboardList, TrendingUp, Clock,
  Download, GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useHierarchy } from '../../contexts/HierarchyContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import QuickAction from '../../components/common/QuickAction';
import ActivityFeed from '../../components/common/ActivityFeed';
import CourseCardCompact from '../../components/common/CourseCardCompact';
import ProgressRing from '../../components/common/ProgressRing';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getLabel } = useHierarchy();
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
        // title={`Bonjour, ${user?.firstName}`}
        // subtitle={`Étudiant · ${user?.unit?.name || 'Aucune classe'}`}
        badge="Étudiant"
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
            subtitle="Cours de ma classe"
            color="green"
          />
          <StatCard
            icon={Award}
            label="Crédits"
            value={courses.reduce((s, c) => s + (c.credits || 0), 0)}
            subtitle="Total à valider"
            color="blue"
          />
          <StatCard
            icon={Calendar}
            label="Événements"
            value={events.length}
            subtitle="À venir"
            color="purple"
          />
          <StatCard
            icon={Clock}
            label="Heures"
            value={courses.reduce((s, c) => s + (c.hours || 0), 0)}
            subtitle="Volume horaire"
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
              <GraduationCap size={16} />
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Espace étudiant
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            Consultez vos cours et supports pédagogiques
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
            Accédez aux supports déposés par vos enseignants, consultez
            votre agenda et suivez votre progression académique.
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
                    title="Aucun cours disponible"
                    description="Vos cours apparaîtront ici une fois assignés par l'administrateur"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <CourseCardCompact
                      key={course.id}
                      course={course}
                      variant="student"
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
                  icon={Download}
                  label="Télécharger un support"
                  description="Documents de cours"
                  to="/courses"
                  color="green"
                />
                <QuickAction
                  icon={ClipboardList}
                  label="Consulter mes notes"
                  description="Résultats et évaluations"
                  to="/grades"
                  color="blue"
                />
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            {/* Progression */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Ma progression
              </h3>
              <div className="flex justify-center">
                <ProgressRing
                  value={courses.length}
                  max={Math.max(courses.length, 5)}
                  size={120}
                  strokeWidth={10}
                  color="#10b981"
                  label={`${courses.length} cours`}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">
                    Année académique
                  </span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">
                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>
            </div>

            <ActivityFeed
              events={events}
              title="Mon agenda"
              emptyMessage="Aucun événement à venir"
            />
          </div>
        </div>
        </div>
      </main>
    </>
  );
}