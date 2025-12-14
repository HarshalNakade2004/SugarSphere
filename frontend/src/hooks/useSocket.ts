import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

// Expose socket globally for components that need direct access
declare global {
  interface Window {
    __socket: Socket | null;
  }
}

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
      });

      // Expose socket globally
      window.__socket = socket;

      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        window.__socket = null;
      }
    };
  }, [isAuthenticated, accessToken]);

  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
    return () => {
      if (socket) {
        socket.off(event, callback);
      }
    };
  }, []);

  return { socket, subscribe };
};

export const getSocket = (): Socket | null => socket;
