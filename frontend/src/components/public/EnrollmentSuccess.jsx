import { CheckCircle2, Mail, Clock, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function EnrollmentSuccess({ enrollment }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {/* Bandeau de succès */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

          <div className="p-8 sm:p-12 text-center">
            {/* Icône */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl mb-6">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Candidature envoyée ! 🎉
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Votre demande d'inscription a bien été enregistrée. Un email de confirmation vous a été envoyé.
            </p>

            {/* Référence */}
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider mb-1">
                Numéro de dossier
              </p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                {enrollment.reference}
              </p>
            </div>

            {/* Étapes suivantes */}
            <div className="text-left max-w-md mx-auto space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Prochaines étapes
              </h3>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Vérifiez votre email
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    Un email de confirmation a été envoyé à {enrollment.applicantEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Attendez la validation
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Notre équipe va étudier votre dossier sous 48-72h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                    Recevez vos identifiants
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Une fois validé, vous recevrez vos identifiants de connexion
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de retour */}
            <Link to="/">
              <Button variant="outline">
                <Home size={16} />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
          Conservez précieusement votre numéro de dossier.
        </p>
      </div>
    </div>
  );
}