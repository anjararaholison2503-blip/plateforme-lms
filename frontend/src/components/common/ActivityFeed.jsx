import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';

export default function ActivityFeed({
  events = [],
  title = 'Activité récente',
  emptyMessage = 'Aucune activité récente',
  showSeeAll = true,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100">
          {title}
        </h3>
        {showSeeAll && (
          <Link
            to="/calendar"
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Voir tout
          </Link>
        )}
      </div>

      <div className="p-3">
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title={emptyMessage}
            description="Créez un événement dans l'agenda"
          />
        ) : (
          <ul className="space-y-1">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(event.startDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}