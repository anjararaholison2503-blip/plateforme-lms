import { useEffect, useState } from 'react';
import {
  Megaphone, Plus, RefreshCw, Filter,
} from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import AnnouncementCard from './AnnouncementCard';
import api from '../../services/api';

const PRIORITIES = [
  { value: '', label: 'Toutes les priorités' },
  { value: 'NORMAL', label: 'Normales' },
  { value: 'IMPORTANT', label: 'Importantes' },
  { value: 'URGENT', label: 'Urgentes' },
];

export default function AnnouncementList({
  courseId,
  userRole,
  onCreateClick,
  onEdit,
  refreshKey = 0,
}) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);

  const canEdit = userRole === 'ADMIN' || userRole === 'TEACHER';

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/announcements/course/${courseId}`);
      setAnnouncements(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId, refreshKey]);

  // Filtrage local
  const filtered = announcements.filter((a) => {
    const matchesPriority = !filterPriority || a.priority === filterPriority;
    const matchesPinned = !showOnlyPinned || a.isPinned;
    return matchesPriority && matchesPinned;
  });

  const handleDelete = async (announcement) => {
    if (!confirm(`Supprimer l'annonce "${announcement.title}" ?`)) return;
    try {
      await api.delete(`/announcements/${announcement.id}`);
      setSuccess('Annonce supprimée');
      await fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const handleTogglePin = async (announcement) => {
    try {
      await api.patch(`/announcements/${announcement.id}/toggle-pin`);
      setSuccess(announcement.isPinned ? 'Annonce désépinglée' : 'Annonce épinglée');
      await fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-100"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyPinned}
            onChange={(e) => setShowOnlyPinned(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          Épinglées uniquement
        </label>

        <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
          <RefreshCw size={14} />
        </Button>

        {canEdit && (
          <Button size="sm" onClick={onCreateClick} className="ml-auto">
            <Plus size={16} />
            Nouvelle annonce
          </Button>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <Spinner className="py-10" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={announcements.length === 0 ? 'Aucune annonce' : 'Aucun résultat'}
          description={
            announcements.length === 0
              ? canEdit
                ? 'Publiez votre première annonce pour communiquer avec vos étudiants'
                : 'Les annonces de votre enseignant apparaîtront ici'
              : 'Essayez de modifier vos filtres'
          }
          action={
            canEdit && announcements.length === 0 ? (
              <Button onClick={onCreateClick}>
                <Plus size={16} />
                Publier une annonce
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              userRole={userRole}
              onEdit={onEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}