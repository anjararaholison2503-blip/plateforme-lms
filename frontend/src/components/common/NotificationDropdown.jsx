import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Trash2, Calendar, Package, AlertTriangle,
  FileText, UserPlus, Award,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import Spinner from '../ui/Spinner';

// ═══ Configuration des icônes par type ═══
const TYPE_CONFIG = {
  MATERIAL_EXPIRING: { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  MATERIAL_EXPIRING_URGENT: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  MATERIAL_EXPIRED: { icon: AlertTriangle, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  MATERIAL_EXTENDED: { icon: Check, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  MATERIAL_DELETED: { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  COURSE_ANNOUNCEMENT: { icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  GRADE_PUBLISHED: { icon: Award, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ENROLLMENT: { icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  SYSTEM: { icon: Bell, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
};

export default function NotificationDropdown({ onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (notif) => {
    // Marquer comme lue
    if (!notif.readAt) {
      await markAsRead(notif.id);
    }

    // Naviguer vers la ressource
    if (notif.material?.course?.id) {
      navigate(`/courses/${notif.material.course.id}`);
    } else if (notif.data?.courseId) {
      navigate(`/courses/${notif.data.courseId}`);
    }

    onClose();
  };

  const formatTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000); // secondes

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-slate-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck size={12} />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="max-h-96 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <Spinner className="py-10" />
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Aucune notification
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
              const Icon = config.icon;
              const isUnread = !notif.readAt;

              return (
                <li key={notif.id}>
                  <button
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors
                      ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={config.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium text-gray-800 dark:text-slate-200 line-clamp-1 ${isUnread ? 'font-semibold' : ''}`}>
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>

                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pied */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 dark:border-slate-700 p-2">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full text-center py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
}