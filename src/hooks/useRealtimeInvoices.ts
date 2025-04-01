import { useState, useEffect, useCallback } from 'react';
import { usePusherContext } from '@/contexts/PusherContext';
import { InvoiceDetailed } from '@/app/invoices/actions';
import { emmiter } from '@/lib/emmiter';

interface UseRealtimeInvoicesOptions {
  initialInvoices: InvoiceDetailed[];
  onInvoiceCreated?: (invoice: InvoiceDetailed) => void;
  onInvoiceUpdated?: (invoice: InvoiceDetailed) => void;
  onInvoiceDeleted?: (id: string) => void;
  enableNotifications?: boolean;
}

export function useRealtimeInvoices({
  initialInvoices,
  onInvoiceCreated,
  onInvoiceUpdated,
  onInvoiceDeleted,
  enableNotifications = true
}: UseRealtimeInvoicesOptions) {
  const [invoices, setInvoices] = useState<InvoiceDetailed[]>(initialInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pusher = usePusherContext();
  
  // Handler for new invoices
  const handleInvoiceCreated = useCallback((invoice: InvoiceDetailed) => {
    console.log('Nueva factura recibida:', invoice);
    
    setInvoices(current => {
      // Avoid duplicates
      if (current.some(i => i.id === invoice.id)) {
        return current;
      }
      
      const updated = [invoice, ...current];
      
      if (enableNotifications) {
        emmiter.emit('showToast', {
          message: `Nueva factura: ${invoice.invoice_number}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onInvoiceCreated?.(invoice);
      
      return updated;
    });
  }, [onInvoiceCreated, enableNotifications]);
  
  // Handler for updated invoices
  const handleInvoiceUpdated = useCallback((invoice: InvoiceDetailed) => {
    console.log('Factura actualizada:', invoice);
    
    setInvoices(current => {
      const invoiceExists = current.some(i => i.id === invoice.id);
      const updated = current.map(i => i.id === invoice.id ? invoice : i);
      
      if (invoiceExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Factura actualizada: ${invoice.invoice_number}`,
          type: 'info'
        });
      }
      
      // Call custom handler if provided
      onInvoiceUpdated?.(invoice);
      
      return invoiceExists ? updated : current;
    });
  }, [onInvoiceUpdated, enableNotifications]);
  
  // Handler for deleted invoices
  const handleInvoiceDeleted = useCallback((data: { id: string }) => {
    console.log('Factura eliminada:', data);
    
    setInvoices(current => {
      const invoiceExists = current.some(i => i.id === data.id);
      const updated = current.filter(i => i.id !== data.id);
      
      if (invoiceExists && enableNotifications) {
        emmiter.emit('showToast', {
          message: `Factura eliminada: ID ${data.id}`,
          type: 'warning'
        });
      }
      
      // Call custom handler if provided
      onInvoiceDeleted?.(data.id);
      
      return updated;
    });
  }, [onInvoiceDeleted, enableNotifications]);
  
  // Set up Pusher subscriptions
  useEffect(() => {
    if (!pusher.isConnected && !pusher.isConnecting) {
      setError(new Error('No hay conexión en tiempo real'));
      return;
    }
    
    setIsLoading(true);
    
    // Subscribe to invoice events
    const unsubscribeCreated = pusher.subscribe<InvoiceDetailed>(
      'private-invoices', 
      'invoice-created', 
      handleInvoiceCreated
    );
    
    const unsubscribeUpdated = pusher.subscribe<InvoiceDetailed>(
      'private-invoices', 
      'invoice-updated', 
      handleInvoiceUpdated
    );
    
    const unsubscribeDeleted = pusher.subscribe<{ id: string }>(
      'private-invoices', 
      'invoice-deleted', 
      handleInvoiceDeleted
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
    handleInvoiceCreated, 
    handleInvoiceUpdated, 
    handleInvoiceDeleted
  ]);
  
  // Update state when initialInvoices changes
  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);
  
  return {
    invoices,
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
