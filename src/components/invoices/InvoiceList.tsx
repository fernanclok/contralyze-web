'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { InvoiceDetailed } from '@/app/invoices/actions';
import { Transaction } from '@/app/transactions/actions';
import { PlusCircle, FileText, Download, Pencil, Trash2, X, Eye, InfoIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { NewInvoiceModal } from './NewInvoiceModal';
import { EditInvoiceModal } from './EditInvoiceModal';
import { ViewInvoiceModal } from './ViewInvoiceModal';
import { 
  deleteInvoice, 
  downloadInvoiceFile
} from '@/app/invoices/actions';
import { emmiter } from "@/lib/emmiter";

interface InvoiceListProps {
  invoices: InvoiceDetailed[];
  transactions: Transaction[];
  userRole: string;
  hasConnectionError?: boolean;
}

export function InvoiceList({ 
  invoices = [], 
  transactions = [],
  userRole, 
  hasConnectionError = false 
}: InvoiceListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // Modales
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceDetailed | null>(null);
  
  // Estado para manejar operaciones en curso
  const [isLoading, setIsLoading] = useState(false);
  
  const perPage = 10;

  // Filtrado de facturas
  const filteredInvoices = invoices.filter(invoice => {
    const matchesTerm = 
      (invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.transaction?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesTerm && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredInvoices.length / perPage);
  const currentInvoices = filteredInvoices.slice((page - 1) * perPage, page * perPage);

  const handleCreateInvoice = async (data: any) => {
    setIsLoading(true);
    try {
      // Mostrar mensaje de enviando...
      emmiter.emit('showToast', {
        message: 'Creating invoice...',
        type: 'default'
      });
      
      // Recargar la página para mostrar los datos actualizados (puedes mejorar esto con SWR o React Query)
      router.refresh();
      
      // Cerrar el modal
      setNewModalOpen(false);
      
      // Mostrar mensaje de éxito
      emmiter.emit('showToast', {
        message: 'Invoice created successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      emmiter.emit('showToast', {
        message: 'Error creating invoice',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      // Mostrar mensaje de enviando...
      emmiter.emit('showToast', {
        message: 'Updating invoice...',
        type: 'default'
      });
      
      // Recargar la página para mostrar los datos actualizados (puedes mejorar esto con SWR o React Query)
      router.refresh();
      
      // Cerrar el modal
      setEditModalOpen(false);
      
      // Mostrar mensaje de éxito
      emmiter.emit('showToast', {
        message: 'Invoice updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      emmiter.emit('showToast', {
        message: 'Error updating invoice',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { success, error } = await deleteInvoice(id);
      
      if (error) {
        throw new Error(error);
      }
      
      // Recargar la página para mostrar los datos actualizados
      router.refresh();
      
      // Mostrar mensaje de éxito
      emmiter.emit('showToast', {
        message: 'Invoice deleted successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      emmiter.emit('showToast', {
        message: 'Error deleting invoice',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    setIsLoading(true);
    try {
      const { url, error } = await downloadInvoiceFile(id);
      
      if (error || !url) {
        throw new Error(error || 'Could not download file');
      }
      
      // Crear un elemento a para la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`; // Nombre sugerido para la descarga
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')} aria-label="Clear search">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setNewModalOpen(true)}
            disabled={hasConnectionError}
            className="whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>
      
      {/* Tabla de facturas */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Transaction Ref</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                    <p>No invoices found.</p>
                    {searchTerm && <p className="text-sm">Try a different search term or clear filters.</p>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeStyle(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {invoice.transaction?.reference_number || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setCurrentInvoice(invoice);
                          setViewModalOpen(true);
                        }}
                        aria-label="View invoice details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {invoice.file_path && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          disabled={isLoading || hasConnectionError}
                          aria-label="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setCurrentInvoice(invoice);
                          setEditModalOpen(true);
                        }}
                        disabled={hasConnectionError}
                        aria-label="Edit invoice"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      {(userRole === 'admin') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={isLoading || hasConnectionError}
                          aria-label="Delete invoice"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center px-3">
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Modales */}
      {!hasConnectionError && (
        <>
          <NewInvoiceModal
            open={newModalOpen}
            onOpenChange={setNewModalOpen}
            onSubmit={handleCreateInvoice}
            transactions={transactions}
            loading={isLoading}
          />
          
          {currentInvoice && (
            <>
              <EditInvoiceModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                onSubmit={handleUpdateInvoice}
                invoice={currentInvoice}
                transactions={transactions}
                loading={isLoading}
              />
              
              <ViewInvoiceModal
                open={viewModalOpen}
                onOpenChange={setViewModalOpen}
                invoice={currentInvoice}
              />
            </>
          )}
        </>
      )}
    </div>
  );
} 