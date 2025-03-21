'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { InvoiceDetailed } from '@/app/invoices/actions';
import { format } from 'date-fns';
import { Download, FileText, ExternalLink, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { downloadInvoiceFile } from '@/app/invoices/actions';
import { useState } from 'react';
import { emmiter } from "@/lib/emmiter";

interface ViewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetailed;
}

export function ViewInvoiceModal({
  open,
  onOpenChange,
  invoice
}: ViewInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!invoice.file_path) return;
    
    setIsLoading(true);
    try {
      const { url, error } = await downloadInvoiceFile(invoice.id);
      
      if (error || !url) {
        throw new Error(error || 'Could not download file');
      }
      
      // Crear un elemento a para la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.id}.pdf`; // Nombre sugerido para la descarga
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Mostrar mensaje de éxito
      emmiter.emit('showToast', {
        message: 'Invoice downloaded successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      emmiter.emit('showToast', {
        message: 'Error downloading invoice',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'draft':
        return 'Draft';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-amber-600';
      case 'cancelled':
        return 'text-red-600';
      case 'draft':
        return 'text-gray-600';
      case 'overdue':
        return 'text-rose-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!invoice) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Invoice Details</SheetTitle>
          <SheetDescription>
            View details for invoice #{invoice.invoice_number}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Información principal */}
            <div className="col-span-12 space-y-1">
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{invoice.invoice_number}</h3>
                <span className={`font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(invoice.amount)}</p>
            </div>
            
            {/* Fechas */}
            <div className="col-span-6 space-y-1">
              <p className="text-xs text-gray-500">Issue Date</p>
              <p className="font-medium">
                {(() => {
                  try {
                    const date = new Date(invoice.issue_date);
                    return !isNaN(date.getTime()) 
                      ? format(date, 'dd/MM/yyyy')
                      : 'Invalid date';
                  } catch (e) {
                    return 'Invalid date';
                  }
                })()}
              </p>
            </div>
            
            <div className="col-span-6 space-y-1">
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-medium">
                {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : 'Not specified'}
              </p>
            </div>
            
            {/* Linked Transaction */}
            {invoice.transaction && (
              <div className="col-span-12 p-4 border rounded-md bg-gray-50">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Linked Transaction
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Reference:</span>
                    <span className="text-xs font-medium">
                      {invoice.transaction.reference_number || invoice.transaction.id.substr(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Type:</span>
                    <span className="text-xs font-medium capitalize">{invoice.transaction.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Amount:</span>
                    <span className="text-xs font-medium">{formatCurrency(invoice.transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Date:</span>
                    <span className="text-xs font-medium">
                      {format(new Date(invoice.transaction.transaction_date), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Attachment */}
            {invoice.file_path && (
              <div className="col-span-12 border p-4 rounded-md flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-sm">Attachment</h4>
                    <p className="text-xs text-gray-500">{invoice.file_path.split('/').pop()}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
            
            {/* Notes */}
            {invoice.notes && (
              <div className="col-span-12 space-y-1">
                <p className="text-xs text-gray-500">Notes</p>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {invoice.notes}
                </div>
              </div>
            )}
          </div>
        </div>
        <SheetFooter className="pt-6">
          <div className="w-full flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 