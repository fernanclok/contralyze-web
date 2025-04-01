import { useState, useEffect, useCallback } from 'react';
import { usePusherContext } from '@/contexts/PusherContext';
import { Transaction } from '@/app/transactions/actions';
import { emmiter } from '@/lib/emmiter';

interface UseRealtimeTransactionsOptions {
  initialTransactions: Transaction[];
  onTransactionCreated?: (transaction: Transaction) => void;
  onTransactionUpdated?: (transaction: Transaction) => void;
  onTransactionDeleted?: (id: string) => void;
  enableNotifications?: boolean;
}

export function useRealtimeTransactions({
  initialTransactions,
  onTransactionCreated,
  onTransactionUpdated,
  onTransactionDeleted,
  enableNotifications = true
}: UseRealtimeTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pusher = usePusherContext();
  
  // Handler for new transactions
  const handleTransactionCreated = useCallback((transaction: Transaction) => {
    console.log('Nueva transacción recibida:', transaction);
    
    setTransactions(current => {
      // Avoid duplicates
      if (current.some(t => t.id === transaction.id)) {
        return current;
      }
      
      const updated = [transaction, ...current];
      
      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Nueva transacción: ${transaction.description || transaction.id}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onTransactionCreated?.(transaction);
      
      return updated;
    });
  }, [onTransactionCreated, enableNotifications]);
  
  // Handler for updated transactions
  const handleTransactionUpdated = useCallback((transaction: Transaction) => {
    console.log('Transacción actualizada:', transaction);
    
    setTransactions(current => {
      const transactionExists = current.some(t => t.id === transaction.id);
      const updated = current.map(t => t.id === transaction.id ? transaction : t);
      
      if (transactionExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transacción actualizada: ${transaction.description || transaction.id}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onTransactionUpdated?.(transaction);
      
      return transactionExists ? updated : current;
    });
  }, [onTransactionUpdated, enableNotifications]);
  
  // Handler for deleted transactions
  const handleTransactionDeleted = useCallback((data: { id: string }) => {
    console.log('Transacción eliminada:', data);
    
    setTransactions(current => {
      const transactionExists = current.some(t => t.id === data.id);
      const updated = current.filter(t => t.id !== data.id);
      
      if (transactionExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transacción eliminada: ${data.id}`,
          type: 'warning'
        });
      }
      
      // Call custom handler if provided
      onTransactionDeleted?.(data.id);
      
      return updated;
    });
  }, [onTransactionDeleted, enableNotifications]);
  
  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusher.isConnected && !pusher.isConnecting) {
      setError(new Error('No hay conexión en tiempo real'));
      return;
    }
    
    setIsLoading(true);
    
    // Subscribe to transaction events
    const unsubscribeCreated = pusher.subscribe<Transaction>(
      'private-transactions', 
      'transaction-created', 
      handleTransactionCreated
    );
    
    const unsubscribeUpdated = pusher.subscribe<Transaction>(
      'private-transactions', 
      'transaction-updated', 
      handleTransactionUpdated
    );
    
    const unsubscribeDeleted = pusher.subscribe<{ id: string }>(
      'private-transactions', 
      'transaction-deleted', 
      handleTransactionDeleted
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
    handleTransactionCreated, 
    handleTransactionUpdated, 
    handleTransactionDeleted
  ]);
  
  // Update state when initialTransactions changes
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  
  return {
    transactions,
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
