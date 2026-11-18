import { useState } from 'react';
import {
  ChevronDown, ChevronRight, BookOpen, Clock, Edit, Trash2, Plus,
  Video, FileText, Link2, File, Eye, EyeOff,
} from 'lucide-react';
import Badge from '../ui/Badge';

const CONTENT_TYPE_CONFIG = {
  TEXT: { icon: FileText, color: 'text-blue-600', label: 'Texte' },
  VIDEO: { icon: Video, color: 'text-purple-600', label: 'Vidéo' },
  LINK: { icon: Link2, color: 'text-cyan-600', label: 'Lien' },
  FILE: { icon: File, color: 'text-emerald-600', label: 'Fichier' },
  MIXED: { icon: BookOpen, color: 'text-gray-600', label: 'Mixte' },
};

export default function ModuleCard({
  module,
  canEdit = false,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onViewLesson,
}) {
  const [expanded, setExpanded] = useState(true);

  const totalLessonsDuration = module.lessons?.reduce(
    (sum, l) => sum + (l.duration || 0),
    0
  ) || 0;

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
      {/* En-tête du module */}
      <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 mt-0.5"
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-white/70 dark:bg-slate-700/70 px-2 py-0.5 rounded text-violet-700 dark:text-violet-300">
                Module {module.orderIndex + 1}
              </span>
              {!module.isPublished && (
                <Badge color="gray">
                  <EyeOff size={10} className="inline mr-1" />
                  Brouillon
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-slate-100">
              {module.title}
            </h3>

            {module.description && (
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                {module.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {module.lessons?.length || 0} leçon(s)
              </span>
              {totalLessonsDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {totalLessonsDuration} min
                </span>
              )}
              {module.duration && (
                <span className="flex items-center gap-1">
                  ⏱️ {module.duration}h estimées
                </span>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddLesson(module)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                title="Ajouter une leçon"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => onEdit(module)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                title="Modifier"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(module)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leçons */}
      {expanded && (
        <div className="p-3">
          {module.lessons && module.lessons.length > 0 ? (
            <ul className="space-y-1">
              {module.lessons.map((lesson, index) => {
                const typeConf = CONTENT_TYPE_CONFIG[lesson.contentType] || CONTENT_TYPE_CONFIG.TEXT;
                const Icon = typeConf.icon;

                return (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-slate-300 flex-shrink-0">
                      {index + 1}
                    </div>

                    <Icon size={14} className={`${typeConf.color} flex-shrink-0`} />

                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onViewLesson && onViewLesson(lesson)}
                        className="text-sm text-gray-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 text-left truncate w-full"
                      >
                        {lesson.title}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        <span>{typeConf.label}</span>
                        {lesson.duration && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {lesson.duration} min
                            </span>
                          </>
                        )}
                        {!lesson.isPublished && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400">Brouillon</span>
                          </>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditLesson(lesson)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                          title="Modifier"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteLesson(lesson)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Aucune leçon dans ce module
              </p>
              {canEdit && (
                <button
                  onClick={() => onAddLesson(module)}
                  className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  + Ajouter la première leçon
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}