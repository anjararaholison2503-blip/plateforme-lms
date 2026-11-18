import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const PlatformContext = createContext();

export function PlatformProvider({ children }) {
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlatform = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      setPlatform(res.data.data);
    } catch (err) {
      console.error('Erreur chargement platform:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatform();
  }, []);

  return (
    <PlatformContext.Provider value={{ platform, loading, refresh: fetchPlatform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform doit être utilisé dans PlatformProvider');
  return context;
};