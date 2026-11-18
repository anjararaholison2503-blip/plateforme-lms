import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Ne rien faire si non authentifié
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Ne pas recréer si déjà connecté pour le même utilisateur
    if (socketRef.current?.connected) return;

    console.log('🔌 Connexion Socket.IO...');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SOCKET_URL = API_URL.replace('/api', '');

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // ─── Événements de connexion ───
    newSocket.on('connect', () => {
      console.log('🔌 Socket.IO connecté');
      setIsConnected(true);
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Serveur Socket.IO prêt:', data);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO déconnecté:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket.IO erreur:', err.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnecté (tentative ${attemptNumber})`);
      setIsConnected(true);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      console.log('🔌 Fermeture Socket.IO');
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️  Socket non connecté, impossible d'émettre "${event}"`);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      return () => socketRef.current?.off(event, handler);
    }
    return () => {};
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false,
      emit: () => {},
      on: () => () => {},
      off: () => {},
    };
  }
  return context;
};