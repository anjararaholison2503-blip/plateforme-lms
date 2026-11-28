import { Menu, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLayout } from '../../contexts/LayoutContext';
import NotificationBell from '../common/NotificationBell';

export default function Header({ title, subtitle, action }) {
  const { onMenuClick } = useLayout();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 ">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Bouton menu mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>

          {/* Titre */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-slate-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden sm:block text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Recherche desktop */}
            <div className="relative hidden lg:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 w-56 xl:w-72 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Recherche mobile */}
            <button className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <Search size={20} />
            </button>

            {/* Thème */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Action custom */}
            {action}
          </div>
        </div>
      </div>
    </header>
  );
}