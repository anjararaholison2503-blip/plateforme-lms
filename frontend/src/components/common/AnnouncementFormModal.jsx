import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, Pin } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const PRIORITIES = [
  { value: 'NORMAL', label: 'Normal', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'IMPORTANT', label: 'Important', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'URGENT', label: 'Urgent', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
];

const emptyForm = {
  title: '',
  content: '',
  priority: 'NORMAL',
  isPinned: false,
  expiresAt: '',
};

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  announcement = null,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!announcement;

  useEffect(() => {
    if (isOpen) {
      if (announcement) {
        setFormData({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          isPinned: announcement.isPinned,
          expiresAt: announcement.expiresAt
            ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
            : '',
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, announcement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt || null,
      };

      if (isEdit) {
        await api.put(`/announcements/${announcement.id}`, payload);
      } else {
        await api.post(`/announcements/course/${courseId}`, payload);
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
      title={isEdit ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Enregistrer' : 'Publier'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <Input
          label="Titre *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Examen la semaine prochaine"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Contenu *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            placeholder="Écrivez votre annonce ici..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Priorité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => {
              const Icon = p.icon;
              const isSelected = formData.priority === p.value;

              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 transition-colors
                    ${isSelected
                      ? `border-primary-500 ${p.bg}`
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon size={16} className={p.color} />
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Date d'expiration (optionnelle)"
          type="datetime-local"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
        />
        <p className="text-xs text-gray-500 dark:text-slate-400 -mt-3">
          Sans date → l'annonce reste visible indéfiniment.
        </p>

        <div className="flex items-center gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
          <input
            type="checkbox"
            id="isPinned"
            checked={formData.isPinned}
            onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="isPinned" className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
            <Pin size={14} className="text-violet-600" />
            Épingler cette annonce en haut (remplace l'ancienne épinglée)
          </label>
        </div>
      </form>
    </Modal>
  );
}