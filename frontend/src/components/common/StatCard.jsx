import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLOR_VARIANTS = {
  blue: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
  },
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = 'blue',
  trend,
  link,
  className = '',
}) {
  const config = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  const content = (
    <div
      className={`
        group relative overflow-hidden rounded-xl p-5
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        ${link ? 'hover:border-indigo-300 dark:hover:border-indigo-600' : ''}
        transition-colors duration-150
        ${className}
      `}
    >
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${
                trend.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.positive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {trend.value}
            </div>
          )}
        </div>

        <div
          className={`
            flex-shrink-0 w-11 h-11 rounded-lg
            flex items-center justify-center
            ${config.icon}
          `}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}