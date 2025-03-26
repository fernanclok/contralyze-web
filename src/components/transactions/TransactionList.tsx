'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Transaction, Category, Client, Supplier } from '@/app/transactions/actions';
import { NewTransactionModal } from './NewTransactionModal';
import { EditTransactionModal } from './EditTransactionModal';
import { PlusCircle, Edit, Search, Calendar, FilterX, X, Trash2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createTransaction, updateTransaction, deleteTransaction } from '@/app/transactions/actions';
import { useRouter } from 'next/navigation';
import { emmiter } from "@/lib/emmiter";
import { Pagination } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  userRole: string;
  hasConnectionError?: boolean;
}

export function TransactionList({ 
  transactions = [], 
  categories = [], 
  suppliers = [], 
  clients = [],
  userRole, 
  hasConnectionError = false 
}: TransactionListProps) {
  const router = useRouter();
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [dateFilterVisible, setDateFilterVisible] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;
  const isAdmin = userRole === 'admin';

  // Aplicar filtros cada vez que cambian los filtros o transactions
  useEffect(() => {
    let filtered = [...transactions].filter(Boolean); // Asegurar que no hay elementos nulos

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction?.description?.toLowerCase().includes(lowerSearchTerm) ||
        transaction?.reference_number?.toLowerCase().includes(lowerSearchTerm) ||
        transaction?.category?.name?.toLowerCase().includes(lowerSearchTerm) ||
        transaction?.supplier?.name?.toLowerCase().includes(lowerSearchTerm) ||
        transaction?.client?.name?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filtrar por tipo
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Filtrar por estado
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Filtrar por categoría
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category_id === categoryFilter);
    }

    // Filtrar por fecha inicio
    if (startDateFilter) {
      filtered = filtered.filter(transaction => {
        try {
          const transactionDate = new Date(transaction.transaction_date);
          const startDate = new Date(startDateFilter);
          return transactionDate >= startDate;
        } catch (e) {
          console.error('Error comparing dates:', e);
          return false;
        }
      });
    }

    // Filtrar por fecha fin
    if (endDateFilter) {
      filtered = filtered.filter(transaction => {
        try {
          const transactionDate = new Date(transaction.transaction_date);
          const endDate = new Date(endDateFilter);
          return transactionDate <= endDate;
        } catch (e) {
          console.error('Error comparing dates:', e);
          return false;
        }
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, searchTerm, typeFilter, statusFilter, categoryFilter, startDateFilter, endDateFilter]);

  // Calcular transacciones para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Funciones para cambiar de página
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setCategoryFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setDateFilterVisible(false);
  };

  const toggleDateFilter = () => {
    setDateFilterVisible(!dateFilterVisible);
    if (dateFilterVisible) {
      setStartDateFilter('');
      setEndDateFilter('');
    }
  };

  const handleCreateTransaction = async (data: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description?: string;
    category_id?: string;
    supplier_id?: string;
    client_id?: string;
    transaction_date: string;
    status?: 'pending' | 'completed' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await createTransaction(data);
      
      if (result.error) {
        emmiter.emit('showToast', {
          message: result.error,
          type: 'error'
        });
        return;
      }
      
      emmiter.emit('showToast', {
        message: 'Transaction created successfully',
        type: 'success'
      });
      
      setIsNewTransactionModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating transaction:', error);
      emmiter.emit('showToast', {
        message: 'Error creating transaction',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (id: string, data: {
    type?: 'income' | 'expense' | 'transfer';
    amount?: number;
    description?: string;
    category_id?: string;
    supplier_id?: string;
    client_id?: string;
    transaction_date?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await updateTransaction(id, data);
      
      if (result.error) {
        emmiter.emit('showToast', {
          message: result.error,
          type: 'error'
        });
        return;
      }
      
      emmiter.emit('showToast', {
        message: 'Transaction updated successfully',
        type: 'success'
      });
      
      setIsEditTransactionModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating transaction:', error);
      emmiter.emit('showToast', {
        message: 'Error updating transaction',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteTransaction(transactionToDelete);
      
      if (result.error) {
        emmiter.emit('showToast', {
          message: result.error,
          type: 'error'
        });
        return;
      }
      
      emmiter.emit('showToast', {
        message: 'Transaction deleted successfully',
        type: 'success'
      });
      
      setIsDeleteAlertOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      emmiter.emit('showToast', {
        message: 'Error deleting transaction',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditTransactionModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'income': return 'Income';
      case 'expense': return 'Expense';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search transactions..."
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant={dateFilterVisible ? "secondary" : "outline"} 
            size="icon" 
            onClick={toggleDateFilter}
            aria-label="Date filter"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          {(searchTerm || typeFilter || statusFilter || categoryFilter || startDateFilter || endDateFilter) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="gap-1"
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          )}
          
          {!hasConnectionError && (
            <Button size="sm" onClick={() => setIsNewTransactionModalOpen(true)} className="gap-1 ml-auto">
              <PlusCircle className="h-4 w-4" />
              New Transaction
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtro de fechas */}
      {dateFilterVisible && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-md">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <Input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Tabla de transacciones */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Relation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {filteredTransactions.length === 0 && transactions.length > 0 ? (
                    'No transactions found that match the filters.'
                  ) : (
                    'No transactions registered.'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      try {
                        const date = new Date(transaction.transaction_date);
                        return !isNaN(date.getTime()) 
                          ? format(date, 'dd/MM/yyyy')
                          : 'Invalid date';
                      } catch (e) {
                        return 'Invalid date';
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      transaction.type === 'income' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : transaction.type === 'expense'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                    }>
                      {getTypeText(transaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className={
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : transaction.type === 'expense'
                        ? 'text-red-600'
                        : ''
                  }>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {transaction.description || 'No description'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {transaction.category?.name || 'No category'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getStatusBadgeColor(transaction.status))}>
                      {getStatusText(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {transaction.supplier?.name && (
                      <span className="block text-sm text-gray-600">
                        Supplier: {transaction.supplier.name}
                      </span>
                    )}
                    {transaction.client?.name && (
                      <span className="block text-sm text-gray-600">
                        Client: {transaction.client.name}
                      </span>
                    )}
                    {!transaction.supplier?.name && !transaction.client?.name && 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditClick(transaction)}
                        disabled={hasConnectionError}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteClick(transaction.id)}
                          disabled={hasConnectionError}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {filteredTransactions.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          /> */}
        </div>
      )}
      
      {/* Modal para nueva transacción */}
      <NewTransactionModal
        open={isNewTransactionModalOpen}
        onOpenChange={setIsNewTransactionModalOpen}
        onSubmit={handleCreateTransaction}
        categories={categories}
        suppliers={suppliers}
        clients={clients}
        loading={isLoading}
      />
      
      {/* Modal para editar transacción */}
      <EditTransactionModal
        open={isEditTransactionModalOpen}
        onOpenChange={setIsEditTransactionModalOpen}
        onSubmit={handleUpdateTransaction}
        categories={categories}
        suppliers={suppliers}
        clients={clients}
        transaction={selectedTransaction}
        loading={isLoading}
      />
      
      {/* Alerta de confirmación para eliminar */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected transaction and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 