import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  const config = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', Icon: Info },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', Icon: CheckCircle },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', Icon: AlertCircle },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', Icon: XCircle },
  };

  const { bg, border, text, Icon } = config[type];

  return (
    <div className={`flex items-start gap-3 p-4 ${bg} border ${border} rounded-lg animate-fade-in`}>
      <Icon size={20} className={`${text} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm ${text}`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`${text} hover:opacity-70`}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}