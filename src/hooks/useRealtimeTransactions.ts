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
    console.log('New transaction received:', transaction);
    
    setTransactions(current => {
      // Avoid duplicates
      if (current.some(t => t.id === transaction.id)) {
        return current;
      }
      
      const updated = [transaction, ...current];
      
      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `New transaction: ${transaction.description || transaction.id}`,
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
    console.log('Transaction updated:', transaction);
    
    setTransactions(current => {
      const transactionExists = current.some(t => t.id === transaction.id);
      const updated = current.map(t => t.id === transaction.id ? transaction : t);
      
      if (transactionExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transaction updated: ${transaction.description || transaction.id}`,
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
    console.log('Transaction deleted:', data);
    
    setTransactions(current => {
      const transactionExists = current.some(t => t.id === data.id);
      const updated = current.filter(t => t.id !== data.id);
      
      if (transactionExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transaction deleted: ${data.id}`,
          type: 'warning'
        });
      }
      
      // Call custom handler if provided
      onTransactionDeleted?.(data.id);
      
      return updated;
    });
  }, [onTransactionDeleted, enableNotifications]);

  // Handler for completed transactions
  const handleTransactionCompleted = useCallback((transaction: Transaction) => {
    console.log('Transaction marked as completed:', transaction);

    setTransactions(current => {
      const updated = current.map(t => t.id === transaction.id ? { ...t, status: 'completed' as 'completed' } : t);

      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transaction ${transaction.id} marked as completed`,
          type: 'success'
        });
      }

      return updated;
    });
  }, [enableNotifications]);

  // Handler for cancelled transactions
  const handleTransactionCancelled = useCallback((transaction: Transaction) => {
    console.log('Transaction marked as cancelled:', transaction);

    setTransactions(current => {
      const updated = current.map(t => t.id === transaction.id ? { ...t, status: 'cancelled' as 'cancelled' } : t);

      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Transaction ${transaction.id} marked as cancelled`,
          type: 'error'
        });
      }

      return updated;
    });
  }, [enableNotifications]);
  
  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusher.isConnected && !pusher.isConnecting) {
      setError(new Error('No real-time connection available'));
      return;
    }
    
    setIsLoading(true);
    
    // Suscribirse a eventos de transacciones
    const unsubscribeCreated = pusher.subscribe<Transaction>(
      'transactions',
      'transaction-created',
      (data) => {
        console.log('Evento recibido: transaction-created', data);
        handleTransactionCreated(data);
      }
    );

    const unsubscribeUpdated = pusher.subscribe<Transaction>(
      'transactions',
      'transaction-updated',
      (data) => {
        console.log('Evento recibido: transaction-updated', data);
        handleTransactionUpdated(data);
      }
    );

    const unsubscribeDeleted = pusher.subscribe<{ id: string }>(
      'transactions',
      'transaction-deleted',
      (data) => {
        console.log('Evento recibido: transaction-deleted', data);
        handleTransactionDeleted(data);
      }
    );

    const unsubscribeCompleted = pusher.subscribe<Transaction>(
      'transactions',
      'transaction-completed',
      (data) => {
        console.log('Evento recibido: transaction-completed', data);
        handleTransactionCompleted(data);
      }
    );

    const unsubscribeCancelled = pusher.subscribe<Transaction>(
      'transactions',
      'transaction-cancelled',
      (data) => {
        console.log('Evento recibido: transaction-cancelled', data);
        handleTransactionCancelled(data);
      }
    );

    setIsLoading(false);

    // Limpiar suscripciones al desmontar
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeCompleted();
      unsubscribeCancelled();
    };
  }, [
    pusher.isConnected, 
    pusher.isConnecting, 
    handleTransactionCreated, 
    handleTransactionUpdated, 
    handleTransactionDeleted, 
    handleTransactionCompleted, 
    handleTransactionCancelled
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
