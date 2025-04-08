import { Transaction } from '@/app/transactions/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Download, FileText, Eye, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import axios from 'axios';
import CreateInvoiceModal from './CreateInvoiceModal';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);

  if (!transaction) return null;

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'dd/MM/yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Función para obtener el texto del tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'income':
        return 'Income';
      case 'expense':
        return 'Expense';
      case 'transfer':
        return 'Transfer';
      default:
        return type;
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return '';
    }
  };

  // Función para obtener el color del tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  // Función para previsualizar la factura
  const handlePreviewInvoice = async (invoiceId: string) => {
    try {
      // Get invoice details first
      const response = await axios.get(`/api/invoices/${invoiceId}`);
      console.log("Invoice details response:", response.data);

      // Get the file directly from our API route
      const fileResponse = await axios.get(`/api/invoices/${invoiceId}/file`, {
        responseType: 'blob'
      });

      console.log("File downloaded successfully");
      
      // Create a URL for the blob
      const url = URL.createObjectURL(new Blob([fileResponse.data], {
        type: fileResponse.headers['content-type']
      }));

      // Si es un PDF, mostrarlo en un iframe
      if (fileResponse.headers['content-type'] === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        const previewArea = document.getElementById('invoice-preview');
        if (previewArea) {
          previewArea.innerHTML = '';
          previewArea.appendChild(iframe);
        }
      } else {
        // Si no es PDF, usar el visor por defecto
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Error previewing invoice:', error);
    }
  };

  // Función para descargar la factura
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // Get invoice details first
      const response = await axios.get(`/api/invoices/${invoiceId}`);
      console.log("Invoice details response:", response.data);

      // Get the file directly from our API route
      const fileResponse = await axios.get(`/api/invoices/${invoiceId}/file`, {
        responseType: 'blob'
      });

      console.log("File downloaded successfully");

      // Create a URL for the blob
      const url = URL.createObjectURL(new Blob([fileResponse.data], {
        type: fileResponse.headers['content-type']
      }));

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      const filename = response.data?.file_path?.split('/').pop() || `invoice-${invoiceId}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="bg-slate-50 p-6 sticky top-0 z-10 border-b">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-bold">
                Transaction Details
              </DialogTitle>
              <DialogDescription className="mt-1">
                View details for this transaction
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className={cn(
                  "text-sm px-3 py-1",
                  transaction.status === 'completed' ? "bg-green-100 text-green-800" : 
                  transaction.status === 'pending' ? "bg-yellow-100 text-yellow-800" : 
                  "bg-red-100 text-red-800"
                )}
              >
                {transaction.status}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Botón Add Invoice */}
          {transaction && transaction.status === 'completed' && (
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => setIsCreateInvoiceModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Invoice
              </Button>
            </div>
          )}

          {/* Información principal */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Transaction Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="font-medium">{transaction.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="font-medium text-lg">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="font-medium">{format(new Date(transaction.transaction_date), 'PPP')}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="font-medium">{transaction.category?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {transaction.type === 'income' ? 'Client' : transaction.type === 'expense' ? 'Supplier' : 'Reference'}
                    </p>
                    <p className="font-medium">
                      {transaction.type === 'income' 
                        ? transaction.client?.name || '-'
                        : transaction.type === 'expense'
                          ? transaction.supplier?.name || '-'
                          : transaction.reference_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="font-medium">{transaction.payment_method || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            {transaction.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1">{transaction.description}</p>
              </div>
            )}
          </div>

          {/* Facturas asociadas */}
          {transaction.invoices && transaction.invoices.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Invoices</h3>
              <div className="space-y-4">
                {transaction.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.issue_date && format(new Date(invoice.issue_date), 'PPP')}
                          {invoice.due_date && ` - Due: ${format(new Date(invoice.due_date), 'PPP')}`}
                        </p>
                        <Badge 
                          className={cn(
                            "mt-2 text-xs",
                            invoice.status === 'paid' ? "bg-green-100 text-green-800" : 
                            invoice.status === 'pending' ? "bg-yellow-100 text-yellow-800" : 
                            invoice.status === 'overdue' ? "bg-red-100 text-red-800" :
                            "bg-slate-100 text-slate-800"
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewInvoice(invoice.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Área de previsualización */}
          <div id="invoice-preview" className="mt-6">
            {previewUrl && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Invoice Preview</h3>
                <img 
                  src={previewUrl} 
                  alt="Invoice preview" 
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Modal para crear factura */}
      <CreateInvoiceModal
        open={isCreateInvoiceModalOpen}
        onOpenChange={setIsCreateInvoiceModalOpen}
        transactionId={transaction?.id || ''}
        onSuccess={() => {
          setIsCreateInvoiceModalOpen(false);
          // Opcionalmente podrías refrescar los datos de la transacción aquí
        }}
      />
    </Dialog>
  );
}
