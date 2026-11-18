import { useState, useRef } from 'react';
import {
  Upload, Download, FileSpreadsheet, X, CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function ImportModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Importer des données',
  templateUrl,
  importUrl,
  acceptedFormats = '.xlsx,.xls',
  maxSizeMB = 10,
}) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (f) => {
    setError('');
    setResult(null);

    if (!f) return;

    // Vérifier la taille
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxSizeMB} Mo)`);
      return;
    }

    // Vérifier l'extension
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Format invalide. Utilisez un fichier .xlsx ou .xls');
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFileChange(dropped);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await api.get(templateUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_import.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du modèle');
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(importUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data.data);

      if (res.data.data.success > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.userMessage || "Erreur lors de l'import");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
          {!result && (
            <Button onClick={handleImport} loading={uploading} disabled={!file}>
              <Upload size={16} />
              Importer
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Étape 1 : Télécharger le modèle */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Étape 1 : Téléchargez le modèle
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Remplissez le fichier Excel avec vos données.
              </p>
              <button
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:underline disabled:opacity-50"
              >
                <Download size={14} />
                {downloading ? 'Téléchargement...' : 'Télécharger le modèle Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Étape 2 : Upload */}
        {!result && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Étape 2 : Sélectionnez votre fichier
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${
                  dragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept={acceptedFormats}
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet size={32} className="text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Cliquez ou déposez votre fichier ici
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Formats acceptés : .xlsx, .xls (max {maxSizeMB} Mo)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Résultat */}
        {result && (
          <div className="space-y-3">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-center">
                <p className="text-xs text-gray-500 dark:text-slate-400">Total</p>
                <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
                  {result.total}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-xs text-green-700 dark:text-green-300">Réussis</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {result.success}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                <p className="text-xs text-red-700 dark:text-red-300">Échecs</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {result.failed}
                </p>
              </div>
            </div>

            {/* Message */}
            {result.failed === 0 ? (
              <Alert
                type="success"
                message={`${result.success} utilisateur(s) importé(s) avec succès !`}
              />
            ) : (
              <Alert
                type="warning"
                message={`${result.success} importé(s), ${result.failed} en erreur.`}
              />
            )}

            {/* Détails des erreurs */}
            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Détails des erreurs ({result.errors.length})
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg divide-y divide-gray-100 dark:divide-slate-700">
                  {result.errors.map((err, i) => (
                    <div key={i} className="p-3 flex items-start gap-2">
                      <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-slate-200">
                          Ligne {err.line} — {err.email}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {err.messages.map((msg, j) => (
                            <li key={j} className="text-xs text-red-600 dark:text-red-400">
                              • {msg}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={reset}
              className="w-full"
            >
              Importer un autre fichier
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}