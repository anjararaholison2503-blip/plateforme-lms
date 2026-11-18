export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  noPadding = false,
  hover = false,
}) {
  return (
    <div
      className={`
        rounded-xl border border-gray-200 dark:border-slate-700
        shadow-sm
        bg-white dark:bg-slate-800
        transition-colors duration-150
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-semibold text-gray-800 dark:text-slate-100 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}