import {
  Users, Clock, CheckCircle2, XCircle, TrendingUp, RotateCcw,
  ArrowUpRight, AlertCircle,
} from 'lucide-react';

const STAT_CONFIG = [
  {
    key: 'total',
    label: 'Total',
    icon: Users,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    format: (v) => v || 0,
  },
  {
    key: 'PENDING_REVIEW',
    label: 'En attente',
    icon: Clock,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    format: (v) => v || 0,
    isStatus: true,
  },
  {
    key: 'ENROLLED',
    label: 'Inscrits',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    format: (v) => v || 0,
    isStatus: true,
  },
  {
    key: 'REJECTED',
    label: 'Rejetés',
    icon: XCircle,
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
    format: (v) => v || 0,
    isStatus: true,
  },
];

export default function EnrollmentStats({ stats }) {
  if (!stats) return null;

  const byStatus = stats.byStatus || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STAT_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = config.isStatus ? byStatus[config.key] : stats[config.key];

        return (
          <div
            key={config.key}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {/* Cercle décoratif */}
            <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 ${config.bg}`} />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  {config.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {config.format(value)}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <Icon size={22} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Carte supplémentaire : Redoublants */}
      {stats.totalRepeaters !== undefined && (
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <RotateCcw size={22} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Redoublants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {stats.totalRepeaters || 0}
                </p>
              </div>
              <TrendingUp size={20} className="text-violet-500" />
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                <ArrowUpRight size={22} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Réinscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {stats.totalReenrollments || 0}
                </p>
              </div>
              <AlertCircle size={20} className="text-cyan-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}