import { useAuth } from '../contexts/AuthContext';

export default function RoleBasedPage({ admin, teacher, student, fallback }) {
  const { user } = useAuth();

  if (!user) return fallback || null;

  switch (user.role) {
    case 'ADMIN':
    case 'ACCOUNTANT':
      return admin || fallback || null;
    case 'TEACHER':
      return teacher || fallback || null;
    case 'STUDENT':
    case 'PARENT':
      return student || fallback || null;
    default:
      return fallback || null;
  }
}