import {
  User, Mail, Phone, Calendar, GraduationCap, Clock, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, FileText, MapPin,
} from 'lucide-react';
import Badge from '../ui/Badge';

const STATUS_CONFIG = {
  PENDING_DOCUMENTS: { label: 'Documents manquants', color: 'gray', icon: FileText },
  PENDING_REVIEW: { label: 'En attente', color: 'yellow', icon: Clock },
  PENDING_PAYMENT: { label: 'À payer', color: 'amber', icon: AlertCircle },
  ENROLLED: { label: 'Inscrit', color: 'green', icon: CheckCircle2 },
  COMPLETED: { label: 'Terminé', color: 'blue', icon: CheckCircle2 },
  REPEATED: { label: 'Redoublé', color: 'purple', icon: AlertCircle },
  FAILED: { label: 'Échec', color: 'red', icon: XCircle },
  WITHDRAWN: { label: 'Abandon', color: 'gray', icon: XCircle },
  CANCELLED: { label: 'Annulé', color: 'gray', icon: XCircle },
  REJECTED: { label: 'Rejeté', color: 'red', icon: XCircle },
};

export default function EnrollmentCard({ enrollment, onClick }) {
  const config = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.PENDING_REVIEW;
  const Icon = config.icon;

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all overflow-hidden"
    >
      {/* Bandeau supérieur */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-base flex-shrink-0">
            {getInitials(enrollment.applicantName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 truncate">
                  {enrollment.applicantName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                  {enrollment.reference}
                </p>
              </div>
              <Badge color={config.color}>
                <Icon size={10} className="inline mr-1" />
                {config.label}
              </Badge>
            </div>

            {/* Infos de contact */}
            <div className="space-y-1 mt-3">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{enrollment.applicantEmail}</span>
              </div>

              {enrollment.contactInfo?.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                  <Phone size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{enrollment.contactInfo.phone}</span>
                </div>
              )}

              {enrollment.desiredClass && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                  <GraduationCap size={12} className="text-gray-400 flex-shrink-0" />
                  <span>{enrollment.desiredClass.name}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {enrollment.academicYear}
                </span>

                {enrollment.isReenrollment && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-medium">
                    Réinscription
                  </span>
                )}

                {enrollment.isRepeating && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                    Redoublant
                  </span>
                )}
              </div>

              <ArrowRight
                size={14}
                className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}