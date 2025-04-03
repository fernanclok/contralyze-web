"use client";

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

interface PusherOptions {
  cluster?: string;
  forceTLS?: boolean;
  enabledTransports?: string[];
  disabledTransports?: string[];
  authEndpoint?: string;
  auth?: {
    headers?: Record<string, string>;
  };
  retryTimeout?: number;
  maxReconnectionAttempts?: number;
}

interface PusherEvent<T> {
  channel: string;
  event: string;
  data: T;
}

type EventCallback<T> = (data: T) => void;

interface UsePusherReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  subscribe: <T>(channelName: string, eventName: string, callback: EventCallback<T>) => () => void;
  unsubscribe: (channelName: string) => void;
  reconnect: () => void;
}

/**
 * Custom hook for Pusher integration with improved error handling and reconnection
 * @param appKey - Pusher application key
 * @param options - Pusher client options
 * @returns Object with connection state and methods
 */
export function usePusher(
  appKey: string = process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  options: PusherOptions = {}
): UsePusherReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Record<string, any>>({});
  const callbacksRef = useRef<Record<string, Record<string, EventCallback<any>>>>({});
  
  // Default options
  const defaultOptions: PusherOptions = {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    retryTimeout: 3000,
    maxReconnectionAttempts: 5,
    // Elimina la configuración de authEndpoint y auth
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Initialize Pusher connection
  useEffect(() => {
    if (!appKey) {
      setConnectionError(new Error('Pusher app key is required'));
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Inicializa Pusher sin autenticación
      pusherRef.current = new Pusher(appKey, {
        cluster: mergedOptions.cluster || 'us2',
        forceTLS: mergedOptions.forceTLS,
        enabledTransports: mergedOptions.enabledTransports as any,
        disabledTransports: mergedOptions.disabledTransports as any,
      });
      
      // Set up connection event handlers
      pusherRef.current.connection.bind('connected', () => {
        console.log('Pusher connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
      });
      pusherRef.current.connection.bind('disconnected', () => {
        setIsConnected(false);
      });
      pusherRef.current.connection.bind('connecting', () => {
        console.log('Connecting to Pusher...');
        setIsConnecting(true);
      });
      pusherRef.current.connection.bind('error', (err: Error) => {
        setConnectionError(err);
        setIsConnecting(false);
        setIsConnected(false);
      });
      
      // Limpieza al desmontar
      return () => {
        if (pusherRef.current) {
          pusherRef.current.disconnect();
          pusherRef.current = null;
        }
      };
    } catch (error) {
      setConnectionError(error instanceof Error ? error : new Error(String(error)));
      setIsConnecting(false);
    }
  }, [appKey]);
  
  // Subscribe to a channel and event
  const subscribe = <T>(
    channelName: string,
    eventName: string,
    callback: EventCallback<T>
  ): (() => void) => {
    if (!pusherRef.current) {
      console.error('Pusher not initialized');
      return () => {};
    }
    
    try {
      // Get or create channel
      let channel = channelsRef.current[channelName];
      if (!channel) {
        channel = pusherRef.current.subscribe(channelName);
        channelsRef.current[channelName] = channel;
        callbacksRef.current[channelName] = {};
      }
      
      // Store callback reference
      if (!callbacksRef.current[channelName]) {
        callbacksRef.current[channelName] = {};
      }
      
      callbacksRef.current[channelName][eventName] = callback;
      
      // Bind event handler
      channel.bind(eventName, (data: T) => {
        console.log(`Received event ${eventName} on channel ${channelName}:`, data);
        callback(data);
      });
      
      // Return unsubscribe function for this specific event
      return () => {
        if (channel && callbacksRef.current[channelName]) {
          channel.unbind(eventName);
          delete callbacksRef.current[channelName][eventName];
        }
      };
    } catch (error) {
      console.error(`Error subscribing to ${channelName}:${eventName}:`, error);
      return () => {};
    }
  };
  
  // Unsubscribe from a channel
  const unsubscribe = (channelName: string): void => {
    if (!pusherRef.current || !channelsRef.current[channelName]) {
      return;
    }
    
    try {
      const channel = channelsRef.current[channelName];
      channel.unbind_all();
      pusherRef.current.unsubscribe(channelName);
      
      delete channelsRef.current[channelName];
      delete callbacksRef.current[channelName];
    } catch (error) {
      console.error(`Error unsubscribing from ${channelName}:`, error);
    }
  };
  
  // Reconnect to Pusher
  const reconnect = (): void => {
    if (!pusherRef.current || pusherRef.current.connection.state === 'connected' || pusherRef.current.connection.state === 'connecting') {
      console.log('Pusher is already connected or connecting. Skipping reconnect.');
      return;
    }

    try {
      console.log('Attempting to reconnect to Pusher...');
      setIsConnecting(true);

      pusherRef.current.disconnect();
      pusherRef.current.connect();
    } catch (error) {
      console.error('Error reconnecting to Pusher:', error);
      setConnectionError(error instanceof Error ? error : new Error(String(error)));
      setIsConnecting(false);
    }
  };
  
  return {
    isConnected,
    isConnecting,
    connectionError,
    subscribe,
    unsubscribe,
    reconnect
  };
}
