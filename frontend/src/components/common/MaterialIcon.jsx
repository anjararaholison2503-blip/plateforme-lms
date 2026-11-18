import {
  FileText, Video, Image as ImageIcon, Archive, File, Link2, FileQuestion,
} from 'lucide-react';

const ICON_CONFIG = {
  PDF: {
    icon: FileText,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    label: 'PDF',
  },
  VIDEO: {
    icon: Video,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Vidéo',
  },
  IMAGE: {
    icon: ImageIcon,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Image',
  },
  ZIP: {
    icon: Archive,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Archive',
  },
  DOCUMENT: {
    icon: File,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Document',
  },
  LINK: {
    icon: Link2,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    label: 'Lien',
  },
  OTHER: {
    icon: FileQuestion,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    label: 'Autre',
  },
};

export default function MaterialIcon({ type, size = 'md', withBg = true }) {
  const config = ICON_CONFIG[type] || ICON_CONFIG.OTHER;
  const Icon = config.icon;

  const sizes = {
    sm: { container: 'w-8 h-8', icon: 14 },
    md: { container: 'w-10 h-10', icon: 18 },
    lg: { container: 'w-14 h-14', icon: 24 },
  };

  const sizeConf = sizes[size] || sizes.md;

  if (!withBg) {
    return <Icon size={sizeConf.icon} className={config.color} />;
  }

  return (
    <div
      className={`${sizeConf.container} rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
    >
      <Icon size={sizeConf.icon} className={config.color} strokeWidth={2.5} />
    </div>
  );
}

export const getMaterialTypeLabel = (type) => {
  return ICON_CONFIG[type]?.label || 'Fichier';
};