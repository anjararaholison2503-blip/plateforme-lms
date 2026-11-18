import { useState, useEffect } from 'react';
import { FileText, Video, Link2, File, BookOpen } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const CONTENT_TYPES = [
  { value: 'TEXT', label: 'Texte', icon: FileText },
  { value: 'VIDEO', label: 'Vidéo', icon: Video },
  { value: 'LINK', label: 'Lien', icon: Link2 },
  { value: 'FILE', label: 'Fichier', icon: File },
  { value: 'MIXED', label: 'Mixte', icon: BookOpen },
];

const emptyForm = {
  title: '',
  content: '',
  contentType: 'TEXT',
  videoUrl: '',
  duration: '',
  isPublished: true,
};

export default function LessonFormModal({
  isOpen,
  onClose,
  onSuccess,
  moduleId,
  lesson = null,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!lesson;

  useEffect(() => {
    if (isOpen) {
      if (lesson) {
        setFormData({
          title: lesson.title,
          content: lesson.content || '',
          contentType: lesson.contentType || 'TEXT',
          videoUrl: lesson.videoUrl || '',
          duration: lesson.duration || '',
          isPublished: lesson.isPublished,
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, lesson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        content: formData.content || null,
        contentType: formData.contentType,
        videoUrl: formData.videoUrl || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        isPublished: formData.isPublished,
      };

      if (isEdit) {
        await api.put(`/programs/lesson/${lesson.id}`, payload);
      } else {
        await api.post(`/programs/module/${moduleId}/lessons`, payload);
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
      title={isEdit ? 'Modifier la leçon' : 'Nouvelle leçon'}
      size="lg"
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
          label="Titre de la leçon *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: Qu'est-ce que la programmation ?"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Type de contenu
          </label>
          <div className="grid grid-cols-5 gap-2">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.contentType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, contentType: type.value })}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span className="text-[10px] font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {formData.contentType === 'VIDEO' && (
          <Input
            label="URL de la vidéo"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="https://..."
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Contenu
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            placeholder="Contenu de la leçon (texte, HTML basique, etc.)"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
        </div>

        <Input
          label="Durée estimée (minutes)"
          type="number"
          min="0"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          placeholder="Ex: 30"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublishedLesson"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="isPublishedLesson" className="text-sm text-gray-700 dark:text-slate-300">
            Publier cette leçon (visible par les étudiants)
          </label>
        </div>
      </form>
    </Modal>
  );
}