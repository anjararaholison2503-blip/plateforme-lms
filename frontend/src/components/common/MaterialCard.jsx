import { useState } from 'react';
import {
  Download, Eye, Trash2, Edit, MoreVertical, Clock, AlertTriangle,
  Calendar, ExternalLink, User,
} from 'lucide-react';
import MaterialIcon, { getMaterialTypeLabel } from './MaterialIcon';
import Badge from '../ui/Badge';
import api from '../../services/api';

export default function MaterialCard({
  material,
  userRole,
  onDelete,
  onExtend,
  onView,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // ═══ Calcul de l'expiration ═══
  const getExpirationInfo = () => {
    if (!material.expiresAt) {
      return { label: 'Permanent', color: 'blue', urgent: false };
    }

    const now = new Date();
    const expiresAt = new Date(material.expiresAt);
    const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { label: 'Expiré', color: 'red', urgent: true, daysLeft };
    }
    if (daysLeft <= 1) {
      return { label: 'Dernier jour', color: 'red', urgent: true, daysLeft };
    }
    if (daysLeft <= 7) {
      return { label: `Expire dans ${daysLeft}j`, color: 'yellow', urgent: true, daysLeft };
    }
    return { label: `Expire dans ${daysLeft}j`, color: 'gray', urgent: false, daysLeft };
  };

  const expiration = getExpirationInfo();
  const canDelete = userRole === 'ADMIN' || userRole === 'TEACHER';
  const canExtend = userRole === 'ADMIN' || userRole === 'TEACHER';
  const canDownload = userRole === 'STUDENT' || userRole === 'TEACHER' || userRole === 'ADMIN';

  // ═══ Formatage ═══
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} Go`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ═══ Actions ═══
  const handleDownload = async () => {
    try {
      const res = await api.get(`/materials/${material.id}/download`);
      const { fileUrl, fileName } = res.data.data;

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = `http://localhost:5000${fileUrl}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erreur de téléchargement : ' + (err.userMessage || err.message));
    }
  };

  const handleView = () => {
    if (material.type === 'LINK' && material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    } else if (onView) {
      onView(material);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-sm transition-shadow p-5">
      <div className="flex items-start gap-4">
        <MaterialIcon type={material.type} size="lg" />

        <div className="flex-1 min-w-0">
          {/* Titre + badge expiration */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 truncate">
                {material.title}
              </h3>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Badge color="gray" className="text-[10px]">
                    {getMaterialTypeLabel(material.type)}
                  </Badge>
                </span>
                <span>{formatSize(material.fileSize)}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDate(material.publishedAt)}
                </span>
                {material.uploadedBy && (
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {material.uploadedBy.firstName} {material.uploadedBy.lastName}
                  </span>
                )}
              </div>

              {/* Description */}
              {material.description && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {material.description}
                </p>
              )}

              {/* Badge expiration */}
              <div className="flex items-center gap-2 mt-3">
                {material.expiresAt ? (
                  <span
                    className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                      ${
                        expiration.urgent
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }
                    `}
                  >
                    {expiration.urgent ? <AlertTriangle size={10} /> : <Clock size={10} />}
                    {expiration.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    ♾️ Permanent
                  </span>
                )}
              </div>
            </div>

            {/* Menu actions */}
            {canDelete && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-1 animate-fade-in">
                      {canDownload && (
                        <button
                          onClick={() => {
                            handleDownload();
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                          <Download size={14} /> Télécharger
                        </button>
                      )}
                      {material.type === 'LINK' && (
                        <button
                          onClick={() => {
                            handleView();
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                          <ExternalLink size={14} /> Ouvrir le lien
                        </button>
                      )}
                      {canExtend && (
                        <button
                          onClick={() => {
                            onExtend(material);
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                        >
                          <Edit size={14} /> Prolonger
                        </button>
                      )}
                      {canDelete && (
                        <>
                          <hr className="my-1 border-gray-100 dark:border-slate-600" />
                          <button
                            onClick={() => {
                              onDelete(material);
                              setMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      {canDownload && material.type !== 'LINK' && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <Download size={16} />
            Télécharger ({formatSize(material.fileSize)})
          </button>
        </div>
      )}

      {material.type === 'LINK' && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={handleView}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Ouvrir le lien
          </button>
        </div>
      )}
    </div>
  );
}