import { useState, useEffect, useCallback } from 'react';
import { usePusherContext } from '@/contexts/PusherContext';
import { emmiter } from '@/lib/emmiter';

// Asumiendo que esta es la estructura de BudgetRequest basada en el código existente
interface BudgetRequest {
  id: string;
  user_id: string;
  category_id: string;
  requested_amount: number;
  description: string;
  request_date: string;
  status: string;
  reviewed_by: string | null;
  category: {
    name: string;
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface UseRealtimeBudgetRequestsOptions {
  initialRequests: BudgetRequest[];
  onRequestCreated?: (request: BudgetRequest) => void;
  onRequestUpdated?: (request: BudgetRequest) => void;
  onRequestDeleted?: (id: string) => void;
  enableNotifications?: boolean;
}

export function useRealtimeBudgetRequests({
  initialRequests,
  onRequestCreated,
  onRequestUpdated,
  onRequestDeleted,
  enableNotifications = true
}: UseRealtimeBudgetRequestsOptions) {
  const [requests, setRequests] = useState<BudgetRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pusher = usePusherContext();
  
  // Handler for new budget requests
  const handleRequestCreated = useCallback((request: BudgetRequest) => {
    console.log('Nueva solicitud de presupuesto recibida:', request);
    
    setRequests(current => {
      // Avoid duplicates
      if (current.some(r => r.id === request.id)) {
        return current;
      }
      
      const updated = [request, ...current];
      
      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Nueva solicitud de presupuesto: ${request.category.name} - ${request.requested_amount}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onRequestCreated?.(request);
      
      return updated;
    });
  }, [onRequestCreated, enableNotifications]);
  
  // Handler for updated budget requests
  const handleRequestUpdated = useCallback((request: BudgetRequest) => {
    console.log('Solicitud de presupuesto actualizada:', request);
    
    setRequests(current => {
      const requestExists = current.some(r => r.id === request.id);
      const updated = current.map(r => r.id === request.id ? request : r);
      
      if (requestExists && enableNotifications) {
        let message = `Solicitud actualizada: ${request.category.name}`;
        
        // Mostrar mensaje específico según el cambio de estado
        if (request.status === 'approved') {
          message = `Solicitud aprobada: ${request.category.name}`;
        } else if (request.status === 'rejected') {
          message = `Solicitud rechazada: ${request.category.name}`;
        }
        
        emmiter.emit('showToast', {
          message,
          type: request.status === 'approved' ? 'success' : 
                request.status === 'rejected' ? 'error' : 'info'
        });
      }
      
      // Call custom handler if provided
      onRequestUpdated?.(request);
      
      return requestExists ? updated : current;
    });
  }, [onRequestUpdated, enableNotifications]);
  
  // Handler for deleted budget requests
  const handleRequestDeleted = useCallback((data: { id: string }) => {
    console.log('Solicitud de presupuesto eliminada:', data);
    
    setRequests(current => {
      const requestExists = current.some(r => r.id === data.id);
      const updated = current.filter(r => r.id !== data.id);
      
      if (requestExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Solicitud de presupuesto eliminada: ID ${data.id}`,
          type: 'warning'
        });
      }
      
      // Call custom handler if provided
      onRequestDeleted?.(data.id);
      
      return updated;
    });
  }, [onRequestDeleted, enableNotifications]);
  
  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusher.isConnected && !pusher.isConnecting) {
      setError(new Error('No hay conexión en tiempo real'));
      return;
    }
    
    setIsLoading(true);
    
    // Subscribe to budget request events
    const unsubscribeCreated = pusher.subscribe<BudgetRequest>(
      'private-budget-requests', 
      'budget-request-created', 
      handleRequestCreated
    );
    
    const unsubscribeUpdated = pusher.subscribe<BudgetRequest>(
      'private-budget-requests', 
      'budget-request-updated', 
      handleRequestUpdated
    );
    
    const unsubscribeDeleted = pusher.subscribe<{ id: string }>(
      'private-budget-requests', 
      'budget-request-deleted', 
      handleRequestDeleted
    );
    
    setIsLoading(false);
    
    // Clean up subscriptions
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [
    pusher.isConnected, 
    pusher.isConnecting, 
    handleRequestCreated, 
    handleRequestUpdated, 
    handleRequestDeleted
  ]);
  
  // Update state when initialRequests changes
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);
  
  return {
    requests,
    isLoading,
    error,
    connectionStatus: {
      isConnected: pusher.isConnected,
      isConnecting: pusher.isConnecting,
      error: pusher.connectionError
    },
    reconnect: pusher.reconnect
  };
}
