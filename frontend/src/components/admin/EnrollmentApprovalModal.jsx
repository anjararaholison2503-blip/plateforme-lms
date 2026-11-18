import { useState, useEffect } from 'react';
import { CheckCircle2, GraduationCap, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function EnrollmentApprovalModal({
  isOpen,
  onClose,
  onSuccess,
  enrollment,
}) {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    desiredClassId: '',
    reviewNotes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && enrollment) {
      setFormData({
        desiredClassId: enrollment.desiredClassId || '',
        reviewNotes: '',
      });
      setError('');

      // Charger les classes disponibles
      api.get('/institution/units?type=CLASS')
        .then((res) => setClasses(res.data.data || []))
        .catch(() => setClasses([]));
    }
  }, [isOpen, enrollment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post(`/enrollments/${enrollment.id}/approve`, {
        desiredClassId: formData.desiredClassId || null,
        reviewNotes: formData.reviewNotes || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la validation');
    } finally {
      setSaving(false);
    }
  };

  if (!enrollment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Valider l'inscription"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <CheckCircle2 size={16} />
            Valider et générer les factures
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Récapitulatif */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Vous allez valider l'inscription de :
              </p>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1">
                <strong>{enrollment.applicantName}</strong> ({enrollment.applicantEmail})
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                Référence : {enrollment.reference}
              </p>
            </div>
          </div>
        </div>

        {/* Choix de la classe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <GraduationCap size={14} />
            Classe définitive *
          </label>
          <select
            value={formData.desiredClassId}
            onChange={(e) => setFormData({ ...formData, desiredClassId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            required
          >
            <option value="">— Sélectionner la classe —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.code ? `(${c.code})` : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Cette classe sera utilisée pour générer les factures de scolarité.
          </p>
        </div>

        {/* Notes internes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Notes internes (optionnel)
          </label>
          <textarea
            value={formData.reviewNotes}
            onChange={(e) => setFormData({ ...formData, reviewNotes: e.target.value })}
            rows={3}
            placeholder="Notes sur le dossier, remarques..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Après validation, l'étudiant recevra un email avec ses identifiants et les instructions de paiement.
            Les factures seront générées automatiquement selon l'échéancier défini.
          </p>
        </div>
      </form>
    </Modal>
  );
}