import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, GraduationCap,
  CheckCircle2, XCircle, Clock, FileText, AlertCircle, Building2,
  CreditCard, FileCheck, Plus, Trash2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EnrollmentApprovalModal from '../../components/admin/EnrollmentApprovalModal';
import EnrollmentRejectionModal from '../../components/admin/EnrollmentRejectionModal';
import api from '../../services/api';

const STATUS_CONFIG = {
  PENDING_DOCUMENTS: { label: 'Documents manquants', color: 'gray' },
  PENDING_REVIEW: { label: 'En attente', color: 'yellow' },
  PENDING_PAYMENT: { label: 'À payer', color: 'amber' },
  ENROLLED: { label: 'Inscrit', color: 'green' },
  COMPLETED: { label: 'Terminé', color: 'blue' },
  REPEATED: { label: 'Redoublé', color: 'purple' },
  FAILED: { label: 'Échec', color: 'red' },
  WITHDRAWN: { label: 'Abandon', color: 'gray' },
  CANCELLED: { label: 'Annulé', color: 'gray' },
  REJECTED: { label: 'Rejeté', color: 'red' },
};

export default function EnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  const fetchEnrollment = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/enrollments/${id}`);
      setEnrollment(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollment();
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

  if (!enrollment) {
    return (
      <>
        <PageHeader title="Inscription introuvable" />
        <main className="flex-1 p-8">
          <Alert type="error" message={error || 'Cette inscription n\'existe pas'} />
          <Link to="/enrollments" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft size={16} /> Retour
            </Button>
          </Link>
        </main>
      </>
    );
  }

  const config = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.PENDING_REVIEW;
  const canApprove = ['PENDING_REVIEW', 'PENDING_DOCUMENTS'].includes(enrollment.status);
  const canReject = ['PENDING_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_PAYMENT'].includes(enrollment.status);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title={enrollment.applicantName}
        subtitle={`Référence : ${enrollment.reference}`}
        badge="Détails de l'inscription"
        action={
          <div className="flex gap-2">
            <Link to="/enrollments">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
            {canApprove && (
              <Button size="sm" onClick={() => setApproveModal(true)}>
                <CheckCircle2 size={16} />
                Valider
              </Button>
            )}
            {canReject && (
              <Button variant="danger" size="sm" onClick={() => setRejectModal(true)}>
                <XCircle size={16} />
                Rejeter
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        {/* Bandeau de statut */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center">
                <User size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                  {enrollment.applicantName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {enrollment.applicantEmail}
                </p>
              </div>
            </div>
            <Badge color={config.color}>
              <span className="text-sm">{config.label}</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <User size={18} />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Prénom" value={enrollment.personalInfo?.firstName} />
                <InfoRow label="Nom" value={enrollment.personalInfo?.lastName} />
                <InfoRow label="Date de naissance" value={formatDate(enrollment.personalInfo?.birthDate)} />
                <InfoRow label="Genre" value={enrollment.personalInfo?.gender === 'F' ? 'Féminin' : enrollment.personalInfo?.gender === 'M' ? 'Masculin' : '—'} />
                <InfoRow label="Nationalité" value={enrollment.personalInfo?.nationality} />
                <InfoRow label="Lieu de naissance" value={enrollment.personalInfo?.birthPlace} />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Mail size={18} />
                Contact
              </h3>
              <div className="space-y-3">
                <ContactRow icon={Mail} label="Email" value={enrollment.applicantEmail} />
                <ContactRow icon={Phone} label="Téléphone" value={enrollment.contactInfo?.phone} />
                <ContactRow icon={MapPin} label="Adresse" value={enrollment.contactInfo?.address} />
              </div>
            </div>

            {/* Formation antérieure */}
            {enrollment.previousEducation && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <GraduationCap size={18} />
                  Formation antérieure
                </h3>
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(enrollment.previousEducation, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Documents */}
            {enrollment.documents && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Documents uploadés
                </h3>
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  <pre className="whitespace-pre-wrap font-sans">
                    {JSON.stringify(enrollment.documents, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Choix pédagogique */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Building2 size={18} />
                Choix pédagogique
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Classe souhaitée</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200">
                    {enrollment.desiredClass?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Année académique</p>
                  <p className="font-medium text-gray-800 dark:text-slate-200">
                    {enrollment.academicYear}
                  </p>
                </div>
                {enrollment.isReenrollment && (
                  <div>
                    <Badge color="cyan">Réinscription</Badge>
                  </div>
                )}
                {enrollment.isRepeating && (
                  <div>
                    <Badge color="purple">Redoublant</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Calendar size={18} />
                Dates
              </h3>
              <div className="space-y-3 text-sm">
                <DateRow label="Créée le" value={formatDate(enrollment.createdAt)} />
                {enrollment.reviewedAt && (
                  <DateRow label="Validée le" value={formatDate(enrollment.reviewedAt)} />
                )}
              </div>
            </div>

            {/* Notes internes */}
            {enrollment.reviewNotes && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Notes internes
                </h3>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  {enrollment.reviewNotes}
                </p>
              </div>
            )}

            {/* Motif de rejet */}
            {enrollment.rejectionReason && (
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 p-6">
                <h3 className="font-semibold text-rose-900 dark:text-rose-200 mb-4 flex items-center gap-2">
                  <XCircle size={18} />
                  Motif du rejet
                </h3>
                <p className="text-sm text-rose-800 dark:text-rose-300">
                  {enrollment.rejectionReason}
                </p>
              </div>
            )}

            {/* Factures */}
            {enrollment.invoices && enrollment.invoices.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <CreditCard size={18} />
                  Factures ({enrollment.invoices.length})
                </h3>
                <div className="space-y-2">
                  {enrollment.invoices.slice(0, 5).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-xs">
                      <div>
                        <p className="font-mono text-gray-600 dark:text-slate-400">{inv.reference}</p>
                        <p className="text-gray-500 dark:text-slate-400">{inv.fee?.feeType?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-slate-200">
                          {new Intl.NumberFormat('fr-FR').format(inv.amount)} {inv.currency}
                        </p>
                        <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'yellow'}>
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <EnrollmentApprovalModal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        onSuccess={() => {
          setSuccess('Inscription validée avec succès');
          fetchEnrollment();
          setTimeout(() => setSuccess(''), 3000);
        }}
        enrollment={enrollment}
      />

      <EnrollmentRejectionModal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        onSuccess={() => {
          setSuccess('Inscription rejetée');
          fetchEnrollment();
          setTimeout(() => setSuccess(''), 3000);
        }}
        enrollment={enrollment}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mt-0.5">
        {value || '—'}
      </p>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-gray-500 dark:text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mt-0.5">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function DateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-slate-200">{value}</span>
    </div>
  );
}