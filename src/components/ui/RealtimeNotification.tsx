"use client";

import React, { useEffect, useState } from 'react';
import { emmiter } from '@/lib/emmiter';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  message: string;
  type: ToastType;
  duration?: number;
}

export function RealtimeNotification() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const handleShowToast = (data: ToastMessage) => {
      setToast(data);
      setVisible(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        
        // After fade out animation, clear the toast
        setTimeout(() => {
          setToast(null);
        }, 300);
      }, data.duration || 3000);
      
      return () => clearTimeout(timer);
    };
    
    emmiter.on('showToast', handleShowToast);
    
    return () => {
      emmiter.off('showToast', handleShowToast);
    };
  }, []);
  
  if (!toast) return null;
  
  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  };
  
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };
  
  const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };
  
  return (
    <div 
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center max-w-md p-4 mb-4 border rounded-lg shadow-lg transition-all duration-300',
        styles[toast.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
      )}
      role="alert"
    >
      <div className={cn('inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg', iconStyles[toast.type])}>
        {icons[toast.type]}
      </div>
      <div className="ml-3 text-sm font-normal">{toast.message}</div>
      <button 
        type="button" 
        className={cn(
          'ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100',
          `hover:text-${toast.type === 'info' ? 'blue' : toast.type}-500`
        )}
        onClick={() => setVisible(false)}
        aria-label="Close"
      >
        <span className="sr-only">Cerrar</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
}
