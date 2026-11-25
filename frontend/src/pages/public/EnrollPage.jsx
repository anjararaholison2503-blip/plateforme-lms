import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, LogIn } from 'lucide-react';
import EnrollmentWizard from '../../components/public/EnrollmentWizard';
import EnrollmentSuccess from '../../components/public/EnrollmentSuccess';

export default function EnrollPage() {
  const [enrollmentResult, setEnrollmentResult] = useState(null);

  // Si inscription réussie → page de succès
  if (enrollmentResult) {
    return <EnrollmentSuccess enrollment={enrollmentResult} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* En-tête */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-slate-100">MasterClass</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">Portail d'inscription</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <LogIn size={16} />
            Se connecter
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Titre de la page */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              Année académique 2025-2026 · Inscriptions ouvertes
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-3">
            Rejoignez notre{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              établissement
            </span>
          </h1>
          <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Remplissez le formulaire ci-dessous pour soumettre votre candidature.
            Notre équipe étudiera votre dossier et vous contactera rapidement.
          </p>
        </div>

        {/* Wizard */}
        <EnrollmentWizard onSuccess={(data) => setEnrollmentResult(data)} />
      </main>

      {/* Pied de page */}
      <footer className="border-t border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            © 2026 MonCampus LMS · Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}