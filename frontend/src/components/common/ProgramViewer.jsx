import { useEffect, useState } from 'react';
import { BookOpen, Clock, Layers, GraduationCap, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import EmptyState from '../ui/EmptyState';
import ModuleCard from './ModuleCard';
import api from '../../services/api';

export default function ProgramViewer({ courseId }) {
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgram = async () => {
    setLoading(true);
    try {
      const [programRes, statsRes] = await Promise.all([
        api.get(`/programs/course/${courseId}`),
        api.get(`/programs/course/${courseId}/stats`),
      ]);
      setModules(programRes.data.data);
      setStats(statsRes.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [courseId]);

  if (loading) {
    return <Spinner className="py-10" />;
  }

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Layers size={13} />
            {stats.modulesCount} module(s)
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={13} />
            {stats.lessonsCount} leçon(s)
          </span>
          {stats.totalDurationMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {Math.round(stats.totalDurationMinutes / 60)}h {stats.totalDurationMinutes % 60}min
            </span>
          )}
        </div>
      )}

      {/* Liste */}
      {modules.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Programme non disponible"
          description="Le programme du cours n'a pas encore été publié"
        />
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              canEdit={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}