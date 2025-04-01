"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { emmiter } from '@/lib/emmiter';

interface PusherContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  subscribe: <T>(channelName: string, eventName: string, callback: (data: T) => void) => () => void;
  unsubscribe: (channelName: string) => void;
  reconnect: () => void;
}

const PusherContext = createContext<PusherContextType | null>(null);

interface PusherProviderProps {
  children: ReactNode;
  appKey?: string;
  cluster?: string;
  hasConnectionError?: boolean;
}

export function PusherProvider({
  children,
  appKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  hasConnectionError = false
}: PusherProviderProps) {
  // Skip Pusher initialization if connection error is flagged
  const pusher = usePusher(
    hasConnectionError ? '' : appKey,
    { cluster, forceTLS: true }
  );
  
  // Show connection status notifications
  React.useEffect(() => {
    if (pusher.connectionError) {
      emmiter.emit('showToast', {
        message: `Error de conexión en tiempo real: ${pusher.connectionError.message}. Intentando reconectar...`,
        type: 'error'
      });
    }
    
    if (pusher.isConnected) {
      emmiter.emit('showToast', {
        message: 'Conexión en tiempo real establecida',
        type: 'success'
      });
    }
  }, [pusher.connectionError, pusher.isConnected]);
  
  return (
    <PusherContext.Provider value={pusher}>
      {children}
    </PusherContext.Provider>
  );
}

export function usePusherContext() {
  const context = useContext(PusherContext);
  
  if (!context) {
    throw new Error('usePusherContext must be used within a PusherProvider');
  }
  
  return context;
}
