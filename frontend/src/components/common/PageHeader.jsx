// export default function PageHeader({ title, subtitle, action, badge }) {
//   return (
//     <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-6">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex-1">
//           {badge && (
//             <div className="mb-2">
//               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
//                 {badge}
//               </span>
//             </div>
//           )}
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
//             {title}
//           </h1>
//           {subtitle && (
//             <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
//               {subtitle}
//             </p>
//           )}
//         </div>
//         {action && <div className="flex items-center gap-2">{action}</div>}
//       </div>
//     </div>
//   );
// }






// import NotificationBell from './NotificationBell';
// import { Moon, Sun } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

// export default function PageHeader({ title, subtitle, action, badge }) {
//   const { toggleTheme, isDark } = useTheme();

//   return (
//     <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-6">
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex-1">
//           {badge && (
//             <div className="mb-2">
//               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
//                 {badge}
//               </span>
//             </div>
//           )}
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
//             {title}
//           </h1>
//           {subtitle && (
//             <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
//               {subtitle}
//             </p>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           {/* Bouton thème */}
//           <button
//             onClick={toggleTheme}
//             title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
//             className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
//           >
//             {isDark ? <Sun size={20} /> : <Moon size={20} />}
//           </button>

//           {/* Cloche de notifications */}
//           <NotificationBell />

//           {/* Action personnalisée */}
//           {action}
//         </div>
//       </div>
//     </div>
//   );
// }

import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLayout } from '../../contexts/LayoutContext';

export default function PageHeader({ title, subtitle, action, badge }) {
  const { toggleTheme, isDark } = useTheme();
  const { onMenuClick } = useLayout();

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        {/* Bouton menu mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg flex-shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex-1 min-w-0">
          {badge && (
            <div className="mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {badge}
              </span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-sm text-gray-500 dark:text-slate-400 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <NotificationBell />
          {action}
        </div>
      </div>
    </div>
  );
}