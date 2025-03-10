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
import { NewBudgetModal } from './NewBudgetModal';
import { EditBudgetModal } from './EditBudgetModal';
import { PlusCircle, Edit, Search, Calendar, FilterX, X, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createBudget, updateBudget, deleteBudget, createCategory } from '@/app/dashboard/budgets/actions';
import { useRouter } from 'next/navigation';
import { emmiter } from "@/lib/emmiter";
import { Pagination } from '@/components/ui/pagination';

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
  };
  user?: {
    name: string;
  };
}

export function BudgetList({ budgets, categories, userRole }: { 
  budgets: Budget[],
  categories: { id: string, name: string }[],
  userRole: string 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'admin';

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Número de elementos por página

  useEffect(() => {
    console.log("Budgets in BudgetList:", budgets);
    console.log("Available categories:", categories);
    console.log("User role:", userRole);
  }, [budgets, categories, userRole]);

  const handleCreateBudget = async (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
    max_amount: number;
    start_date: Date;
    end_date: Date;
    isNewCategory: boolean;
    periodicity?: string;
  }) => {
    try {
      setLoading(true);
      
      let categoryId = data.category_id;
      
      // Si es una nueva categoría, primero crearla
      if (data.isNewCategory && data.category_name && data.category_type) {
        // Llamar a la API para crear la categoría
        const categoryResult = await createCategory({
          category_name: data.category_name,
          category_type: data.category_type
        });
        
        if (categoryResult.error) {
          emmiter.emit("showToast", {
            message: `Failed to create category: ${categoryResult.error}`,
            type: "error"
          });
          setLoading(false);
          return; // Detener el proceso si falla la creación de la categoría
        }
        
        if (categoryResult.category && categoryResult.category.id) {
          categoryId = categoryResult.category.id.toString();
          emmiter.emit("showToast", {
            message: `Category '${data.category_name}' created successfully`,
            type: "success"
          });
        } else {
          // Fallback: usar una categoría existente si no se pudo crear una nueva
          categoryId = categories.length > 0 ? categories[0].id : '1';
        }
      }
      
      // Formatear fechas para la API
      const formattedData = {
        category_id: categoryId || '1', // Usar el ID de la categoría creada o seleccionada
        max_amount: data.max_amount,
        start_date: data.start_date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        end_date: data.end_date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        periodicity: data.periodicity
      };
      
      console.log('Sending data to server:', formattedData);
      
      const response = await createBudget(formattedData);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to create budget: ${response.error}`,
          type: "error"
        });
        setLoading(false);
        return;
      }
      
      emmiter.emit("showToast", {
        message: "Budget created successfully",
        type: "success"
      });
      router.refresh(); // Actualizar la página para mostrar el nuevo presupuesto
    } catch (error) {
      console.error('Error creating budget:', error);
      emmiter.emit("showToast", {
        message: "Could not create the budget",
        type: "error"
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleUpdateBudget = async (id: string, data: {
    category_id?: string;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      
      console.log('Updating budget:', id, data);
      
      const response = await updateBudget(id, data);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to update budget: ${response.error}`,
          type: "error"
        });
        return;
      }
      
      emmiter.emit("showToast", {
        message: "Budget updated successfully",
        type: "success"
      });
      router.refresh(); // Refresh the page to show changes
    } catch (error) {
      console.error('Error updating budget:', error);
      emmiter.emit("showToast", {
        message: "Could not update the budget",
        type: "error"
      });
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
    }
  };

  // Filter budgets based on status and search
  const filteredBudgets = budgets.filter(budget => {
    // Status filter
    if (filterStatus !== 'all' && budget.status !== filterStatus) {
      return false;
    }
    
    // Search (by category)
    if (searchTerm && !budget.category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Paginación - Calcular elementos para la página actual
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredBudgets.slice(indexOfFirstItem, indexOfLastItem);
  
  // Cambiar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Contadores por estado
  const activeBudgets = budgets.filter(budget => budget.status === 'active').length;
  const inactiveBudgets = budgets.filter(budget => budget.status === 'inactive').length;
  const expiredBudgets = budgets.filter(budget => budget.status === 'expired').length;

  // Function to get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': 
        return 'bg-green-100 text-green-800';
      case 'expired': 
        return 'bg-gray-100 text-gray-800';
      case 'inactive': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by category..."
              className="pl-8 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <div className="w-[160px]">
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || filterStatus !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        )}
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No budgets found</h3>
          <p className="text-sm text-gray-500 mb-3">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : isAdmin ? 'Start by creating your first budget' : 'No budgets available'}
          </p>
          {searchTerm || filterStatus !== 'all' ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Clear filters
            </Button>
          ) : (
            isAdmin && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="w-[100px] text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium text-black">{budget.category.name}</TableCell>
                  <TableCell className="text-black">{formatCurrency(budget.max_amount)}</TableCell>
                  <TableCell className="text-black">
                    {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getStatusStyle(budget.status))}>
                      {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Componente de paginación */}
          <div className="p-4">
            <Pagination
              totalCount={filteredBudgets.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      <NewBudgetModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateBudget}
        categories={categories}
        loading={loading}
      />

      <EditBudgetModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateBudget}
        categories={categories}
        budget={selectedBudget}
        loading={loading}
      />
    </div>
  );
}
