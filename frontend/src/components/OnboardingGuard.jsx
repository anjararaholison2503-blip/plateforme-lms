import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHierarchy } from '../contexts/HierarchyContext';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './ui/Spinner';

export default function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, loading } = useHierarchy();
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   // Ne rien faire si on est déjà sur le wizard ou sur login
  //   if (location.pathname === '/setup' || location.pathname === '/login') {
  //     return;
  //   }

  //   // Rediriger si authentifié + onboarding non fait
  //   if (!loading && isAuthenticated && config && !config.onboardingDone) {
  //     navigate('/setup', { replace: true });
  //   }
  // }, [loading, isAuthenticated, config, location.pathname, navigate]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
  //       <Spinner size={40} />
  //     </div>
  //   );
  // }

  useEffect(() => {
  // Si on est sur la landing page, login ou enroll, on ne fait rien
  if (['/', '/login', '/enroll'].includes(location.pathname)) {
    return;
  }

  // Rediriger si authentifié + onboarding non fait
  if (!loading && isAuthenticated && config && !config.onboardingDone) {
    navigate('/setup', { replace: true });
  }
}, [loading, isAuthenticated, config, location.pathname, navigate]);

  return children;
}