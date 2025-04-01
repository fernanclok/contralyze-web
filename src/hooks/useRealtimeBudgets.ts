import { useState, useEffect, useCallback } from 'react';
import { usePusherContext } from '@/contexts/PusherContext';
import { emmiter } from '@/lib/emmiter';

// Asumiendo que esta es la estructura de Budget basada en el código existente
interface Budget {
  id: string;
  category_id: string;
  max_amount: number;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  category: {
    name: string;
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    name: string;
  };
}

interface UseRealtimeBudgetsOptions {
  initialBudgets: Budget[];
  onBudgetCreated?: (budget: Budget) => void;
  onBudgetUpdated?: (budget: Budget) => void;
  onBudgetDeleted?: (id: string) => void;
  enableNotifications?: boolean;
}

export function useRealtimeBudgets({
  initialBudgets,
  onBudgetCreated,
  onBudgetUpdated,
  onBudgetDeleted,
  enableNotifications = true
}: UseRealtimeBudgetsOptions) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pusher = usePusherContext();
  
  // Handler for new budgets
  const handleBudgetCreated = useCallback((budget: Budget) => {
    console.log('Nuevo presupuesto recibido:', budget);
    
    setBudgets(current => {
      // Avoid duplicates
      if (current.some(b => b.id === budget.id)) {
        return current;
      }
      
      const updated = [budget, ...current];
      
      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Nuevo presupuesto: ${budget.category.name} - ${budget.max_amount}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onBudgetCreated?.(budget);
      
      return updated;
    });
  }, [onBudgetCreated, enableNotifications]);
  
  // Handler for updated budgets
  const handleBudgetUpdated = useCallback((budget: Budget) => {
    console.log('Presupuesto actualizado:', budget);
    
    setBudgets(current => {
      const budgetExists = current.some(b => b.id === budget.id);
      const updated = current.map(b => b.id === budget.id ? budget : b);
      
      if (budgetExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Presupuesto actualizado: ${budget.category.name}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onBudgetUpdated?.(budget);
      
      return budgetExists ? updated : current;
    });
  }, [onBudgetUpdated, enableNotifications]);
  
  // Handler for deleted budgets
  const handleBudgetDeleted = useCallback((data: { id: string }) => {
    console.log('Presupuesto eliminado:', data);
    
    setBudgets(current => {
      const budgetExists = current.some(b => b.id === data.id);
      const updated = current.filter(b => b.id !== data.id);
      
      if (budgetExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Presupuesto eliminado: ID ${data.id}`,
          type: 'warning'
        });
      }
      
      // Call custom handler if provided
      onBudgetDeleted?.(data.id);
      
      return updated;
    });
  }, [onBudgetDeleted, enableNotifications]);
  
  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusher.isConnected && !pusher.isConnecting) {
      setError(new Error('No hay conexión en tiempo real'));
      return;
    }
    
    setIsLoading(true);
    
    // Subscribe to budget events
    const unsubscribeCreated = pusher.subscribe<Budget>(
      'private-budgets', 
      'budget-created', 
      handleBudgetCreated
    );
    
    const unsubscribeUpdated = pusher.subscribe<Budget>(
      'private-budgets', 
      'budget-updated', 
      handleBudgetUpdated
    );
    
    const unsubscribeDeleted = pusher.subscribe<{ id: string }>(
      'private-budgets', 
      'budget-deleted', 
      handleBudgetDeleted
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
    handleBudgetCreated, 
    handleBudgetUpdated, 
    handleBudgetDeleted
  ]);
  
  // Update state when initialBudgets changes
  useEffect(() => {
    setBudgets(initialBudgets);
  }, [initialBudgets]);
  
  return {
    budgets,
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
