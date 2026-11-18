import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import TeacherDashboard from '../teacher/TeacherDashboard';
import StudentDashboard from '../student/StudentDashboard';
import Spinner from '../../components/ui/Spinner';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  // Redirection selon le rôle
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'ACCOUNTANT':
      // Pour l'instant, on réutilise l'admin dashboard
      return <AdminDashboard />;
    case 'PARENT':
      // À créer plus tard
      return <StudentDashboard />;
    default:
      return <AdminDashboard />;
  }
}





// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Users, BookOpen, Building2, DollarSign, TrendingUp,
//   Calendar, ArrowRight, Clock, AlertCircle,
// } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import Header from '../../components/layout/Header';
// import Card from '../../components/ui/Card';
// import Spinner from '../../components/ui/Spinner';
// import Alert from '../../components/ui/Alert';
// import Badge from '../../components/ui/Badge';
// import EmptyState from '../../components/ui/EmptyState';
// import api from '../../services/api';
// import { formatDate, formatDateTime } from '../../utils/format';

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [statsRes, eventsRes] = await Promise.all([
//           api.get('/dashboard/stats'),
//           api.get('/calendar/upcoming?limit=5'),
//         ]);
//         setStats(statsRes.data.data);
//         setEvents(eventsRes.data.data);
//       } catch (err) {
//         setError(err.userMessage);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const statCards = [
//     { label: 'Étudiants', value: stats?.students ?? 0, icon: Users, color: 'bg-blue-500', link: '/users' },
//     { label: 'Enseignants', value: stats?.teachers ?? 0, icon: BookOpen, color: 'bg-green-500', link: '/users' },
//     { label: 'Unités', value: stats?.units ?? 0, icon: Building2, color: 'bg-purple-500', link: '/institution' },
//     { label: 'Revenus', value: `${stats?.revenue ?? 0} Ar`, icon: DollarSign, color: 'bg-yellow-500', link: '/finance' },
//   ];

//   const eventTypeColor = {
//     COURSE: 'blue', EXAM: 'red', HOLIDAY: 'green',
//     MEETING: 'purple', DEADLINE: 'yellow', OTHER: 'gray',
//   };

//   return (
//     <>
//       <Header
//         title={`Bonjour, ${user?.firstName} 👋`}
//         subtitle="Voici un aperçu de votre plateforme"
//       />

//       <main className="flex-1 overflow-y-auto p-8">
//         {error && <Alert type="error" message={error} className="mb-6" />}

//         {loading ? (
//           <Spinner className="py-20" />
//         ) : (
//           <>
//             {/* Statistiques */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//               {statCards.map((stat) => (
//                 <Link to={stat.link} key={stat.label}>
//                   <Card className="hover:shadow-md transition-shadow cursor-pointer">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
//                         <p className="text-2xl font-bold text-gray-800 dark:text-slate-100 mt-1">
//                           {stat.value}
//                         </p>
//                       </div>
//                       <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
//                         <stat.icon size={22} className="text-white" />
//                       </div>
//                     </div>
//                   </Card>
//                 </Link>
//               ))}
//             </div>

//             {/* Grille principale */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//               {/* Activité récente / Bienvenue */}
//               <Card title="Bienvenue sur votre plateforme" className="lg:col-span-2">
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                     <TrendingUp size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">
//                         Votre plateforme est opérationnelle
//                       </p>
//                       <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
//                         Commencez par configurer la structure de votre établissement, puis ajoutez
//                         des utilisateurs, des cours et des événements.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <Link
//                       to="/institution"
//                       className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                     >
//                       <Building2 size={18} className="text-purple-600" />
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
//                           Structure
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-slate-400">
//                           Gérer les unités
//                         </p>
//                       </div>
//                       <ArrowRight size={16} className="text-gray-400" />
//                     </Link>

//                     <Link
//                       to="/calendar"
//                       className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                     >
//                       <Calendar size={18} className="text-blue-600" />
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
//                           Agenda
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-slate-400">
//                           Voir les événements
//                         </p>
//                       </div>
//                       <ArrowRight size={16} className="text-gray-400" />
//                     </Link>

//                     <Link
//                       to="/users"
//                       className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                     >
//                       <Users size={18} className="text-green-600" />
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
//                           Utilisateurs
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-slate-400">
//                           Étudiants, enseignants
//                         </p>
//                       </div>
//                       <ArrowRight size={16} className="text-gray-400" />
//                     </Link>

//                     <Link
//                       to="/finance"
//                       className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
//                     >
//                       <DollarSign size={18} className="text-yellow-600" />
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
//                           Finances
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-slate-400">
//                           Frais & paiements
//                         </p>
//                       </div>
//                       <ArrowRight size={16} className="text-gray-400" />
//                     </Link>
//                   </div>
//                 </div>
//               </Card>

//               {/* Événements à venir */}
//               <Card
//                 title="Événements à venir"
//                 action={
//                   <Link
//                     to="/calendar"
//                     className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
//                   >
//                     Voir tout
//                   </Link>
//                 }
//               >
//                 {events.length === 0 ? (
//                   <EmptyState
//                     icon={Calendar}
//                     title="Aucun événement"
//                     description="Créez votre premier événement dans l'agenda"
//                   />
//                 ) : (
//                   <ul className="space-y-3">
//                     {events.map((event) => (
//                       <li key={event.id} className="flex items-start gap-3">
//                         <div
//                           className="w-1 h-10 rounded-full flex-shrink-0"
//                           style={{ backgroundColor: event.color || '#3B82F6' }}
//                         />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
//                             {event.title}
//                           </p>
//                           <div className="flex items-center gap-2 mt-0.5">
//                             <Clock size={12} className="text-gray-400" />
//                             <p className="text-xs text-gray-500 dark:text-slate-400">
//                               {formatDate(event.startDate)}
//                             </p>
//                             <Badge color={eventTypeColor[event.type]}>
//                               {event.type}
//                             </Badge>
//                           </div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </Card>
//             </div>
//           </>
//         )}
//       </main>
//     </>
//   );
// }