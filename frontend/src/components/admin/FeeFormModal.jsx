import { useState, useEffect } from 'react';
import { DollarSign, Layers, Building2, Calendar, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const emptyForm = {
  feeTypeId: '',
  classId: '',
  levelId: '',
  academicYear: '2025-2026',
  amount: '',
  currency: 'MGA',
  dueDate: '',
  isActive: true,
  notes: '',
};

export default function FeeFormModal({
  isOpen,
  onClose,
  onSuccess,
  fee = null,
  feeTypes = [],
  classes = [],
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!fee;

  useEffect(() => {
    if (isOpen) {
      if (fee) {
        setFormData({
          feeTypeId: fee.feeTypeId,
          classId: fee.classId || '',
          levelId: fee.levelId || '',
          academicYear: fee.academicYear,
          amount: fee.amount,
          currency: fee.currency || 'MGA',
          dueDate: fee.dueDate ? fee.dueDate.slice(0, 10) : '',
          isActive: fee.isActive,
          notes: fee.notes || '',
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, fee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        feeTypeId: parseInt(formData.feeTypeId),
        classId: formData.classId ? parseInt(formData.classId) : null,
        levelId: formData.levelId ? parseInt(formData.levelId) : null,
        academicYear: formData.academicYear,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        dueDate: formData.dueDate || null,
        isActive: formData.isActive,
        notes: formData.notes || null,
      };

      if (isEdit) {
        await api.put(`/finance/fees/${fee.id}`, payload);
      } else {
        await api.post('/finance/fees', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const selectedFeeType = feeTypes.find((t) => t.id === parseInt(formData.feeTypeId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier le frais' : 'Nouveau frais'}
      subtitle="Configurez un frais pour une classe et une année académique"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <DollarSign size={16} />
            {isEdit ? 'Enregistrer' : 'Créer le frais'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Type de frais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <Layers size={14} />
            Type de frais *
          </label>
          <select
            value={formData.feeTypeId}
            onChange={(e) => setFormData({ ...formData, feeTypeId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">— Sélectionner un type —</option>
            {feeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code}) {t.isRecurring ? '· Récurrent' : ''}
              </option>
            ))}
          </select>
          {selectedFeeType?.isRecurring && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
              <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Ce type est <strong>récurrent</strong>. Le montant sera divisé en échéances mensuelles lors de la facturation.
              </p>
            </div>
          )}
        </div>

        {/* Classe + Niveau */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Building2 size={14} />
              Classe
            </label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="">— Aucune (frais général) —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Si aucune classe, ce frais s'applique à tous les étudiants.
            </p>
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
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
        </div>

        {/* Montant */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Montant *"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1500000"
              required
              icon={DollarSign}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Devise
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="MGA">MGA (Ariary)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
        </div>

        {/* Date d'échéance */}
        <Input
          label="Date d'échéance (optionnelle)"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Notes internes sur ce frais..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Actif */}
        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Frais actif
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Les frais inactifs ne génèrent pas de nouvelles factures.
            </p>
          </div>
        </label>
      </form>
    </Modal>
  );
}