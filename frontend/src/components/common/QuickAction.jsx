import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickAction({
  icon: Icon,
  label,
  description,
  to,
  color = 'blue',
  onClick,
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40',
    green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40',
    purple: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40',
    yellow: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40',
    red: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40',
  };

  const content = (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm transition-all">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          colors[color] || colors.blue
        }`}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
            {description}
          </p>
        )}
      </div>
      <ArrowRight
        size={16}
        className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
      />
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}
