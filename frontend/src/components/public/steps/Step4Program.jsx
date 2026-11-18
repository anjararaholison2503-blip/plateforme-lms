import { useEffect, useState } from 'react';
import {
  GraduationCap, Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import Input from '../../ui/Input';
import Alert from '../../ui/Alert';
import api from '../../../services/api';

const REQUIRED_DOCUMENTS = [
  { type: 'CIN', label: 'Carte d\'identité (CIN)', required: true },
  { type: 'DIPLOMA', label: 'Diplôme (Baccalauréat ou équivalent)', required: true },
  { type: 'PHOTO', label: 'Photo d\'identité', required: true },
];

export default function Step4Program({ data, onChange, errors }) {
  const [programs, setPrograms] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };
useEffect(() => {
  // Charger les programmes (filières) et niveaux (Route publique sans token)
  api.get('/institution/public/units?type=PROGRAM')
    .then((res) => setPrograms(res.data.data || []))
    .catch(() => setPrograms([]))
    .finally(() => setLoading(false));

  api.get('/institution/public/units?type=LEVEL')
    .then((res) => setLevels(res.data.data || []))
    .catch(() => setLevels([]));
}, []);

  const handleFileUpload = async (docType, file) => {
    if (!file) return;

    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 Mo)');
      return;
    }

    setUploading((prev) => ({ ...prev, [docType]: true }));

    // Simulation d'upload (pour l'instant, on stocke juste le nom du fichier)
    // Dans une vraie implémentation, on ferait un POST /api/upload
    setTimeout(() => {
      const documents = { ...(data.documents || {}) };
      documents[docType] = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };
      update('documents', documents);
      setUploading((prev) => ({ ...prev, [docType]: false }));
    }, 800);
  };

  const removeDocument = (docType) => {
    const documents = { ...(data.documents || {}) };
    delete documents[docType];
    update('documents', documents);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Choix de la filière et documents
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Sélectionnez votre filière souhaitée et joignez vos documents
        </p>
      </div>

      {/* Choix de la filière */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <GraduationCap size={14} />
          Filière souhaitée *
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Filière / Programme
            </label>
            <select
              value={data.desiredProgramId || ''}
              onChange={(e) => update('desiredProgramId', e.target.value)}
              className={`
                w-full px-4 py-2.5 border rounded-lg text-sm
                bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                ${errors.desiredProgramId ? 'border-red-300' : 'border-gray-300 dark:border-slate-600'}
              `}
            >
              <option value="">— Sélectionner —</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ''}
                </option>
              ))}
            </select>
            {errors.desiredProgramId && (
              <p className="mt-1 text-xs text-red-600">{errors.desiredProgramId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Niveau souhaité
            </label>
            <select
              value={data.desiredLevelId || ''}
              onChange={(e) => update('desiredLevelId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="">— Sélectionner —</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            💡 L'administrateur validera votre dossier et vous affectera à une classe précise.
          </p>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <FileText size={14} />
          Documents à fournir
        </h3>

        <div className="space-y-3">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const uploaded = data.documents?.[doc.type];
            const isUploading = uploading[doc.type];

            return (
              <div
                key={doc.type}
                className={`
                  p-4 rounded-xl border-2 transition-colors
                  ${uploaded
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      uploaded
                        ? 'bg-emerald-100 dark:bg-emerald-900/40'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    {uploaded ? (
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <FileText size={18} className="text-gray-500 dark:text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </p>

                    {uploaded ? (
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
                          {uploaded.fileName} ({formatSize(uploaded.fileSize)})
                        </p>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.type)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        PDF, JPG ou PNG · Max 5 Mo
                      </p>
                    )}
                  </div>

                  {!uploaded && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(doc.type, e.target.files[0])}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <span
                        className={`
                          inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                          ${isUploading
                            ? 'bg-gray-200 text-gray-500 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          }
                        `}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Upload...
                          </>
                        ) : (
                          <>
                            <Upload size={12} />
                            Choisir
                          </>
                        )}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Avertissement */}
        {(!data.documents || Object.keys(data.documents).length < 3) && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Il est recommandé de fournir tous les documents. Vous pouvez les ajouter plus tard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}