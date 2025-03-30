import { Transaction } from '@/app/transactions/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Download, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import axios from 'axios';

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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Transaction Details</span>
          </DialogTitle>
          <DialogDescription>
            Transaction #{transaction.reference_number || transaction.id?.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className={`font-semibold ${getStatusColor(transaction.status)}`}>
                {getStatusText(transaction.status)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className={`font-semibold ${getTypeColor(transaction.type)}`}>
                {getTypeText(transaction.type)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className={`text-xl font-bold ${getTypeColor(transaction.type)}`}>
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Date</p>
            <p className="font-semibold">{formatDate(transaction.transaction_date)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="font-semibold">{transaction.description || 'No description'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Category</p>
              <p className="font-semibold">{transaction.category?.name || 'No category'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Payment Method</p>
              <p className="font-semibold">{transaction.payment_method || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Supplier</p>
              <p className="font-semibold">{transaction.supplier?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="font-semibold">{transaction.client?.name || 'N/A'}</p>
            </div>
          </div>

          {transaction.reference_number && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Reference Number</p>
              <p className="text-sm">{transaction.reference_number}</p>
            </div>
          )}

          {/* Invoice section with preview */}
          {transaction.invoices && transaction.invoices.length > 0 && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Invoice Information</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Invoice details */}
                <div className="space-y-4">
                  {transaction.invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Invoice #{invoice.invoice_number}</p>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="text-sm">{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-sm capitalize">{invoice.type}</p>
                        </div>
                        
                        {invoice.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-sm mt-1">{invoice.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewInvoice(invoice.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* File preview */}
                <div id="invoice-preview" className="border rounded-lg p-4">
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Invoice preview" 
                      className="max-w-full h-auto"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
