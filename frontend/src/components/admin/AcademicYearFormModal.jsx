import { useState, useEffect } from 'react';
import { Calendar, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const emptyForm = {
  label: '',
  startDate: '',
  endDate: '',
  description: '',
  hasSemesters: false,
  semester1Start: '',
  semester1End: '',
  semester2Start: '',
  semester2End: '',
  registrationOpenDate: '',
  registrationCloseDate: '',
  reenrollmentDeadline: '',
};

export default function AcademicYearFormModal({ isOpen, onClose, onSuccess, year }) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!year;

  useEffect(() => {
    if (isOpen) {
      if (year) {
        setFormData({
          label: year.label,
          startDate: year.startDate?.slice(0, 10) || '',
          endDate: year.endDate?.slice(0, 10) || '',
          description: year.description || '',
          hasSemesters: year.hasSemesters || false,
          semester1Start: year.semester1Start?.slice(0, 10) || '',
          semester1End: year.semester1End?.slice(0, 10) || '',
          semester2Start: year.semester2Start?.slice(0, 10) || '',
          semester2End: year.semester2End?.slice(0, 10) || '',
          registrationOpenDate: year.registrationOpenDate?.slice(0, 10) || '',
          registrationCloseDate: year.registrationCloseDate?.slice(0, 10) || '',
          reenrollmentDeadline: year.reenrollmentDeadline?.slice(0, 10) || '',
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...formData };
      // Nettoyer les champs vides
      Object.keys(payload).forEach((key) => {
        if (payload[key] === '') payload[key] = null;
      });

      if (isEdit) {
        await api.put(`/academic-years/${year.id}`, payload);
      } else {
        await api.post('/academic-years', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier l\'année académique' : 'Nouvelle année académique'}
      subtitle="Configurez les dates et paramètres de l'année"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <Calendar size={16} />
            {isEdit ? 'Enregistrer' : 'Créer l\'année'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Informations principales */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
            Informations principales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Libellé *"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="2025-2026"
              required
            />
            <Input
              label="Année académique"
              value={formData.label ? `${formData.label} (${formData.startDate || '...'} → ${formData.endDate || '...'})` : ''}
              disabled
              className="opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Input
              label="Date de début *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Date de fin *"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Description de l'année académique..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Semestres */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasSemesters}
              onChange={(e) => setFormData({ ...formData, hasSemesters: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Cette année est organisée en 2 semestres
            </span>
          </label>

          {formData.hasSemesters && (
            <div className="space-y-4 mc-animate-slide-down">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Semestre 1</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Début"
                    type="date"
                    value={formData.semester1Start}
                    onChange={(e) => setFormData({ ...formData, semester1Start: e.target.value })}
                  />
                  <Input
                    label="Fin"
                    type="date"
                    value={formData.semester1End}
                    onChange={(e) => setFormData({ ...formData, semester1End: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Semestre 2</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Début"
                    type="date"
                    value={formData.semester2Start}
                    onChange={(e) => setFormData({ ...formData, semester2Start: e.target.value })}
                  />
                  <Input
                    label="Fin"
                    type="date"
                    value={formData.semester2End}
                    onChange={(e) => setFormData({ ...formData, semester2End: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Périodes d'inscription */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
            Périodes d'inscription
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ouverture des inscriptions"
              type="date"
              value={formData.registrationOpenDate}
              onChange={(e) => setFormData({ ...formData, registrationOpenDate: e.target.value })}
            />
            <Input
              label="Fermeture des inscriptions"
              type="date"
              value={formData.registrationCloseDate}
              onChange={(e) => setFormData({ ...formData, registrationCloseDate: e.target.value })}
            />
          </div>
          <div className="mt-4">
            <Input
              label="Date limite de réinscription"
              type="date"
              value={formData.reenrollmentDeadline}
              onChange={(e) => setFormData({ ...formData, reenrollmentDeadline: e.target.value })}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-start gap-2">
          <Info size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            💡 La première année créée sera automatiquement activée. Vous pourrez ensuite gérer son statut.
          </p>
        </div>
      </form>
    </Modal>
  );
}