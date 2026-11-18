import { useEffect, useState } from 'react';
import {
  FolderOpen, Plus, Search, RefreshCw, Filter,
} from 'lucide-react';
import MaterialCard from './MaterialCard';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import api from '../../services/api';

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'PDF', label: 'PDF' },
  { value: 'VIDEO', label: 'Vidéo' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'ZIP', label: 'Archive' },
  { value: 'LINK', label: 'Lien' },
];

export default function MaterialList({
  courseId,
  userRole,
  onUploadClick,
  onExtend,
  onDelete,
  refreshKey,
}) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const canUpload = userRole === 'ADMIN' || userRole === 'TEACHER';

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/materials/course/${courseId}`);
      setMaterials(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [courseId, refreshKey]);

  // Filtrage local
  const filtered = materials.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un support..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-100"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={fetchMaterials}>
          <RefreshCw size={14} />
        </Button>

        {canUpload && (
          <Button size="sm" onClick={onUploadClick}>
            <Plus size={16} />
            Déposer un support
          </Button>
        )}
      </div>

      {/* Contenu */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Spinner className="py-10" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={search || filterType ? 'Aucun résultat' : 'Aucun support disponible'}
          description={
            search || filterType
              ? 'Essayez de modifier vos filtres'
              : canUpload
              ? 'Déposez votre premier support pédagogique'
              : 'Les supports déposés par votre enseignant apparaîtront ici'
          }
          action={
            canUpload && !search && !filterType ? (
              <Button onClick={onUploadClick}>
                <Plus size={16} />
                Déposer un support
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              userRole={userRole}
              onDelete={onDelete}
              onExtend={onExtend}
            />
          ))}
        </div>
      )}
    </div>
  );
}