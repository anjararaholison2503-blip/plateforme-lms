import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const emptyForm = {
  title: '',
  description: '',
  duration: '',
  isPublished: true,
};

export default function ModuleFormModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  module = null, // null = création
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!module;

  useEffect(() => {
    if (isOpen) {
      if (module) {
        setFormData({
          title: module.title,
          description: module.description || '',
          duration: module.duration || '',
          isPublished: module.isPublished,
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, module]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        isPublished: formData.isPublished,
      };

      if (isEdit) {
        await api.put(`/programs/module/${module.id}`, payload);
      } else {
        await api.post(`/programs/course/${courseId}`, payload);
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
      title={isEdit ? 'Modifier le module' : 'Nouveau module'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <Input
          label="Titre du module *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Introduction à la programmation"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Décrivez ce module..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Input
          label="Durée estimée (heures)"
          type="number"
          min="0"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="Ex: 10"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-slate-300">
            Publier ce module (visible par les étudiants)
          </label>
        </div>
      </form>
    </Modal>
  );
}