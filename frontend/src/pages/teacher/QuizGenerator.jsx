import { useState } from 'react';
import { Sparkles, Upload, FileText, X } from 'lucide-react';
import api from '../../services/api';

export default function QuizGenerator({ isOpen, onClose, courseId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const reset = () => {
    setFile(null);
    setTitle('');
    setQuestionCount(10);
    setDifficulty('MEDIUM');
    setError('');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    if (!file || !title) {
      setError('Fichier et titre requis');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload du fichier
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/assignments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { fileUrl, fileName, fileSize, mimeType } = uploadRes.data.data;

      // 2. Génération du quiz
      const res = await api.post(`/courses/${courseId}/quizzes/generate`, {
        title,
        fileUrl,
        fileName,
        mimeType,
        questionCount: parseInt(questionCount) || 10,
        difficulty,
      });

      if (onSuccess) onSuccess(res.data.data);
      reset();
      onClose();
    } catch (err) {
      setError(err.userMessage || err.message || 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={22} />
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Générer un quiz par IA
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
              Titre du quiz
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              placeholder="Ex: Introduction à la programmation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
              Fichier du cours
            </label>
            {!file ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  onChange={handleFile}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={uploading}
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                  <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Cliquez pour choisir un fichier
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    PDF, DOC, DOCX, TXT · Max 10 Mo
                  </p>
                </div>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <FileText size={20} className="text-emerald-600 flex-shrink-0" />
                <span className="text-sm flex-1 truncate text-gray-800 dark:text-slate-200">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="text-gray-400 hover:text-rose-600 disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                Nombre de questions
              </label>
              <input
                type="number"
                min="5"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">
                Difficulté
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs text-indigo-700 dark:text-indigo-300">
            💡 L'IA analysera votre cours et générera automatiquement des questions de quiz.
            Vous pourrez les réviser avant publication.
          </div>
        </div>

        {/* Pied */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={uploading || !file || !title}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles size={16} />
            {uploading ? 'Génération en cours...' : 'Générer le quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}