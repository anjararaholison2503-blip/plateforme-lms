import { useState, useEffect } from 'react';
import {
  Award, User, FileText, Download, Send, CheckCircle2, MessageSquare,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import api from '../../services/api';

export default function AssignmentGradeModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
  submission,
}) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    if (isOpen && submission) {
      setScore(submission.score !== null && submission.score !== undefined ? submission.score : '');
      setFeedback(submission.feedback || '');
      setError('');
    }
  }, [isOpen, submission]);

  const handleGrade = async () => {
    if (score === '' || isNaN(parseFloat(score))) {
      setError('Veuillez saisir une note valide');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post(`/assignments/submissions/${submission.id}/grade`, {
        score: parseFloat(score),
        feedback: feedback || null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la notation');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async () => {
    setReturning(true);
    setError('');

    try {
      await api.post(`/assignments/submissions/${submission.id}/return`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors du retour');
    } finally {
      setReturning(false);
    }
  };

  if (!submission || !assignment) return null;

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

  const isGraded = submission.status === 'GRADED' || submission.status === 'RETURNED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Noter la soumission"
      subtitle={assignment.title}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          {isGraded && submission.status === 'GRADED' && (
            <Button variant="secondary" onClick={handleReturn} loading={returning}>
              <Send size={16} />
              Retourner à l'étudiant
            </Button>
          )}
          <Button onClick={handleGrade} loading={saving}>
            <CheckCircle2 size={16} />
            {isGraded ? 'Modifier la note' : 'Enregistrer la note'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Info étudiant */}
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
              {submission.student?.firstName?.[0]}{submission.student?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-slate-200">
                {submission.student?.firstName} {submission.student?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                {submission.student?.matricule || submission.student?.email}
              </p>
            </div>
            {submission.isLate && (
              <Badge color="amber">En retard</Badge>
            )}
          </div>
        </div>

        {/* Contenu soumis */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FileText size={14} />
            Contenu soumis
          </h3>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            {submission.content ? (
              <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                {submission.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucun texte soumis</p>
            )}

            {submission.fileUrl && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <a
                  href={submission.fileUrl}
                  download
                  className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Download size={14} />
                  {submission.fileName || 'Télécharger le fichier'}
                </a>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Soumis le {formatDate(submission.submittedAt)}
          </p>
        </div>

        {/* Note + Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={`Note (sur ${assignment.maxScore}) *`}
            type="number"
            min="0"
            max={assignment.maxScore}
            step="0.5"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Ex: 15"
            icon={Award}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <MessageSquare size={14} />
            Feedback (optionnel)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Commentaires pour l'étudiant..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>
      </div>
    </Modal>
  );
}