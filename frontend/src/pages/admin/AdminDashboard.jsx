import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Building2, DollarSign, GraduationCap,
  Activity, Plus, Upload, Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import QuickAction from '../../components/common/QuickAction';
import ActivityFeed from '../../components/common/ActivityFeed';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/calendar/upcoming?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setEvents(eventsRes.data.data);
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
        // subtitle="Vue d'ensemble de votre établissement"
        badge="Administrateur"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          {/* ═══════ INDICATEURS CLÉS ═══════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Étudiants actifs"
              value={stats?.students ?? 0}
              subtitle="Tous niveaux confondus"
              color="blue"
              link="/users"
            />
            <StatCard
              icon={GraduationCap}
              label="Enseignants"
              value={stats?.teachers ?? 0}
              subtitle="Personnel enseignant"
              color="green"
              link="/users"
            />
            <StatCard
              icon={Building2}
              label="Unités"
              value={stats?.units ?? 0}
              subtitle="Structure hiérarchique"
              color="purple"
              link="/institution"
            />
            <StatCard
              icon={DollarSign}
              label="Revenus"
              value={`${stats?.revenue ?? 0} Ar`}
              subtitle="Ce mois"
              color="yellow"
              link="/finance"
            />
          </div>

          {/* ═══════ ACTIONS PRINCIPALES ═══════ */}
          {/* <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Activity size={16} />
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Espace administrateur
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                  Gérez votre établissement en toute simplicité
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 max-w-2xl">
                  Configurez la structure, gérez les utilisateurs, créez des cours
                  et suivez l'activité de votre plateforme depuis un seul endroit.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 flex-shrink-0">
                <Link
                  to="/users"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Plus size={16} />
                  Ajouter un utilisateur
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <BookOpen size={16} />
                  Créer un cours
                </Link>
              </div>
            </div>
          </section> */}

          {/* ═══════ ACTIONS RAPIDES + ÉVÉNEMENTS ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Actions rapides (2/3) */}
            <div className="lg:col-span-2">
              <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                    Actions rapides
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Raccourcis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QuickAction
                    icon={Users}
                    label="Gérer les utilisateurs"
                    description="Étudiants, enseignants, personnel"
                    to="/users"
                    color="blue"
                  />
                  <QuickAction
                    icon={Upload}
                    label="Importer via Excel"
                    description="Ajout en masse d'utilisateurs"
                    to="/users"
                    color="green"
                  />
                  <QuickAction
                    icon={Building2}
                    label="Structure de l'établissement"
                    description="Facultés, départements, classes"
                    to="/institution"
                    color="purple"
                  />
                  <QuickAction
                    icon={Settings}
                    label="Configuration"
                    description="Paramètres de la plateforme"
                    to="/settings"
                    color="yellow"
                  />
                </div>
              </section>
            </div>

            {/* Prochains événements (1/3) */}
            <div className="lg:col-span-1">
              <ActivityFeed
                events={events}
                title="Prochains événements"
                emptyMessage="Aucun événement à venir"
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}