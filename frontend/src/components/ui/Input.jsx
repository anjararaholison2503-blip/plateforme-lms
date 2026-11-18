import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400 dark:text-slate-500" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5
            bg-white dark:bg-slate-800
            border rounded-xl text-sm
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent
            disabled:opacity-60 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${IconRight ? 'pr-11' : ''}
            ${
              error
                ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/10 focus:ring-rose-500'
                : 'border-gray-300 dark:border-slate-600 focus:ring-indigo-500'
            }
            ${className}
          `}
          {...props}
        />
        {IconRight && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <IconRight size={18} className="text-gray-400 dark:text-slate-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 3.5v3M6 8.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;