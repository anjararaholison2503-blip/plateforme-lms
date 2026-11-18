import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Building2, School, Settings, ArrowRight, ArrowLeft,
  Check, CheckCircle2, Sparkles, Palette, AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useHierarchy } from '../../contexts/HierarchyContext';
import api from '../../services/api';

const STEPS = [
  { id: 1, title: 'Type d\'établissement', icon: Building2 },
  { id: 2, title: 'Structure', icon: Settings },
  { id: 3, title: 'Informations', icon: GraduationCap },
  { id: 4, title: 'Personnalisation', icon: Palette },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useHierarchy();

  const [step, setStep] = useState(1);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [institutionType, setInstitutionType] = useState('UNIVERSITY');
  const [customLevels, setCustomLevels] = useState([]);
  const [customAllowedChildren, setCustomAllowedChildren] = useState({});

  const [establishment, setEstablishment] = useState({
    name: '',
    code: 'ROOT',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    academicYear: '2025-2026',
    currency: 'MGA',
    currencySymbol: 'Ar',
  });

  const [customLabels, setCustomLabels] = useState({});

  useEffect(() => {
    api.get('/hierarchy/presets')
      .then((res) => setPresets(res.data.data))
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (institutionType === 'CUSTOM' && customLevels.length === 0) {
      const defaultLevels = [
        { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️', enabled: true },
        { type: 'FACULTY',       label: 'Faculté',       pluralLabel: 'Facultés',       icon: '🏫', enabled: true },
        { type: 'DEPARTMENT',    label: 'Département',   pluralLabel: 'Départements',   icon: '📚', enabled: false },
        { type: 'PROGRAM',       label: 'Programme',     pluralLabel: 'Programmes',     icon: '🎓', enabled: false },
        { type: 'LEVEL',         label: 'Niveau',        pluralLabel: 'Niveaux',        icon: '📊', enabled: true },
        { type: 'CLASS',         label: 'Classe',        pluralLabel: 'Classes',        icon: '👥', enabled: true },
        { type: 'GROUP',         label: 'Groupe',        pluralLabel: 'Groupes',        icon: '👨‍👩‍👧', enabled: false },
      ];
      setCustomLevels(defaultLevels);
    }
  }, [institutionType]);

  const goNext = () => {
    if (step < 4) {
      setError('');
      setStep(step + 1);
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setError('');
      setStep(step - 1);
    }
  };

  const isStep1Valid = () => institutionType !== '';
  const isStep2Valid = () => {
    if (institutionType !== 'CUSTOM') return true;
    const enabled = customLevels.filter((l) => l.enabled);
    return enabled.length >= 2;
  };
  const isStep3Valid = () => establishment.name.trim().length >= 2;

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        institutionType,
        establishment: {
          name: establishment.name,
          code: establishment.code,
          description: establishment.description,
        },
        customLabels: Object.keys(customLabels).length > 0 ? customLabels : null,
      };

      if (institutionType === 'CUSTOM') {
        const enabledLevels = customLevels.filter((l) => l.enabled);
        const allowedChildren = {};

        for (let i = 0; i < enabledLevels.length - 1; i++) {
          allowedChildren[enabledLevels[i].type] = [enabledLevels[i + 1].type];
        }
        allowedChildren[enabledLevels[enabledLevels.length - 1].type] = [];

        payload.customModel = {
          name: 'Personnalisé',
          description: `Structure personnalisée : ${enabledLevels.map((l) => l.label).join(' → ')}`,
          levels: enabledLevels,
          allowedChildren,
        };
      }

      await api.post('/hierarchy/setup', payload);

      await api.put('/settings', {
        platformName: establishment.name,
        platformShortName: establishment.code,
        academicYear: establishment.academicYear,
        currency: establishment.currency,
        currencySymbol: establishment.currencySymbol,
        contactEmail: establishment.contactEmail || null,
        contactPhone: establishment.contactPhone || null,
        address: establishment.address || null,
      });

      setSuccess('Configuration réussie ! Redirection...');
      await refresh();

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.userMessage);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Bienvenue sur MonCampus
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Configurons ensemble votre plateforme en 4 étapes
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step > s.id
                        ? 'bg-green-500 text-white'
                        : step === s.id
                        ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {step > s.id ? <Check size={20} /> : <s.icon size={18} />}
                  </div>
                  <p
                    className={`text-xs mt-2 font-medium ${
                      step >= s.id
                        ? 'text-gray-800 dark:text-slate-200'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      step > s.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}
          {success && (
            <div className="mb-4">
              <Alert type="success" message={success} />
            </div>
          )}

          {step === 1 && <Step1Type
            presets={presets}
            institutionType={institutionType}
            setInstitutionType={setInstitutionType}
          />}

          {step === 2 && <Step2Structure
            institutionType={institutionType}
            customLevels={customLevels}
            setCustomLevels={setCustomLevels}
            presets={presets}
          />}

          {step === 3 && <Step3Info
            establishment={establishment}
            setEstablishment={setEstablishment}
          />}

          {step === 4 && <Step4Customization
            institutionType={institutionType}
            customLevels={customLevels}
            customLabels={customLabels}
            setCustomLabels={setCustomLabels}
            presets={presets}
            establishment={establishment}
          />}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={step === 1}
            >
              <ArrowLeft size={16} />
              Retour
            </Button>

            {step < 4 ? (
              <Button
                onClick={goNext}
                disabled={
                  (step === 1 && !isStep1Valid()) ||
                  (step === 2 && !isStep2Valid()) ||
                  (step === 3 && !isStep3Valid())
                }
              >
                Suivant
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={saving}>
                <CheckCircle2 size={16} />
                Terminer la configuration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1Type({ presets, institutionType, setInstitutionType }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
        Quel type d'établissement gérez-vous ?
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Cela déterminera la structure hiérarchique de votre plateforme.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => setInstitutionType(preset.key)}
            className={`text-left p-5 rounded-xl border-2 transition-all ${
              institutionType === preset.key
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                : 'border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${
                  institutionType === preset.key
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'bg-gray-100 dark:bg-slate-700'
                }`}
              >
                {preset.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                    {preset.name}
                  </h3>
                  {institutionType === preset.key && (
                    <CheckCircle2 size={18} className="text-primary-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2Structure({ institutionType, customLevels, setCustomLevels, presets }) {
  if (institutionType !== 'CUSTOM') {
    const preset = presets.find((p) => p.key === institutionType);
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
          Structure : {preset?.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Voici la structure qui sera appliquée à votre établissement :
        </p>

        <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="flex flex-wrap items-center gap-2">
            {preset?.key === 'UNIVERSITY' && (
              <>
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🏛️ Établissement</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🏫 Faculté</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">📚 Département</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🎓 Filière</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">📊 Niveau</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">👥 Classe</span>
              </>
            )}
            {preset?.key === 'HIGH_SCHOOL' && (
              <>
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🏛️ Établissement</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🎓 Série</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">📊 Niveau</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">👥 Classe</span>
              </>
            )}
            {preset?.key === 'MIDDLE_SCHOOL' && (
              <>
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">🏛️ Établissement</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">📊 Niveau</span>
                <ArrowRight size={16} className="text-primary-600" />
                <span className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">👥 Classe</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">
            💡 Vous pourrez personnaliser le vocabulaire à l'étape 4.
          </p>
        </div>
      </div>
    );
  }

  const toggleLevel = (type) => {
    if (type === 'ESTABLISHMENT') return;
    setCustomLevels(
      customLevels.map((l) =>
        l.type === type ? { ...l, enabled: !l.enabled } : l
      )
    );
  };

  const updateLevelLabel = (type, field, value) => {
    setCustomLevels(
      customLevels.map((l) =>
        l.type === type ? { ...l, [field]: value } : l
      )
    );
  };

  const enabledCount = customLevels.filter((l) => l.enabled).length;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
        Construisez votre structure
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Activez les niveaux que vous souhaitez utiliser et renommez-les si nécessaire.
      </p>

      <div className="space-y-3">
        {customLevels.map((level) => (
          <div
            key={level.type}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
              level.enabled
                ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'
            }`}
          >
            <button
              onClick={() => toggleLevel(level.type)}
              disabled={level.type === 'ESTABLISHMENT'}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                level.enabled
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 dark:border-slate-600'
              } ${level.type === 'ESTABLISHMENT' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {level.enabled && <Check size={14} />}
            </button>

            <span className="text-2xl">{level.icon}</span>

            <input
              type="text"
              value={level.label}
              onChange={(e) => updateLevelLabel(level.type, 'label', e.target.value)}
              disabled={!level.enabled}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 disabled:opacity-50"
            />

            <input
              type="text"
              value={level.pluralLabel}
              onChange={(e) => updateLevelLabel(level.type, 'pluralLabel', e.target.value)}
              disabled={!level.enabled}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 disabled:opacity-50"
              placeholder="Pluriel"
            />
          </div>
        ))}
      </div>

      {enabledCount < 2 && (
        <div className="mt-4">
          <Alert
            type="warning"
            message="Activez au moins 2 niveaux (Établissement + 1 autre)"
          />
        </div>
      )}
    </div>
  );
}

function Step3Info({ establishment, setEstablishment }) {
  const update = (field, value) => {
    setEstablishment({ ...establishment, [field]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
        Informations de l'établissement
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Ces informations apparaîtront sur la plateforme.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Nom de l'établissement *"
            value={establishment.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Université de Madagascar"
            required
          />
        </div>

        <Input
          label="Code"
          value={establishment.code}
          onChange={(e) => update('code', e.target.value.toUpperCase())}
          placeholder="Ex: UDM"
        />

        <Input
          label="Année académique"
          value={establishment.academicYear}
          onChange={(e) => update('academicYear', e.target.value)}
          placeholder="2025-2026"
        />

        <Input
          label="Email de contact"
          type="email"
          value={establishment.contactEmail}
          onChange={(e) => update('contactEmail', e.target.value)}
          placeholder="contact@etablissement.mg"
        />

        <Input
          label="Téléphone"
          value={establishment.contactPhone}
          onChange={(e) => update('contactPhone', e.target.value)}
          placeholder="+261 20 22 XXX XX"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Adresse
          </label>
          <textarea
            value={establishment.address}
            onChange={(e) => update('address', e.target.value)}
            rows={2}
            placeholder="Adresse complète..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <Input
          label="Devise"
          value={establishment.currency}
          onChange={(e) => update('currency', e.target.value.toUpperCase())}
          placeholder="MGA"
        />

        <Input
          label="Symbole de la devise"
          value={establishment.currencySymbol}
          onChange={(e) => update('currencySymbol', e.target.value)}
          placeholder="Ar"
        />
      </div>
    </div>
  );
}

function Step4Customization({ institutionType, customLevels, customLabels, setCustomLabels, presets, establishment }) {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    if (institutionType === 'CUSTOM') {
      setLevels(customLevels.filter((l) => l.enabled));
    } else {
      api.get('/hierarchy/current').then((res) => {
        setLevels(res.data.data.levels);
      }).catch(() => {
        const defaults = {
          UNIVERSITY: [
            { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
            { type: 'FACULTY', label: 'Faculté', pluralLabel: 'Facultés', icon: '🏫' },
            { type: 'DEPARTMENT', label: 'Département', pluralLabel: 'Départements', icon: '📚' },
            { type: 'PROGRAM', label: 'Filière', pluralLabel: 'Filières', icon: '🎓' },
            { type: 'LEVEL', label: 'Niveau', pluralLabel: 'Niveaux', icon: '📊' },
            { type: 'CLASS', label: 'Classe', pluralLabel: 'Classes', icon: '👥' },
          ],
          HIGH_SCHOOL: [
            { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
            { type: 'PROGRAM', label: 'Série', pluralLabel: 'Séries', icon: '🎓' },
            { type: 'LEVEL', label: 'Niveau', pluralLabel: 'Niveaux', icon: '📊' },
            { type: 'CLASS', label: 'Classe', pluralLabel: 'Classes', icon: '👥' },
          ],
          MIDDLE_SCHOOL: [
            { type: 'ESTABLISHMENT', label: 'Établissement', pluralLabel: 'Établissements', icon: '🏛️' },
            { type: 'LEVEL', label: 'Niveau', pluralLabel: 'Niveaux', icon: '📊' },
            { type: 'CLASS', label: 'Classe', pluralLabel: 'Classes', icon: '👥' },
          ],
        };
        setLevels(defaults[institutionType] || []);
      });
    }
  }, [institutionType, customLevels, presets]);

  const updateLabel = (type, field, value) => {
    setCustomLabels({
      ...customLabels,
      [type]: {
        ...(customLabels[type] || {}),
        [field]: value,
      },
    });
  };

  const getCurrentLabel = (level, field) => {
    return customLabels[level.type]?.[field] ?? level[field];
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-2">
        Personnalisation du vocabulaire
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Renommez les types d'unités selon le vocabulaire de votre établissement. Laissez vide pour garder les valeurs par défaut.
      </p>

      <div className="space-y-3 mb-6">
        {levels.map((level) => (
          <div
            key={level.type}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700"
          >
            <span className="text-2xl">{level.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                Type technique : <code className="font-mono">{level.type}</code>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={getCurrentLabel(level, 'label')}
                  onChange={(e) => updateLabel(level.type, 'label', e.target.value)}
                  placeholder={level.label}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  value={getCurrentLabel(level, 'pluralLabel')}
                  onChange={(e) => updateLabel(level.type, 'pluralLabel', e.target.value)}
                  placeholder={level.pluralLabel}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-green-600" />
          Récapitulatif de la configuration
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-slate-400">Type</dt>
            <dd className="font-medium text-gray-800 dark:text-slate-200">
              {presets.find((p) => p.key === institutionType)?.name}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-slate-400">Établissement</dt>
            <dd className="font-medium text-gray-800 dark:text-slate-200">
              {establishment.name || '(non renseigné)'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-slate-400">Code</dt>
            <dd className="font-medium text-gray-800 dark:text-slate-200">
              {establishment.code || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-slate-400">Année académique</dt>
            <dd className="font-medium text-gray-800 dark:text-slate-200">
              {establishment.academicYear || '—'}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">
          💡 Cliquez sur "Terminer la configuration" pour créer votre établissement.
        </p>
      </div>
    </div>
  );
}