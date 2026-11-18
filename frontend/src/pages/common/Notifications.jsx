import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Filter, RefreshCw, AlertTriangle, Check,
  Trash2, FileText, UserPlus, Award, Calendar,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useNotifications } from '../../contexts/NotificationContext';

const TYPE_CONFIG = {
  MATERIAL_EXPIRING: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Expiration' },
  MATERIAL_EXPIRING_URGENT: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Urgent' },
  MATERIAL_EXPIRED: { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Expiré' },
  MATERIAL_EXTENDED: { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Prolongé' },
  MATERIAL_DELETED: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Supprimé' },
  COURSE_ANNOUNCEMENT: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Annonce' },
  GRADE_PUBLISHED: { icon: Award, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'Note' },
  ENROLLMENT: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Inscription' },
  SYSTEM: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Système' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all | unread

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.readAt)
    : notifications;

  const handleClick = async (notif) => {
    if (!notif.readAt) await markAsRead(notif.id);
    if (notif.material?.course?.id) {
      navigate(`/courses/${notif.material.course.id}`);
    } else if (notif.data?.courseId) {
      navigate(`/courses/${notif.data.courseId}`);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Tout est à jour'}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw size={14} />
            </Button>
            {unreadCount > 0 && (
              <Button size="sm" onClick={markAllAsRead}>
                <CheckCheck size={14} />
                Tout marquer lu
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {/* Filtres */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>

        {/* Liste */}
        {loading && notifications.length === 0 ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={Bell}
              title={filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              description={filter === 'unread' ? 'Tout est à jour !' : 'Vos notifications apparaîtront ici'}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
              const Icon = config.icon;
              const isUnread = !notif.readAt;

              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`
                    w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md
                    ${isUnread
                      ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={config.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className={`text-sm text-gray-800 dark:text-slate-200 ${isUnread ? 'font-semibold' : ''}`}>
                        {notif.title}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {notif.message}
                      </p>

                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}