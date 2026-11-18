import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Upload, X, Calendar, Globe, DollarSign, Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';
import { useHierarchy } from '../../contexts/HierarchyContext';
import { usePlatform } from '../../contexts/PlatformContext';

const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

export default function Settings() {
  // ═══════════════ ÉTATS ═══════════════

  const [formData, setFormData] = useState({
    platformName: '',
    platformShortName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    academicYear: '2025-2026',
    currency: 'MGA',
    currencySymbol: 'Ar',
    academicMonthsCount: 9,
    academicStartMonth: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refresh } = useHierarchy();

  // ═══════════════ CHARGEMENT ═══════════════
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      const data = res.data.data || {};
      setFormData({
        platformName: data.platformName || '',
        platformShortName: data.platformShortName || '',
        description: data.description || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        academicYear: data.academicYear || '2025-2026',
        currency: data.currency || 'MGA',
        currencySymbol: data.currencySymbol || 'Ar',
        academicMonthsCount: data.academicMonthsCount || 9,
        academicStartMonth: data.academicStartMonth || 10,
      });
      setError('');
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ═══════════════ SAUVEGARDE ═══════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/settings', formData);
          // ⬇️ AJOUTE CES LIGNES
    if (typeof refresh === 'function') {
      await refresh();
    }
      setSuccess('Paramètres enregistrés avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ═══════════════ RENDER ═══════════════
  if (loading) {
    return (
      <>
        <PageHeader title="Paramètres" subtitle="Chargement..." />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Paramètres"
        subtitle="Configuration de la plateforme"
        badge="Administrateur"
        action={
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Save size={16} />
            Enregistrer
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ═══════════════ IDENTITÉ ═══════════════ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <SettingsIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">Identité de la plateforme</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Nom, slogan, description</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de la plateforme"
                value={formData.platformName}
                onChange={(e) => update('platformName', e.target.value)}
                placeholder="MASTERCLASS"
              />
              <Input
                label="Nom court"
                value={formData.platformShortName}
                onChange={(e) => update('platformShortName', e.target.value)}
                placeholder="MC"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* ═══════════════ CONFIGURATION ACADÉMIQUE ═══════════════ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">Configuration académique</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Année, devise, mois de scolarité</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Année académique"
                value={formData.academicYear}
                onChange={(e) => update('academicYear', e.target.value)}
                placeholder="2025-2026"
                icon={Calendar}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Devise"
                  value={formData.currency}
                  onChange={(e) => update('currency', e.target.value.toUpperCase())}
                  placeholder="MGA"
                  icon={DollarSign}
                />
                <Input
                  label="Symbole"
                  value={formData.currencySymbol}
                  onChange={(e) => update('currencySymbol', e.target.value)}
                  placeholder="Ar"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Nombre de mois de scolarité *
                </label>
                <select
                  value={formData.academicMonthsCount || 9}
                  onChange={(e) => update('academicMonthsCount', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value={9}>9 mois (Octobre → Juin)</option>
                  <option value={10}>10 mois (Octobre → Juillet)</option>
                  <option value={11}>11 mois (Octobre → Août)</option>
                  <option value={12}>12 mois (année complète)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Nombre de mensualités pour la scolarité
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Mois de début *
                </label>
                <select
                  value={formData.academicStartMonth || 10}
                  onChange={(e) => update('academicStartMonth', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Premier mois de l'année scolaire
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                📅 <strong>Aperçu :</strong> La scolarité sera divisée en{' '}
                <strong>{formData.academicMonthsCount || 9} mensualités</strong>
                {formData.academicStartMonth && (
                  <>
                    , débutant en{' '}
                    <strong>
                      {MONTHS.find((m) => m.value === formData.academicStartMonth)?.label || 'Octobre'}
                    </strong>
                  </>
                )}
                .
              </p>
            </div>
          </div>

          {/* ═══════════════ CONTACT ═══════════════ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">Contact</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">Email, téléphone, adresse</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email de contact"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                placeholder="contact@lms.mg"
                icon={Mail}
              />
              <Input
                label="Téléphone"
                value={formData.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                placeholder="+261 20 22 XXX XX"
                icon={Phone}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Adresse
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => update('address', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* ═══════════════ BOUTON SAUVEGARDER ═══════════════ */}
          <div className="flex justify-end">
            <Button type="submit" loading={saving} size="lg">
              <Save size={18} />
              Enregistrer les paramètres
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}