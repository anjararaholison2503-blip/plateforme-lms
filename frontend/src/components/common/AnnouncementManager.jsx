import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import AnnouncementList from './AnnouncementList';
import AnnouncementFormModal from './AnnouncementFormModal';

export default function AnnouncementManager({ courseId, userRole }) {
  const [modal, setModal] = useState({ open: false, announcement: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <AnnouncementList
        courseId={courseId}
        userRole={userRole}
        onCreateClick={() => setModal({ open: true, announcement: null })}
        onEdit={(announcement) => setModal({ open: true, announcement })}
        refreshKey={refreshKey}
      />

      <AnnouncementFormModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, announcement: null })}
        onSuccess={handleSuccess}
        courseId={courseId}
        announcement={modal.announcement}
      />
    </>
  );
}