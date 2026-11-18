import { useState, useEffect } from 'react';
import { FileText, User, DollarSign, Calendar, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';

const emptyForm = {
  studentId: '',
  feeId: '',
  amount: '',
  currency: 'MGA',
  dueDate: '',
  notes: '',
};

export default function InvoiceCreateModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setError('');

      Promise.all([
        api.get('/users?role=STUDENT&limit=500').catch(() => ({ data: { data: [] } })),
        api.get('/finance/fees').catch(() => ({ data: { data: [] } })),
      ]).then(([studentsRes, feesRes]) => {
        setStudents(studentsRes.data.data || []);
        setFees(feesRes.data.data || []);
      });
    }
  }, [isOpen]);

  const selectedFee = fees.find((f) => f.id === parseInt(formData.feeId));

  useEffect(() => {
    if (selectedFee && !formData.amount) {
      setFormData((prev) => ({
        ...prev,
        amount: selectedFee.amount,
        currency: selectedFee.currency,
      }));
    }
  }, [selectedFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        studentId: parseInt(formData.studentId),
        feeId: parseInt(formData.feeId),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        dueDate: formData.dueDate || new Date().toISOString(),
        notes: formData.notes || null,
      };

      await api.post('/finance/invoices', payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle facture"
      subtitle="Créez manuellement une facture pour un étudiant"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <FileText size={16} />
            Créer la facture
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Étudiant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <User size={14} />
            Étudiant *
          </label>
          <select
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">— Sélectionner un étudiant —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.email})
              </option>
            ))}
          </select>
        </div>

        {/* Frais */}
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

        {/* Montant + Devise */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Montant *"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
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
              <option value="MGA">MGA</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Échéance */}
        <Input
          label="Date d'échéance *"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-2">
          <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            L'étudiant recevra une notification de la nouvelle facture. Vous pourrez ensuite enregistrer les paiements.
          </p>
        </div>
      </form>
    </Modal>
  );
}