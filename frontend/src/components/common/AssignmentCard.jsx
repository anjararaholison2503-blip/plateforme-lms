import { useState } from 'react';
import {
  ClipboardList, Calendar, Award, FileText, Edit, Trash2, Eye,
  CheckCircle2, Clock, AlertCircle, User, Download, Upload,
} from 'lucide-react';
import Badge from '../ui/Badge';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'emerald' },
  CLOSED: { label: 'Fermé', color: 'amber' },
  ARCHIVED: { label: 'Archivé', color: 'gray' },
};

const SUBMISSION_STATUS = {
  SUBMITTED: { label: 'Soumis', color: 'blue' },
  GRADED: { label: 'Noté', color: 'emerald' },
  RETURNED: { label: 'Retourné', color: 'violet' },
  RESUBMITTED: { label: 'Re-soumis', color: 'amber' },
};

export default function AssignmentCard({
  assignment,
  userRole,
  onEdit,
  onDelete,
  onSubmit,
  onView,
  onGrade,
}) {
  const statusConf = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.DRAFT;
  const mySubmission = assignment.mySubmission;
  const submissionConf = mySubmission ? SUBMISSION_STATUS[mySubmission.status] : null;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'PUBLISHED';
  const canSubmit = userRole === 'STUDENT' &&
    ['PUBLISHED'].includes(assignment.status) &&
    (!mySubmission || assignment.allowResubmission);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Bandeau supérieur */}
      <div className={`h-1.5 ${
        assignment.status === 'PUBLISHED' ? 'bg-indigo-500' :
        assignment.status === 'CLOSED' ? 'bg-amber-500' :
        assignment.status === 'ARCHIVED' ? 'bg-gray-400' : 'bg-gray-300'
      }`} />

      <div className="p-5">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 line-clamp-2">
                {assignment.title}
              </h3>
              {assignment.course && (
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                  {assignment.course.code} · {assignment.course.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge color={statusConf.color}>{statusConf.label}</Badge>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-4">
          {assignment.instructions}
        </p>

        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-4">
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
            <Calendar size={12} />
            {isOverdue ? 'Échéance dépassée : ' : 'Échéance : '}
            {formatDate(assignment.dueDate)}
          </span>
          <span className="flex items-center gap-1">
            <Award size={12} />
            {assignment.maxScore} points
          </span>
          {assignment.attachmentUrl && (
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <FileText size={12} />
              Fichier joint
            </span>
          )}
        </div>

        {/* Info soumission (étudiant) */}
        {userRole === 'STUDENT' && mySubmission && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Vous avez soumis le {formatDate(mySubmission.submittedAt)}
              </span>
              {submissionConf && (
                <Badge color={submissionConf.color}>{submissionConf.label}</Badge>
              )}
            </div>
            {mySubmission.isLate && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                ⚠️ Soumis en retard
              </p>
            )}
            {mySubmission.score !== null && mySubmission.score !== undefined && (
              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Note : {mySubmission.score} / {assignment.maxScore}
                </p>
                {mySubmission.feedback && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {mySubmission.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats (enseignant) */}
        {userRole === 'TEACHER' || userRole === 'ADMIN' ? (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 pt-3 border-t border-gray-100 dark:border-slate-700">
            <span className="flex items-center gap-1">
              <User size={12} />
              {assignment._count?.submissions || 0} soumission(s)
            </span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
          {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
            <>
              <button
                onClick={() => onView(assignment)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                <Eye size={14} />
                Voir ({assignment._count?.submissions || 0})
              </button>
              <button
                onClick={() => onEdit(assignment)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                title="Modifier"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(assignment)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          {userRole === 'STUDENT' && canSubmit && (
            <button
              onClick={() => onSubmit(assignment)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Upload size={14} />
              {mySubmission ? 'Re-soumettre' : 'Soumettre'}
            </button>
          )}

          {userRole === 'STUDENT' && !canSubmit && mySubmission && (
            <div className="flex-1 text-center text-xs text-gray-500 dark:text-slate-400 py-2">
              {assignment.status === 'CLOSED' ? 'Devoir fermé' : 'Soumission complète'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}