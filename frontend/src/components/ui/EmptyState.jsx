export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full mb-4">
          <Icon size={28} className="text-gray-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-base font-medium text-gray-800 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}