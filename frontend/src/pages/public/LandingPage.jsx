import { Link } from 'react-router-dom';
import { BookOpen, Video, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <BookOpen size={28} />
          <span>MASTERCLASS LMS</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
            Se connecter
          </Link>
          <Link to="/enroll" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            S'inscrire
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          🚀 La plateforme d'apprentissage de nouvelle génération
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white max-w-4xl leading-tight mb-6">
          Apprenez plus intelligemment avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">l'Intelligence Artificielle</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mb-10">
          Rejoignez des milliers d'étudiants et d'enseignants. Accédez à des cours interactifs, 
          passez des quiz sécurisés et suivez votre progression en temps réel.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/enroll" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-transform hover:scale-105 flex items-center justify-center gap-2">
            Créer un compte <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
            J'ai déjà un compte
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white dark:bg-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Cours interactifs</h3>
            <p className="text-gray-600 dark:text-slate-400">Accédez à des supports de cours variés (PDF, vidéos, documents) à tout moment.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Examens sécurisés</h3>
            <p className="text-gray-600 dark:text-slate-400">Passez vos évaluations en toute confiance grâce à notre système anti-triche avancé.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-center">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Suivi personnalisé</h3>
            <p className="text-gray-600 dark:text-slate-400">Consultez vos notes, vos moyennes et progressez à votre rythme.</p>
          </div>
        </div>
      </section>
    </div>
  );
}