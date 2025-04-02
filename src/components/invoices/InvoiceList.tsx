'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
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
  downloadInvoiceFile,
  createInvoice
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
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetailed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [allInvoices, setAllInvoices] = useState<InvoiceDetailed[]>(invoices);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceDetailed[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
  const isAdmin = userRole === 'admin';

  // Configuración de Pusher para actualizaciones en tiempo real
  useEffect(() => {
    console.log("Inicializando con", invoices.length, "facturas");
    
    // Inicializar allInvoices con los datos iniciales
    if (invoices && invoices.length > 0) {
      setAllInvoices(invoices);
      applyFilters(invoices);
    } else {
      setFilteredInvoices([]);
    }
    
    // Configurar Pusher solo si no hay error de conexión
    if (!hasConnectionError) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      });
      
      // Suscribirse al canal de facturas
      const channel = pusher.subscribe('invoices');
      
      // Escuchar evento de nueva factura
      channel.bind('invoice-created', (data: InvoiceDetailed) => {
        console.log('Nueva factura recibida:', data);
        setAllInvoices(current => {
          const updated = [data, ...current];
          // Forzar la actualización de los filtros
          applyFilters(updated);
          return updated;
        });
      });
      
      // Escuchar evento de actualización de factura
      channel.bind('invoice-updated', (data: InvoiceDetailed) => {
        console.log('Factura actualizada:', data);
        setAllInvoices(current => {
          const updated = current.map(invoice => 
            invoice.id === data.id ? data : invoice
          );
          // Forzar la actualización de los filtros
          applyFilters(updated);
          return updated;
        });
      });
      
      // Escuchar evento de eliminación de factura
      channel.bind('invoice-deleted', (data: { id: string }) => {
        console.log('Factura eliminada:', data);
        setAllInvoices(current => {
          const updated = current.filter(invoice => invoice.id !== data.id);
          // Forzar la actualización de los filtros
          applyFilters(updated);
          return updated;
        });
      });
      
      // Limpiar la suscripción al desmontar el componente
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [invoices, hasConnectionError]);

  // Función para aplicar filtros
  const applyFilters = (data: InvoiceDetailed[]) => {
    let filtered = [...data];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(term) ||
        invoice.transaction?.description?.toLowerCase().includes(term) ||
        invoice.notes?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de estado
    if (statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Aplicar filtro de tipo
    if (typeFilter) {
      filtered = filtered.filter(invoice => invoice.type === typeFilter);
    }
    
    setFilteredInvoices(filtered);
    // Reset a la primera página cuando cambian los filtros
    setCurrentPage(1);
  };

  const handleCreateInvoice = async (data: any) => {
    setIsLoading(true);
    try {
      // Mostrar mensaje de enviando...
      emmiter.emit('showToast', {
        message: 'Creating invoice...',
        type: 'success'
      });
      
      // Llamar a la API para crear la factura
      const { invoice, error } = await createInvoice(data);
      
      if (error) {
        throw new Error(error);
      }
      
      console.log("Invoice creada:", invoice);
      
      // Recargar la página para mostrar los datos actualizados (puedes mejorar esto con SWR o React Query)
      router.refresh();
      
      // Cerrar el modal
      setIsNewInvoiceModalOpen(false);
      
      // Mostrar mensaje de éxito
      emmiter.emit('showToast', {
        message: 'Invoice created successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      emmiter.emit('showToast', {
        message: error instanceof Error ? error.message : 'Error creating invoice',
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
        type: 'success'
      });
      
      // Recargar la página para mostrar los datos actualizados (puedes mejorar esto con SWR o React Query)
      router.refresh();
      
      // Cerrar el modal
      setIsEditInvoiceModalOpen(false);
      
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
              <SelectItem value="">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setIsNewInvoiceModalOpen(true)}
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
            {filteredInvoices.length === 0 ? (
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
              filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((invoice) => (
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
                          setSelectedInvoice(invoice);
                          setIsViewInvoiceModalOpen(true);
                        }}
                        aria-label="View invoice details"
                        title="View details"
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
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsEditInvoiceModalOpen(true);
                        }}
                        disabled={hasConnectionError}
                        aria-label="Edit invoice"
                        title="Edit invoice"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      {(isAdmin) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={isLoading || hasConnectionError}
                          aria-label="Delete invoice"
                          title="Delete invoice"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
      {Math.ceil(filteredInvoices.length / itemsPerPage) > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center px-3">
            <span className="text-sm">
              Page {currentPage} of {Math.ceil(filteredInvoices.length / itemsPerPage)}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInvoices.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(filteredInvoices.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Modales */}
      {!hasConnectionError && (
        <>
          <NewInvoiceModal
            open={isNewInvoiceModalOpen}
            onOpenChange={setIsNewInvoiceModalOpen}
            onSubmit={handleCreateInvoice}
            transactions={transactions}
            loading={isLoading}
          />
          
          {selectedInvoice && (
            <>
              <EditInvoiceModal
                open={isEditInvoiceModalOpen}
                onOpenChange={setIsEditInvoiceModalOpen}
                onSubmit={handleUpdateInvoice}
                invoice={selectedInvoice}
                transactions={transactions}
                loading={isLoading}
              />
              
              <ViewInvoiceModal
                open={isViewInvoiceModalOpen}
                onOpenChange={setIsViewInvoiceModalOpen}
                invoice={selectedInvoice}
              />
            </>
          )}
        </>
      )}
    </div>
  );
} 