import { useState, useEffect } from 'react';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function AssignmentSubmitModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isResubmission = !!assignment?.mySubmission;

  useEffect(() => {
    if (isOpen && assignment) {
      setContent(assignment.mySubmission?.content || '');
      setFile(null);
      setError('');
    }
  }, [isOpen, assignment]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Upload du fichier si présent
      let fileData = {};
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post('/assignments/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        fileData = {
          fileUrl: uploadRes.data.data.fileUrl,
          fileName: uploadRes.data.data.fileName,
          fileSize: uploadRes.data.data.fileSize,
          mimeType: uploadRes.data.data.mimeType,
        };
      }

      await api.post(`/assignments/${assignment.id}/submit`, {
        content: content || null,
        ...fileData,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la soumission');
    } finally {
      setSaving(false);
    }
  };

  if (!assignment) return null;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isResubmission ? 'Re-soumettre le devoir' : 'Soumettre le devoir'}
      subtitle={assignment.title}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <Upload size={16} />
            {isResubmission ? 'Re-soumettre' : 'Soumettre'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Instructions */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300 mb-1">
            Instructions :
          </p>
          <p className="text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">
            {assignment.instructions}
          </p>
        </div>

        {/* Contenu texte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Votre réponse (texte)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Écrivez votre réponse ici..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Fichier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Fichier joint (optionnel, max 10 Mo)
          </label>

          {!file && !assignment.mySubmission?.fileName ? (
            <label className="cursor-pointer block">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.jpeg,.png"
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  PDF, DOC, ZIP, Image · Max 10 Mo
                </p>
              </div>
            </label>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <FileText size={24} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                  {file ? file.name : assignment.mySubmission?.fileName}
                </p>
                {file && (
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {formatSize(file.size)}
                  </p>
                )}
              </div>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {isResubmission
              ? '⚠️ Votre soumission précédente sera remplacée.'
              : 'Une fois soumis, vous ne pourrez peut-être plus modifier votre travail.'}
          </p>
        </div>
      </form>
    </Modal>
  );
}