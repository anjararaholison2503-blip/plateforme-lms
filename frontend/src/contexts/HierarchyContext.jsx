import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const HierarchyContext = createContext();

export function HierarchyProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hierarchy/current');
      setConfig(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (authLoading) return;

    // Si pas authentifié, ne pas charger (le wizard s'en chargera après login)
    if (!isAuthenticated) {
      setLoading(false);
      setConfig(null);
      return;
    }

    fetchConfig();
  }, [isAuthenticated, authLoading]);

  // Helper : récupérer le label d'un type
  const getLabel = (type) => {
    if (!config?.levels) return type;
    const level = config.levels.find((l) => l.type === type);
    return level ? level.label : type;
  };

  const getPluralLabel = (type) => {
    if (!config?.levels) return type;
    const level = config.levels.find((l) => l.type === type);
    return level ? level.pluralLabel : type;
  };

  const getIcon = (type) => {
    if (!config?.levels) return '📁';
    const level = config.levels.find((l) => l.type === type);
    return level ? level.icon : '📁';
  };

  const getAllowedChildren = (parentType) => {
    if (!config?.levels) return [];
    return config.levels
      .filter((l) => l.type !== 'ESTABLISHMENT' && l.type !== parentType)
      .map((l) => l.type);
  };

  const needsOnboarding = () => {
    if (!config) return false;
    return !config.onboardingDone;
  };

  return (
    <HierarchyContext.Provider
      value={{
        config,
        loading,
        error,
        refresh: fetchConfig,
        getLabel,
        getPluralLabel,
        getIcon,
        getAllowedChildren,
        needsOnboarding,
      }}
    >
      {children}
    </HierarchyContext.Provider>
  );
}

export const useHierarchy = () => {
  const context = useContext(HierarchyContext);
  if (!context) throw new Error('useHierarchy doit être utilisé dans HierarchyProvider');
  return context;
};