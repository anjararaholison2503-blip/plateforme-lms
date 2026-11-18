import { useState } from 'react';
import {
  User, Mail, GraduationCap, FileText, CheckCircle2, ArrowLeft, ArrowRight,
  Check, Sparkles, AlertCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import Step1PersonalInfo from './steps/Step1PersonalInfo';
import Step2Contact from './steps/Step2Contact';
import Step3Education from './steps/Step3Education';
import Step4Program from './steps/Step4Program';
import Step5Confirmation from './steps/Step5Confirmation';
import api from '../../services/api';

const STEPS = [
  { id: 1, title: 'Identité', icon: User },
  { id: 2, title: 'Contact', icon: Mail },
  { id: 3, title: 'Formation', icon: GraduationCap },
  { id: 4, title: 'Filière & Documents', icon: FileText },
  { id: 5, title: 'Récapitulatif', icon: CheckCircle2 },
];

const ACADEMIC_YEAR = '2025-2026';

export default function EnrollmentWizard({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // État global du formulaire
  const [formData, setFormData] = useState({
    // Étape 1 : Identité
    lastName: '',
    firstName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    nationality: 'Malagasy',

    // Étape 2 : Contact
    email: '',
    phone: '',
    city: '',
    address: '',

    // Étape 3 : Formation
    diplomas: [],

    // Étape 4 : Filière & Documents
    desiredProgramId: '',
    desiredLevelId: '',
    documents: {},
  });

  // ═══════════════════════════════════════════════════════════
  // VALIDATION PAR ÉTAPE
  // ═══════════════════════════════════════════════════════════
  const validateStep = (currentStep) => {
    const errs = {};

    if (currentStep === 1) {
      if (!formData.lastName?.trim()) errs.lastName = 'Le nom est requis';
      if (!formData.firstName?.trim()) errs.firstName = 'Le prénom est requis';
      if (!formData.gender) errs.gender = 'Le genre est requis';
      if (!formData.birthDate) errs.birthDate = 'La date de naissance est requise';
      if (!formData.nationality?.trim()) errs.nationality = 'La nationalité est requise';
    }

    if (currentStep === 2) {
      if (!formData.email?.trim()) errs.email = 'L\'email est requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errs.email = 'Email invalide';
      }
      if (!formData.phone?.trim()) errs.phone = 'Le téléphone est requis';
      if (!formData.address?.trim()) errs.address = 'L\'adresse est requise';
    }

    if (currentStep === 4) {
      if (!formData.desiredProgramId) errs.desiredProgramId = 'La filière est requise';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════
  const goNext = () => {
    if (!validateStep(step)) {
      setError('Veuillez corriger les erreurs avant de continuer');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setError('');
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ═══════════════════════════════════════════════════════════
  // SOUMISSION
  // ═══════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    // Valider toutes les étapes
    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        setStep(i);
        setError('Veuillez corriger les erreurs avant de soumettre');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        applicantEmail: formData.email,
        applicantName: `${formData.lastName} ${formData.firstName}`.trim(),
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          birthDate: formData.birthDate,
          birthPlace: formData.birthPlace,
          nationality: formData.nationality,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
        },
        previousEducation: {
          diplomas: formData.diplomas,
        },
        documents: formData.documents,
        desiredProgramId: formData.desiredProgramId ? parseInt(formData.desiredProgramId) : null,
        academicYear: ACADEMIC_YEAR,
      };

      const res = await api.post('/enrollments/public', payload);

      // Succès
      onSuccess(res.data.data);
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold
                      transition-all duration-300
                      ${isCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg'
                        : isCurrent
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg scale-110'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                      }
                    `}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <p
                    className={`
                      hidden sm:block text-xs mt-2 font-medium text-center whitespace-nowrap
                      ${isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-slate-500'
                      }
                    `}
                  >
                    {s.title}
                  </p>
                </div>

                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 sm:mx-2 rounded-full bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ${
                        step > s.id ? 'translate-x-0' : '-translate-x-full'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Carte de l'étape */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Bandeau décoratif */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 sm:p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Contenu de l'étape */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <Step1PersonalInfo data={formData} onChange={setFormData} errors={errors} />
            )}
            {step === 2 && (
              <Step2Contact data={formData} onChange={setFormData} errors={errors} />
            )}
            {step === 3 && (
              <Step3Education data={formData} onChange={setFormData} errors={errors} />
            )}
            {step === 4 && (
              <Step4Program data={formData} onChange={setFormData} errors={errors} />
            )}
            {step === 5 && (
              <Step5Confirmation
                data={formData}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={step === 1 || submitting}
            >
              <ArrowLeft size={16} />
              Précédent
            </Button>

            <p className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block">
              Étape {step} sur 5
            </p>

            {step < 5 ? (
              <Button onClick={goNext}>
                Suivant
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting}>
                <Sparkles size={16} />
                Soumettre ma candidature
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Note de bas de page */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
        🔒 Vos données sont sécurisées et ne seront utilisées que pour votre inscription.
      </p>
    </div>
  );
}