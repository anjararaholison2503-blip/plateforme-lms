import {
  Pin, PinOff, Edit, Trash2, AlertTriangle, AlertCircle, Info,
  Clock, User, Calendar, MoreVertical, Eye,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../ui/Badge';

const PRIORITY_CONFIG = {
  NORMAL: {
    icon: Info,
    label: 'Normal',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  IMPORTANT: {
    icon: AlertCircle,
    label: 'Important',
    color: 'yellow',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  URGENT: {
    icon: AlertTriangle,
    label: 'Urgent',
    color: 'red',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
  },
};

export default function AnnouncementCard({
  announcement,
  userRole,
  onEdit,
  onDelete,
  onTogglePin,
  onView,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = PRIORITY_CONFIG[announcement.priority] || PRIORITY_CONFIG.NORMAL;
  const Icon = config.icon;

  const canEdit = userRole === 'ADMIN' || userRole === 'TEACHER';

  // Détection d'expiration
  const isExpired = announcement.expiresAt
    ? new Date(announcement.expiresAt) < new Date()
    : false;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;

    return formatDate(date);
  };

  return (
    <div
      className={`
        rounded-2xl border-2 overflow-hidden transition-all
        ${announcement.isPinned ? 'shadow-md ring-2 ring-violet-200 dark:ring-violet-900' : ''}
        ${isExpired ? 'opacity-60' : ''}
        ${config.border} ${config.bg}
      `}
    >
      {/* Bandeau épinglée */}
      {announcement.isPinned && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-1.5 flex items-center gap-2 text-xs font-medium">
          <Pin size={12} />
          Annonce épinglée
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={config.text} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={config.color}>{config.label}</Badge>
              {isExpired && <Badge color="gray">Expirée</Badge>}
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-slate-100">
              {announcement.title}
            </h3>
          </div>

          {/* Menu actions */}
          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-gray-400 hover:bg-white/60 dark:hover:bg-slate-700/60 rounded-lg"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-1">
                    <button
                      onClick={() => { onTogglePin(announcement); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                    >
                      {announcement.isPinned ? (
                        <>
                          <PinOff size={14} /> Désépingler
                        </>
                      ) : (
                        <>
                          <Pin size={14} /> Épingler
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { onEdit(announcement); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                    >
                      <Edit size={14} /> Modifier
                    </button>
                    <hr className="my-1 border-gray-100 dark:border-slate-600" />
                    <button
                      onClick={() => { onDelete(announcement); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
          <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
            {announcement.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400 pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
          <span className="flex items-center gap-1">
            <User size={12} />
            {announcement.author?.firstName} {announcement.author?.lastName}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {getRelativeTime(announcement.createdAt)}
          </span>
          {announcement.expiresAt && (
            <span className="flex items-center gap-1 ml-auto">
              <Calendar size={12} />
              Expire le {formatDate(announcement.expiresAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}