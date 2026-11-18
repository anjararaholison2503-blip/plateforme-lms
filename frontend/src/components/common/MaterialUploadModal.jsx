import { useState, useRef } from 'react';
import {
  Upload, File, X, AlertTriangle, Calendar, Clock, Info,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import MaterialIcon from './MaterialIcon';
import api from '../../services/api';

const DURATION_OPTIONS = [
  { value: '1-week', label: '1 semaine', value2: 1, unit: 'weeks' },
  { value: '2-weeks', label: '2 semaines', value2: 2, unit: 'weeks' },
  { value: '1-month', label: '1 mois', value2: 1, unit: 'months' },
  { value: '3-months', label: '3 mois (défaut)', value2: 3, unit: 'months' },
  { value: '6-months', label: '6 mois', value2: 6, unit: 'months' },
  { value: '1-year', label: '1 an', value2: 1, unit: 'years' },
  { value: 'never', label: '♾️ Illimité', value2: null, unit: 'never' },
];

const MAX_SIZE_MB = 500;
const WARNING_SIZE_MB = 300;

export default function MaterialUploadModal({
  isOpen,
  onClose,
  courseId,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('STUDENTS');
  const [duration, setDuration] = useState('3-months');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setVisibility('STUDENTS');
    setDuration('3-months');
    setProgress(0);
    setError('');
    setWarning('');
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleFileChange = (f) => {
    setError('');
    setWarning('');
    if (!f) return;

    const sizeMB = f.size / (1024 * 1024);

    if (sizeMB > MAX_SIZE_MB) {
      setError(`Fichier trop volumineux (${sizeMB.toFixed(1)} Mo). Maximum : ${MAX_SIZE_MB} Mo.`);
      return;
    }

    if (sizeMB > WARNING_SIZE_MB) {
      setWarning(
        `⚠️ Ce fichier fait ${sizeMB.toFixed(1)} Mo. Cela peut ralentir l'upload. ` +
        `Conseil : réduisez la qualité si possible.`
      );
    }

    setFile(f);
    if (!title) {
      // Pré-remplir avec le nom du fichier (sans extension)
      const name = f.name.replace(/\.[^/.]+$/, '');
      setTitle(name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!file) {
    setError('Veuillez sélectionner un fichier');
    return;
  }
  if (!title.trim()) {
    setError('Le titre est requis');
    return;
  }

  setUploading(true);
  setError('');
  setProgress(0);

  // ═══ ÉTAPE 1 : Upload (avec try/catch séparé) ═══
  let uploadSuccess = false;
  let uploadError = null;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('visibility', visibility);

    const durationConf = DURATION_OPTIONS.find((d) => d.value === duration);
    if (durationConf && durationConf.unit !== 'never') {
      formData.append('durationValue', durationConf.value2);
      formData.append('durationUnit', durationConf.unit);
    } else {
      formData.append('durationValue', '');
      formData.append('durationUnit', 'never');
    }

    await api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percent);
      },
    });

    uploadSuccess = true;
  } catch (err) {
    uploadError = err.userMessage || err.message || 'Erreur lors de l\'upload';
  }

  setUploading(false);

  // ═══ ÉTAPE 2 : Callbacks séparés (hors du try/catch) ═══
  if (uploadSuccess) {
    reset();
    try {
      if (onSuccess) onSuccess();
    } catch (cbErr) {
      console.error('Erreur callback onSuccess:', cbErr);
    }
    try {
      if (onClose) onClose();
    } catch (cbErr) {
      console.error('Erreur callback onClose:', cbErr);
    }
  } else {
    setError(uploadError);
  }
};

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} Go`;
  };

  const durationConf = DURATION_OPTIONS.find((d) => d.value === duration);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Déposer un support pédagogique"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} loading={uploading} disabled={!file}>
            <Upload size={16} />
            {uploading ? `Upload ${progress}%` : 'Déposer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Zone de dépôt */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all
            ${dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-slate-700/30'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-4">
              <MaterialIcon
                type={file.type.startsWith('video/') ? 'VIDEO' : file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT'}
                size="lg"
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {formatSize(file.size)} · {file.type}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Cliquez ou déposez un fichier ici
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Tous types · Max {MAX_SIZE_MB} Mo · 1 fichier à la fois
              </p>
            </>
          )}
        </div>

        {/* Avertissement 300 Mo */}
        {warning && (
          <Alert type="warning" message={warning} onClose={() => setWarning('')} />
        )}

        {/* Titre */}
        <Input
          label="Titre du support *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Chapitre 1 - Introduction"
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Description (optionnelle)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Décrivez le contenu du support..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Visibilité + Durée */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              <Info size={14} className="inline mr-1" />
              Visibilité
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="STUDENTS">👥 Tous les étudiants</option>
              <option value="TEACHERS">👨‍🏫 Enseignants uniquement</option>
              <option value="ALL">🌍 Tout le monde</option>
              <option value="PRIVATE">🔒 Privé (moi seulement)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              <Clock size={14} className="inline mr-1" />
              Durée de publication
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info expiration */}
        {durationConf && durationConf.unit !== 'never' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
            <Calendar size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Ce support sera supprimé automatiquement</strong> après la durée choisie.
              <br />
              Vous recevrez des notifications 7 jours avant pour prolonger si besoin.
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {uploading && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
              <span>Upload en cours...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      </form>
    </Modal>
  );
}