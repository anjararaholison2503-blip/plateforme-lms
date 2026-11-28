import { Link } from 'react-router-dom';
import {
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Video,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Styles partagés                                                     */
/* ------------------------------------------------------------------ */

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';

const buttonBase = `inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition duration-200 ${focusRing}`;

// Boutons posés sur un fond indigo (hero et appel à l'action)
const buttonAccent = `${buttonBase} h-12 bg-amber-400 px-7 text-slate-900 hover:-translate-y-0.5 hover:bg-amber-300 motion-reduce:hover:translate-y-0`;
const buttonOutline = `${buttonBase} h-12 border border-indigo-400/50 px-7 text-white hover:border-white hover:bg-white/10`;

const container = 'mx-auto max-w-6xl px-4 sm:px-6';
const card = 'rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800';

/* ------------------------------------------------------------------ */
/* Contenu                                                             */
/* ------------------------------------------------------------------ */

const sections = [
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'fonctionnement', label: 'Comment ça marche' },
];

const features = [
  {
    icon: Video,
    title: 'Cours interactifs',
    description:
      'Tous vos supports de cours sont réunis dans votre espace. Ouvrez-les quand vous en avez besoin.',
    points: ['Documents au format PDF', 'Vidéos de cours', 'Autres ressources pédagogiques'],
    Preview: CoursePreview,
  },
  {
    icon: ShieldCheck,
    title: 'Examens sécurisés',
    description:
      'Passez vos évaluations en ligne, directement depuis votre compte.',
    points: ['Quiz en ligne', 'Évaluations depuis votre compte'],
    Preview: QuizPreview,
  },
  {
    icon: TrendingUp,
    title: 'Suivi personnalisé',
    description:
      'Sachez où vous en êtes et repérez les matières qui demandent encore du travail.',
    points: ['Notes par matière', 'Moyennes', 'Progression à votre rythme'],
    Preview: GradesPreview,
  },
];

const steps = [
  {
    title: 'Créez votre compte',
    description: 'Remplissez le formulaire d’inscription avec vos informations.',
  },
  {
    title: 'Suivez vos cours',
    description: 'Connectez-vous et consultez les ressources de votre formation.',
  },
  {
    title: 'Évaluez vos acquis',
    description: 'Répondez aux quiz, puis consultez vos notes et votre progression.',
  },
];

function scrollToSection(id) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className={`${container} flex h-16 items-center justify-between gap-2 sm:h-[72px]`}>
          <Brand />

          <nav aria-label="Sections de la page" className="hidden items-center gap-8 lg:flex">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={`rounded text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700 dark:text-slate-300 dark:hover:text-white ${focusRing}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <nav aria-label="Compte" className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/login"
              className={`${buttonBase} h-10 px-2 text-[13px] text-slate-700 hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white sm:px-4 sm:text-sm`}
            >
              Se connecter
            </Link>
            <Link
              to="/enroll"
              className={`${buttonBase} h-10 bg-indigo-700 px-3 text-[13px] text-white hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:px-5 sm:text-sm`}
            >
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          {/* Fond indigo : il s'arrête avant le bas de l'aperçu pour le faire chevaucher */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bottom-24 bg-indigo-950 sm:bottom-40"
          />

          <div className={`${container} relative pt-16 sm:pt-24`}>
            <div className="mx-auto max-w-3xl text-center text-white">
              <h1 className="text-4xl/[1.12] font-bold tracking-tight sm:text-6xl/[1.08] lg:text-7xl/[1.05]">
                Votre formation, <span className="block">au même endroit.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-indigo-200 sm:text-lg">
                Retrouvez vos cours, consultez vos ressources pédagogiques et suivez votre
                progression depuis un espace simple et accessible.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/enroll" className={buttonAccent}>
                  Créer un compte
                </Link>
                <Link to="/login" className={buttonOutline}>
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>

            <DashboardPreview />
          </div>
        </section>

        {/* Fonctionnalités */}
        <section
          id="fonctionnalites"
          aria-labelledby="features-title"
          className={`${container} scroll-mt-20 py-20 sm:py-28`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="features-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Apprendre, s&apos;évaluer, progresser
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Les outils dont vous avez besoin tout au long de votre formation.
            </p>
          </div>

          <div className="mt-16 space-y-20 sm:space-y-28">
            {features.map(({ icon: Icon, title, description, points, Preview }, index) => (
              <article key={title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-700 text-white">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                    {description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3 font-medium">
                        <Check
                          size={20}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-indigo-700 dark:text-indigo-300"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aperçu décoratif */}
                <div
                  aria-hidden="true"
                  className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/60 sm:p-10"
                >
                  <Preview />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section
          id="fonctionnement"
          aria-labelledby="steps-title"
          className="scroll-mt-16 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950 sm:py-24"
        >
          <div className={container}>
            <h2
              id="steps-title"
              className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Commencez en trois étapes
            </h2>

            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map(({ title, description }, index) => (
                <li key={title} className="relative text-center">
                  {/* Trait reliant les étapes sur grand écran */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[calc(50%+2.5rem)] top-6 hidden h-px w-[calc(100%-3rem)] bg-indigo-200 dark:bg-indigo-900 md:block"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-indigo-700 bg-white text-lg font-bold text-indigo-700 dark:border-indigo-400 dark:bg-slate-900 dark:text-indigo-300"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Appel à l'action */}
        <section aria-labelledby="cta-title" className={`${container} py-20 sm:py-24`}>
          <div className="rounded-2xl bg-indigo-950 px-5 py-14 text-center text-white sm:px-12 sm:py-20">
            <GraduationCap size={40} aria-hidden="true" className="mx-auto text-amber-400" />
            <h2 id="cta-title" className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Prêt à commencer votre formation ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-indigo-200">
              Créez votre compte ou connectez-vous pour retrouver vos cours.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/enroll" className={buttonAccent}>
                S&apos;inscrire maintenant
              </Link>
              <Link to="/login" className={buttonOutline}>
                Accéder à mon espace
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div
          className={`${container} flex flex-col items-center justify-between gap-5 py-8 lg:flex-row`}
        >
          <Brand />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} MASTERCLASS LMS. Tous droits réservés.
          </p>
          <nav aria-label="Liens du compte" className="flex gap-6 text-sm font-medium">
            <Link to="/login" className={`rounded hover:text-indigo-700 dark:hover:text-indigo-300 ${focusRing}`}>
              Connexion
            </Link>
            <Link to="/enroll" className={`rounded hover:text-indigo-700 dark:hover:text-indigo-300 ${focusRing}`}>
              Inscription
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composants                                                          */
/* ------------------------------------------------------------------ */

function Brand() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white max-[359px]:hidden sm:h-10 sm:w-10">
        <BookOpen size={20} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-tight sm:flex-row sm:gap-1.5">
        <span className="text-sm font-bold tracking-tight sm:text-lg">MASTERCLASS</span>
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 sm:text-lg">
          LMS
        </span>
      </span>
    </div>
  );
}

/*
 * Les aperçus ci-dessous sont des illustrations : les matières et les notes
 * sont des exemples. Remplacez-les par de vraies captures de l'application
 * dès que possible.
 */

function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
      <div className="h-full rounded-full bg-amber-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function DashboardPreview() {
  const menu = [
    { icon: LayoutDashboard, label: 'Tableau de bord' },
    { icon: BookOpen, label: 'Mes cours' },
    { icon: ShieldCheck, label: 'Évaluations' },
    { icon: TrendingUp, label: 'Mes notes' },
  ];
  const courses = [
    { name: 'Algorithmique', progress: 75 },
    { name: 'Bases de données', progress: 50 },
    { name: 'Développement web', progress: 30 },
  ];

  return (
    <figure className="mx-auto mt-14 max-w-5xl sm:mt-20">
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-2xl shadow-indigo-950/20 dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl"
      >
        <div className="flex gap-1.5 border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          ))}
        </div>

        <div className="flex">
          <div className="hidden w-52 shrink-0 space-y-1 border-r border-slate-200 p-4 dark:border-slate-700 md:block">
            {menu.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  index === 0
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={18} />
                {label}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
            <p className="text-lg font-bold">Mon espace de formation</p>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className={`${card} p-4 sm:p-5 lg:col-span-3`}>
                <p className="text-sm font-semibold">Mes cours</p>
                <div className="mt-4 space-y-5">
                  {courses.map(({ name, progress }) => (
                    <div key={name}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-slate-500 dark:text-slate-400">{progress} %</span>
                      </div>
                      <ProgressBar value={progress} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:col-span-2">
                <div className={`${card} p-4 sm:p-5`}>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Quiz disponible</p>
                  <p className="mt-1 font-semibold">Bases de données</p>
                  <span className="mt-3 inline-block rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">
                    Commencer
                  </span>
                </div>
                <div className={`${card} flex-1 p-4 sm:p-5`}>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Moyenne générale</p>
                  <p className="mt-1 text-3xl font-bold">
                    14,5<span className="text-base font-medium text-slate-400"> / 20</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        Aperçu illustratif avec des données d&apos;exemple
      </figcaption>
    </figure>
  );
}

function CoursePreview() {
  const resources = [
    { icon: FileText, name: 'Introduction au SQL', type: 'PDF' },
    { icon: Video, name: 'Les jointures', type: 'Vidéo' },
    { icon: BookOpen, name: 'Exercices corrigés', type: 'Document' },
  ];

  return (
    <div className={`${card} p-4 sm:p-5`}>
      <p className="font-semibold">Bases de données</p>
      <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
        {resources.map(({ icon: Icon, name, type }) => (
          <li key={name} className="flex items-center gap-3 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{name}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{type}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuizPreview() {
  const answers = ['SELECT', 'UPDATE', 'DELETE'];

  return (
    <div className={`${card} p-4 sm:p-5`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">Question 2 sur 5</p>
      <p className="mt-2 font-semibold">Quelle commande SQL permet de lire des données ?</p>
      <ul className="mt-4 space-y-2.5">
        {answers.map((answer, index) => (
          <li
            key={answer}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
              index === 0
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                index === 0
                  ? 'border-[5px] border-indigo-600'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            {answer}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GradesPreview() {
  const grades = [
    { subject: 'Algorithmique', grade: 16 },
    { subject: 'Bases de données', grade: 14 },
    { subject: 'Développement web', grade: 13.5 },
  ];

  return (
    <div className={`${card} p-4 sm:p-5`}>
      <p className="font-semibold">Mes notes</p>
      <div className="mt-4 space-y-5">
        {grades.map(({ subject, grade }) => (
          <div key={subject}>
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span className="font-medium">{subject}</span>
              <span className="whitespace-nowrap font-semibold">
                {grade.toLocaleString('fr-FR')} / 20
              </span>
            </div>
            <ProgressBar value={grade * 5} />
          </div>
        ))}
      </div>
    </div>
  );
}
