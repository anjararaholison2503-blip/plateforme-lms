import { useState, useEffect } from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function EnrollmentRejectionModal({
  isOpen,
  onClose,
  onSuccess,
  enrollment,
}) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('La raison doit contenir au moins 5 caractères');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post(`/enrollments/${enrollment.id}/reject`, {
        reason: reason.trim(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors du rejet');
    } finally {
      setSaving(false);
    }
  };

  if (!enrollment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rejeter l'inscription"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="danger" onClick={handleSubmit} loading={saving}>
            <XCircle size={16} />
            Confirmer le rejet
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Avertissement */}
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Vous allez rejeter l'inscription de :
              </p>
              <p className="text-sm text-rose-800 dark:text-rose-300 mt-1">
                <strong>{enrollment.applicantName}</strong> ({enrollment.applicantEmail})
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                Cette action est irréversible. L'étudiant recevra un email de notification.
              </p>
            </div>
          </div>
        </div>

        {/* Raison */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Raison du rejet *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ex: Dossier incomplet, documents manquants, critères non remplis..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Cette raison sera communiquée à l'étudiant.
          </p>
        </div>
      </form>
    </Modal>
  );
}