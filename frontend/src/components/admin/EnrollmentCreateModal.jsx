import { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Phone, Calendar, GraduationCap } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import api from '../../services/api';


const emptyForm = {
  applicantName: '',
  applicantEmail: '',
  firstName: '',
  lastName: '',
  gender: '',
  birthDate: '',
  nationality: '',
  phone: '',
  address: '',
  academicYear: '2025-2026',
  desiredClassId: '',
};

export default function EnrollmentCreateModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [classes, setClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setError('');

      api.get('/institution/units?type=CLASS')
        .then((res) => setClasses(res.data.data || []))
        .catch(() => setClasses([]));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        applicantName: formData.applicantName || `${formData.lastName} ${formData.firstName}`.trim(),
        applicantEmail: formData.applicantEmail,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender || null,
          birthDate: formData.birthDate || null,
          nationality: formData.nationality || null,
        },
        contactInfo: {
          phone: formData.phone || null,
          address: formData.address || null,
        },
        academicYear: formData.academicYear,
        desiredClassId: formData.desiredClassId ? parseInt(formData.desiredClassId) : null,
      };

      await api.post('/enrollments', payload);
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
      title="Nouvelle inscription"
      subtitle="Création manuelle d'une inscription par l'administrateur"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} loading={saving}>
            <UserPlus size={16} />
            Créer l'inscription
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Informations personnelles */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <User size={14} />
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value.toUpperCase() })}
              placeholder="RAKOTO"
              required
            />
            <Input
              label="Prénom(s) *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Marie"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Genre
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">— Sélectionner —</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <Input
              label="Date de naissance"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
            <Input
              label="Nationalité"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              placeholder="Malagasy"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Mail size={14} />
            Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.applicantEmail}
              onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
              placeholder="marie.rakoto@email.mg"
              required
            />
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+261 34 12 345 67"
            />
            <div className="md:col-span-2">
              <Input
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Antananarivo, Madagascar"
              />
            </div>
          </div>
        </div>

        {/* Choix pédagogique */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <GraduationCap size={14} />
            Choix pédagogique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Classe souhaitée
              </label>
              <select
                value={formData.desiredClassId}
                onChange={(e) => setFormData({ ...formData, desiredClassId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">— Sélectionner —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-xs text-indigo-800 dark:text-indigo-300">
            💡 L'inscription sera créée avec le statut <strong>"À payer"</strong> et les factures seront générées automatiquement selon l'échéancier.
          </p>
        </div>
      </form>
    </Modal>
  );
}