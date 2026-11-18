import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}) {
  const variants = {
    primary: `
      bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
      text-white shadow-sm hover:shadow-md
      focus-visible:ring-indigo-500
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 active:bg-gray-300
      dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-500
      text-gray-800 dark:text-slate-100
      focus-visible:ring-gray-400
    `,
    success: `
      bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
      text-white shadow-sm hover:shadow-md
      focus-visible:ring-emerald-500
    `,
    danger: `
      bg-rose-600 hover:bg-rose-700 active:bg-rose-800
      text-white shadow-sm hover:shadow-md
      focus-visible:ring-rose-500
    `,
    warning: `
      bg-amber-500 hover:bg-amber-600 active:bg-amber-700
      text-white shadow-sm hover:shadow-md
      focus-visible:ring-amber-500
    `,
    outline: `
      border border-gray-300 dark:border-slate-600
      hover:bg-gray-50 active:bg-gray-100
      dark:hover:bg-slate-700 dark:active:bg-slate-600
      text-gray-700 dark:text-slate-200
      focus-visible:ring-indigo-500
    `,
    ghost: `
      hover:bg-gray-100 active:bg-gray-200
      dark:hover:bg-slate-700 dark:active:bg-slate-600
      text-gray-700 dark:text-slate-200
      focus-visible:ring-gray-400
    `,
    link: `
      text-indigo-600 dark:text-indigo-400
      hover:text-indigo-700 dark:hover:text-indigo-300
      hover:underline
      focus-visible:ring-indigo-500
    `,
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    sm: 'px-3 py-2 text-sm gap-2 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
    xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center
        font-medium
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          {children}
          {IconRight && <IconRight size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
        </>
      )}
    </button>
  );
}