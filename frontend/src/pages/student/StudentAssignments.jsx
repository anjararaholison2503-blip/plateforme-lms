import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, Filter } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import AssignmentCard from '../../components/common/AssignmentCard';
import AssignmentSubmitModal from '../../components/common/AssignmentSubmitModal';
import api from '../../services/api';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | submitted | graded

  const [submitModal, setSubmitModal] = useState({ open: false, assignment: null });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments/my-assignments');
      setAssignments(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return !a.mySubmission && a.status === 'PUBLISHED';
    }
    if (filter === 'submitted') {
      return a.mySubmission && ['SUBMITTED', 'RESUBMITTED'].includes(a.mySubmission.status);
    }
    if (filter === 'graded') {
      return a.mySubmission && ['GRADED', 'RETURNED'].includes(a.mySubmission.status);
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Mes devoirs"
        subtitle="Consultez et soumettez vos devoirs"
        badge="Étudiant"
        action={
          <Button variant="outline" size="sm" onClick={fetchAssignments}>
            <RefreshCw size={14} />
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { value: 'all', label: 'Tous', count: assignments.length },
            { value: 'pending', label: 'À faire', count: assignments.filter((a) => !a.mySubmission && a.status === 'PUBLISHED').length },
            { value: 'submitted', label: 'Soumis', count: assignments.filter((a) => a.mySubmission && ['SUBMITTED', 'RESUBMITTED'].includes(a.mySubmission.status)).length },
            { value: 'graded', label: 'Notés', count: assignments.filter((a) => a.mySubmission && ['GRADED', 'RETURNED'].includes(a.mySubmission.status)).length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={ClipboardList}
              title={
                filter === 'all' ? 'Aucun devoir' :
                filter === 'pending' ? 'Aucun devoir en attente' :
                filter === 'submitted' ? 'Aucun devoir soumis' :
                'Aucun devoir noté'
              }
              description="Les devoirs de vos cours apparaîtront ici"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                userRole="STUDENT"
                onSubmit={(a) => setSubmitModal({ open: true, assignment: a })}
              />
            ))}
          </div>
        )}

        {/* Modal soumission */}
        <AssignmentSubmitModal
          isOpen={submitModal.open}
          onClose={() => setSubmitModal({ open: false, assignment: null })}
          onSuccess={() => {
            setSuccess('Devoir soumis avec succès');
            fetchAssignments();
            setTimeout(() => setSuccess(''), 3000);
          }}
          assignment={submitModal.assignment}
        />
      </main>
    </>
  );
}