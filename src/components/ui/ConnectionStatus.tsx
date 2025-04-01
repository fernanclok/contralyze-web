"use client";

import React from 'react';
import { usePusherContext } from '@/contexts/PusherContext';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function ConnectionStatus({ showLabel = true, className }: ConnectionStatusProps) {
  const { isConnected, isConnecting, connectionError, reconnect } = usePusherContext();
  
  const handleReconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    reconnect();
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
          {showLabel && <span className="text-xs text-yellow-500">Conectando...</span>}
        </>
      ) : isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          {showLabel && <span className="text-xs text-green-500">Conectado</span>}
        </>
      ) : (
        <button 
          onClick={handleReconnect}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
          title={connectionError ? `Error: ${connectionError.message}` : 'Desconectado'}
        >
          <WifiOff className="h-4 w-4" />
          {showLabel && <span className="text-xs">Desconectado</span>}
        </button>
      )}
    </div>
  );
}
