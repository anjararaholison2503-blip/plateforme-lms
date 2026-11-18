import { useState, useEffect } from 'react';
import { Zap, Building2, DollarSign, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import api from '../../services/api';

export default function BulkGenerateModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    classId: '',
    feeId: '',
    academicYear: '2025-2026',
  });
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ classId: '', feeId: '', academicYear: '2025-2026' });
      setError('');
      setResult(null);

      Promise.all([
        api.get('/institution/units?type=CLASS').catch(() => ({ data: { data: [] } })),
        api.get('/finance/fees').catch(() => ({ data: { data: [] } })),
      ]).then(([classesRes, feesRes]) => {
        setClasses(classesRes.data.data || []);
        setFees(feesRes.data.data || []);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/finance/invoices/bulk-generate', {
        classId: parseInt(formData.classId),
        feeId: parseInt(formData.feeId),
        academicYear: formData.academicYear,
      });

      setResult(res.data.data);
      setTimeout(() => {
        onSuccess(res.data.data);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la génération');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Générer les factures en masse"
      subtitle="Créez automatiquement les factures pour toute une classe"
      size="lg"
      footer={
        !result ? (
          <>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSubmit} loading={saving}>
              <Zap size={16} />
              Générer les factures
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Fermer</Button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {result ? (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Génération terminée !
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  {result.count} facture(s) générée(s) sur {result.total} étudiant(s).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Building2 size={14} />
                Classe *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                required
              >
                <option value="">— Sélectionner une classe —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <DollarSign size={14} />
                Type de frais *
              </label>
              <select
                value={formData.feeId}
                onChange={(e) => setFormData({ ...formData, feeId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                required
              >
                <option value="">— Sélectionner un frais —</option>
                {fees.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.feeType?.name} — {f.class?.name || 'Général'} — {new Intl.NumberFormat('fr-FR').format(f.amount)} {f.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Calendar size={14} />
                Année académique *
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                required
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ Cette action va créer des factures pour <strong>tous les étudiants</strong> de la classe sélectionnée.
                Les factures existantes pour ce frais seront ignorées.
              </p>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}