import { BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'gray' },
  PUBLISHED: { label: 'Publié', color: 'green' },
  ARCHIVED: { label: 'Archivé', color: 'yellow' },
};

export default function CourseCardCompact({ course, variant = 'teacher' }) {
  const statusConf = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600 transition-all overflow-hidden"
    >
      <div className="h-1.5" style={{ backgroundColor: course.color || '#3b82f6' }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${course.color || '#3b82f6'}20` }}
          >
            <BookOpen
              size={18}
              style={{ color: course.color || '#3b82f6' }}
              strokeWidth={2.5}
            />
          </div>
          <Badge color={statusConf.color}>{statusConf.label}</Badge>
        </div>

        <p className="text-xs font-mono text-gray-400 dark:text-slate-500 mb-1">
          {course.code}
        </p>
        <h3 className="font-semibold text-sm text-gray-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {course._count?.sessions || 0}
          </span>
          {variant === 'teacher' && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {course.enrolledCount || 0}
            </span>
          )}
          {course.credits > 0 && (
            <span className="ml-auto text-gray-400">{course.credits} cr.</span>
          )}
        </div>
      </div>
    </Link>
  );
}