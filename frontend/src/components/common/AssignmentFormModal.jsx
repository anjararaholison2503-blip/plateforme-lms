import { useState, useEffect } from 'react';
import {
  ClipboardList, Calendar, Award, FileText, Info, Save,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';
import { Upload, X } from 'lucide-react';
const STATUSES = [
  { value: 'DRAFT', label: 'Brouillon (invisible)' },
  { value: 'PUBLISHED', label: 'Publié (visible)' },
  { value: 'CLOSED', label: 'Fermé' },
  { value: 'ARCHIVED', label: 'Archivé' },
];

const emptyForm = {
  title: '',
  instructions: '',
  dueDate: '',
  maxScore: 20,
  status: 'DRAFT',
  allowLateSubmission: true,
  allowResubmission: false,
};

export default function AssignmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  assignment = null,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!assignment;

  useEffect(() => {
    if (isOpen) {
      if (assignment) {
        setFormData({
          title: assignment.title,
          instructions: assignment.instructions,
          dueDate: assignment.dueDate
            ? new Date(assignment.dueDate).toISOString().slice(0, 16)
            : '',
          maxScore: assignment.maxScore,
          status: assignment.status,
          allowLateSubmission: assignment.allowLateSubmission,
          allowResubmission: assignment.allowResubmission,
        });
      } else {
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 7);
        setFormData({
          ...emptyForm,
          dueDate: defaultDue.toISOString().slice(0, 16),
        });
      }
      setError('');
    }
  }, [isOpen, assignment]);

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    setError('Fichier trop volumineux (max 10 Mo)');
    return;
  }

  setUploading(true);
  setError('');

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/assignments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setAttachment({
      url: res.data.data.fileUrl,
      name: res.data.data.fileName,
      size: res.data.data.fileSize,
    });
  } catch (err) {
    setError(err.userMessage || 'Erreur lors de l\'upload');
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
const payload = {
  ...formData,
  dueDate: new Date(formData.dueDate).toISOString(),
  maxScore: parseInt(formData.maxScore) || 20,
  attachmentUrl: attachment?.url || assignment?.attachmentUrl || null,
  attachmentName: attachment?.name || assignment?.attachmentName || null,
  attachmentSize: attachment?.size || assignment?.attachmentSize || null,
};

      if (isEdit) {
        await api.put(`/assignments/${assignment.id}`, payload);
      } else {
        await api.post(`/assignments/course/${courseId}`, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier le devoir' : 'Nouveau devoir'}
      subtitle={isEdit ? 'Modifiez les informations du devoir' : 'Créez un nouveau devoir pour vos étudiants'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <Save size={16} />
            {isEdit ? 'Enregistrer' : 'Créer le devoir'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Titre */}
        <Input
          label="Titre du devoir *"
          value={formData.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Ex: Exercice 1 - Les boucles"
          required
          icon={ClipboardList}
        />

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Instructions *
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => update('instructions', e.target.value)}
            rows={5}
            placeholder="Décrivez le travail à réaliser..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Date + Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date limite *"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
            required
            icon={Calendar}
          />

          <Input
            label="Note maximale *"
            type="number"
            min="1"
            max="1000"
            value={formData.maxScore}
            onChange={(e) => update('maxScore', e.target.value)}
            required
            icon={Award}
          />
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Statut *
          </label>
          <select
            value={formData.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Paramètres */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30">
            <input
              type="checkbox"
              checked={formData.allowLateSubmission}
              onChange={(e) => update('allowLateSubmission', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Autoriser les soumissions en retard
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                L'étudiant pourra soumettre après la date limite
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30">
            <input
              type="checkbox"
              checked={formData.allowResubmission}
              onChange={(e) => update('allowResubmission', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Autoriser la re-soumission
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                L'étudiant pourra remplacer sa soumission
              </p>
            </div>
          </label>
        </div>


{/* Fichier du sujet */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
    Fichier du sujet (optionnel, max 10 Mo)
  </label>

  {!attachment && !assignment?.attachmentUrl ? (
    <label className="cursor-pointer block">
      <input
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.jpeg,.png"
        disabled={uploading}
      />
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
        {uploading ? (
          <p className="text-sm text-gray-500">Upload en cours...</p>
        ) : (
          <>
            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Cliquez pour sélectionner un fichier
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              PDF, DOC, ZIP, Image · Max 10 Mo
            </p>
          </>
        )}
      </div>
    </label>
  ) : (
    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
      <FileText size={24} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
          {attachment?.name || assignment?.attachmentName}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setAttachment(null)}
        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
      >
        <X size={16} />
      </button>
    </div>
  )}
</div>

        {/* Info */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-start gap-2">
          <Info size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            💡 Le devoir sera visible par les étudiants uniquement si le statut est <strong>Publié</strong>.
          </p>
        </div>
      </form>
    </Modal>
  );
}