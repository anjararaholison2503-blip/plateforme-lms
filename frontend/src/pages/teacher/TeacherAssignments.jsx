import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Plus, Search, RefreshCw, ArrowLeft, BookOpen,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import AssignmentCard from '../../components/common/AssignmentCard';
import AssignmentFormModal from '../../components/common/AssignmentFormModal';
import api from '../../services/api';

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedCourse(res.data.data[0]);
      }
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await api.get(`/assignments/course/${selectedCourse.id}`);
      setAssignments(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchAssignments();
  }, [selectedCourse, fetchAssignments]);

  const handleDelete = async (assignment) => {
    if (!confirm(`Supprimer le devoir "${assignment.title}" ?`)) return;
    try {
      await api.delete(`/assignments/${assignment.id}`);
      setSuccess('Devoir supprimé');
      await fetchAssignments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    setModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Devoirs"
        subtitle="Créez et gérez les devoirs de vos cours"
        badge="Enseignant"
        action={
          selectedCourse && (
            <Button size="sm" onClick={openCreate}>
              <Plus size={16} />
              Nouveau devoir
            </Button>
          )
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        {/* Sélection du cours */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Cours
          </label>
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const c = courses.find((c) => c.id === parseInt(e.target.value));
              setSelectedCourse(c);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          >
            {courses.length === 0 ? (
              <option value="">Aucun cours assigné</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : !selectedCourse ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={BookOpen}
              title="Aucun cours assigné"
              description="L'administrateur doit vous assigner un cours"
            />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={ClipboardList}
              title="Aucun devoir"
              description="Créez votre premier devoir pour ce cours"
              action={
                <Button onClick={openCreate}>
                  <Plus size={16} />
                  Créer un devoir
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                userRole="TEACHER"
                onEdit={openEdit}
                onDelete={handleDelete}
                onView={(a) => navigate(`/assignments/${a.id}`)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedCourse && (
          <AssignmentFormModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setEditing(null); }}
            onSuccess={() => {
              setSuccess(editing ? 'Devoir modifié' : 'Devoir créé');
              fetchAssignments();
              setTimeout(() => setSuccess(''), 3000);
            }}
            courseId={selectedCourse.id}
            assignment={editing}
          />
        )}
      </main>
    </>
  );
}