import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ClipboardList, Calendar, Award, FileText, User,
  CheckCircle2, Clock, Download, Edit, Trash2, Send, Eye,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import AssignmentGradeModal from '../../components/common/AssignmentGradeModal';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [gradeModal, setGradeModal] = useState({ open: false, submission: null });

  const fetchAssignment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  if (loading) {
    return (
      <>
        <PageHeader title="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  if (!assignment) {
    return (
      <>
        <PageHeader title="Devoir introuvable" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Ce devoir n\'existe pas'} />
          <Link to="/assignments" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft size={16} /> Retour
            </Button>
          </Link>
        </main>
      </>
    );
  }

  const statusConf = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.DRAFT;
  const isTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

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

  const submissions = assignment.submissions || [];

  // ═══ RENDU DU SCORE IA ═══
  const renderAIDetection = (sub) => {
    if (!sub.aiDetectionStatus || sub.aiDetectionStatus === 'PENDING') {
      return (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg text-xs text-slate-500 dark:text-slate-400 italic">
          ⏳ Analyse IA en attente...
        </div>
      );
    }

    if (sub.aiDetectionStatus === 'PROCESSING') {
      return (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-600 dark:text-blue-400">
          ⏳ Analyse IA en cours...
        </div>
      );
    }

    if (sub.aiDetectionStatus === 'FAILED') {
      return (
        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-xs text-rose-600 dark:text-rose-400">
          ❌ Analyse IA échouée
        </div>
      );
    }

    if (sub.aiDetectionStatus === 'COMPLETED') {
      const score = Math.round(sub.aiDetectionScore || 0);
      const color =
        score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
      const label =
        score >= 70
          ? '⚠️ Probabilité élevée de contenu IA'
          : score >= 40
          ? '⚠️ Probabilité modérée'
          : '✅ Probabilité faible';
      const textColor =
        score >= 70
          ? 'text-rose-600 dark:text-rose-400'
          : score >= 40
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-emerald-600 dark:text-emerald-400';

      return (
        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <h4 className="text-xs font-semibold text-gray-800 dark:text-slate-200">
              Détection IA
            </h4>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${color}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
          </div>

          <p className={`text-xs mb-2 ${textColor}`}>{label}</p>

          {sub.aiDetectionDetails?.passages?.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium">
                Voir les passages suspects ({sub.aiDetectionDetails.passages.length})
              </summary>
              <ul className="mt-2 space-y-1 text-gray-600 dark:text-slate-400">
                {sub.aiDetectionDetails.passages.map((p, i) => (
                  <li key={i} className="pl-2 border-l-2 border-amber-400">
                    <span className="font-medium">Paragraphe {p.paragraphIndex}</span> — {p.score}%
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 italic">
            ⚠️ Ce score est un indicateur, pas une preuve. L'enseignant garde le contrôle final.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <PageHeader
        title={assignment.title}
        subtitle={`${assignment.course?.code} · ${assignment.course?.title}`}
        badge="Détail du devoir"
        action={
          <Link to="/assignments">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} />
              Retour
            </Button>
          </Link>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                  <ClipboardList size={18} />
                  Instructions
                </h3>
                <Badge color={statusConf.color}>{statusConf.label}</Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                {assignment.instructions}
              </p>

              {assignment.attachmentUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <a
                    href={assignment.attachmentUrl}
                    download
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Download size={14} />
                    {assignment.attachmentName || 'Télécharger le fichier joint'}
                  </a>
                </div>
              )}
            </div>

            {/* Soumissions (enseignant) */}
            {isTeacher && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <User size={18} />
                  Soumissions ({submissions.length})
                </h3>

                {submissions.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Aucune soumission"
                    description="Les soumissions des étudiants apparaîtront ici"
                  />
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => {
                      const subConf = SUBMISSION_STATUS[sub.status] || SUBMISSION_STATUS.SUBMITTED;
                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {sub.student?.firstName?.[0]}{sub.student?.lastName?.[0]}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 dark:text-slate-200">
                                  {sub.student?.firstName} {sub.student?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                                  {sub.student?.matricule || sub.student?.email}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Soumis le {formatDate(sub.submittedAt)}
                                </p>
                                {sub.isLate && (
                                  <Badge color="amber" className="mt-1">En retard</Badge>
                                )}

                                {/* Fichier soumis */}
                                {sub.fileUrl && (
                                  <a
                                    href={sub.fileUrl}
                                    download
                                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                                  >
                                    <Download size={12} />
                                    {sub.fileName || 'Télécharger'}
                                  </a>
                                )}

                                {/* Contenu texte */}
                                {sub.content && (
                                  <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700/50 rounded text-xs text-gray-600 dark:text-slate-300 max-h-20 overflow-y-auto">
                                    {sub.content.substring(0, 200)}
                                    {sub.content.length > 200 && '...'}
                                  </div>
                                )}

                                {/* ═══ DÉTECTION IA ═══ */}
                                {renderAIDetection(sub)}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Badge color={subConf.color}>{subConf.label}</Badge>
                              {sub.score !== null && sub.score !== undefined && (
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                  {sub.score} / {assignment.maxScore}
                                </p>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setGradeModal({ open: true, submission: sub })}
                              >
                                {sub.score !== null ? 'Modifier la note' : 'Noter'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Ma soumission (étudiant) */}
            {isStudent && assignment.submissions?.[0] && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Ma soumission
                </h3>
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Soumis le {formatDate(assignment.submissions[0].submittedAt)}
                  </p>
                  {assignment.submissions[0].content && (
                    <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                        {assignment.submissions[0].content}
                      </p>
                    </div>
                  )}
                  {assignment.submissions[0].fileUrl && (
                    <a
                      href={assignment.submissions[0].fileUrl}
                      download
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Download size={14} />
                      {assignment.submissions[0].fileName}
                    </a>
                  )}
                  {assignment.submissions[0].score !== null && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {assignment.submissions[0].score} / {assignment.maxScore}
                      </p>
                      {assignment.submissions[0].feedback && (
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-2">
                          {assignment.submissions[0].feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Infos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
                Informations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> Date limite
                  </span>
                  <span className="font-medium text-gray-800 dark:text-slate-200">
                    {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Award size={14} /> Note max
                  </span>
                  <span className="font-medium text-gray-800 dark:text-slate-200">
                    {assignment.maxScore} pts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Late</span>
                  <span className="font-medium text-gray-800 dark:text-slate-200">
                    {assignment.allowLateSubmission ? 'Autorisé' : 'Non autorisé'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Re-soumission</span>
                  <span className="font-medium text-gray-800 dark:text-slate-200">
                    {assignment.allowResubmission ? 'Autorisée' : 'Non autorisée'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal notation */}
        <AssignmentGradeModal
          isOpen={gradeModal.open}
          onClose={() => setGradeModal({ open: false, submission: null })}
          onSuccess={() => {
            setSuccess('Note enregistrée');
            fetchAssignment();
            setTimeout(() => setSuccess(''), 3000);
          }}
          assignment={assignment}
          submission={gradeModal.submission}
        />
      </main>
    </>
  );
}