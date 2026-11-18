import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, BookOpen, ClipboardList,
  DollarSign, Settings, LogOut, GraduationCap, Calendar, Layers,
  UserPlus, X, CreditCard, FileText, Smartphone, Award, School, User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatform } from '../../contexts/PlatformContext';

const MENU_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/academic-years', icon: Calendar, label: 'Années académiques', roles: ['ADMIN'] },
      { to: '/institution', icon: Building2, label: 'Structure', roles: ['ADMIN'] },
      { to: '/teaching-units', icon: Layers, label: 'Unités d\'enseignement', roles: ['ADMIN'] },
      { to: '/admin/classes', icon: School, label: 'Classes', roles: ['ADMIN'] },
      { to: '/users', icon: Users, label: 'Utilisateurs', roles: ['ADMIN'] },
      { to: '/enrollments', icon: UserPlus, label: 'Inscriptions', roles: ['ADMIN'] },
    ],
  },
  {
    section: 'Pédagogie',
    items: [
      { to: '/courses', icon: BookOpen, label: 'Cours', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
      { to: '/grades', icon: ClipboardList, label: 'Notes', roles: ['ADMIN', 'TEACHER'] },
      { to: '/assignments', icon: ClipboardList, label: 'Devoirs', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
      { to: '/exams', icon: FileText, label: 'Examens', roles: ['STUDENT'] },
      { to: '/my-grades', icon: Award, label: 'Mes Notes', roles: ['STUDENT'] },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/finance', icon: DollarSign, label: 'Tableau de bord', roles: ['ADMIN', 'ACCOUNTANT'] },
      { to: '/finance/payments', icon: CreditCard, label: 'Paiements', roles: ['ADMIN', 'ACCOUNTANT'] },
      { to: '/my-invoices', icon: FileText, label: 'Mes factures', roles: ['STUDENT'] },
      { to: '/my-payments', icon: Smartphone, label: 'Payer en ligne', roles: ['STUDENT'] },
    ],
  },
  {
    section: 'Système',
    items: [
      { to: '/calendar', icon: Calendar, label: 'Agenda', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
      { to: '/settings', icon: Settings, label: 'Paramètres', roles: ['ADMIN'] },
      { to: '/profile', icon: User, label: 'Mon Profil', roles: ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'] },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { platform } = usePlatform();

  const isVisible = (roles) => {
    if (!roles || !Array.isArray(roles)) return false;
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-72 lg:w-64 xl:w-72 flex-shrink-0
          bg-white dark:bg-slate-800
          border-r border-gray-200 dark:border-slate-700
          flex flex-col h-screen
          fixed inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-slate-100 leading-tight">
                {platform?.platformName || 'MASTERCLASS'}
              </h1>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {platform?.description || 'LMS Platform'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {MENU_ITEMS.map((section) => {
            if (!section?.items || !Array.isArray(section.items)) return null;

            const visibleItems = section.items.filter((item) => isVisible(item?.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.section} className="mb-6">
                <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {section.section}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                            )}
                            <item.icon size={18} className="flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Utilisateur + Logout */}
        <div className="border-t border-gray-100 dark:border-slate-700 p-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.firstName?.[0] || '?'}{user?.lastName?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}