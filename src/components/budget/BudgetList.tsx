'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
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
import { createBudget, updateBudget, deleteBudget, createCategory } from '@/app/budgets/actions';
import { useRouter } from 'next/navigation';
import { emmiter } from "@/lib/emmiter";
import { Pagination } from '@/components/ui/pagination';
import { type Department, type Category } from '@/app/budgets/actions';
import { getBudgetsFromDB, saveBudgetsToDB, saveCategoriesToDB, saveDepartmentsToDB, getCategoriesFromDB, getDepartmentsFromDB } from '@/app/utils/indexedDB';

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
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    name: string;
  };
}

export function BudgetList({ budgets: initialBudgets, categories, departments, userRole, hasConnectionError = false, requests = [], userDepartmentId }: { 
  budgets: Budget[],
  categories: Category[],
  departments: Department[],
  userRole: string,
  hasConnectionError?: boolean,
  requests?: any[],
  userDepartmentId?: string
}) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  // Estados locales para datos offline
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(budgets);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'admin';

  // Monitorear el estado de la conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      router.refresh(); // Recargar datos del servidor cuando vuelve la conexión
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine || hasConnectionError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasConnectionError]);

  // Cargar datos desde IndexedDB cuando no hay conexión
  useEffect(() => {
    if ((budgets.length === 0 || isOffline) && typeof window !== "undefined" && window.indexedDB) {
      getBudgetsFromDB()
        .then((budgetsFromDB) => {
          if (budgetsFromDB && budgetsFromDB.length > 0) {
            setLocalBudgets(budgetsFromDB);
            setBudgets(budgetsFromDB);
          }
        })
        .catch((error) => {
          console.error("Error al recuperar presupuestos de IndexedDB:", error);
          emmiter.emit('showToast', {
            message: 'Error al cargar datos offline de presupuestos',
            type: 'error'
          });
        });
    }
  }, [budgets.length, isOffline]);

  // Guardar presupuestos en IndexedDB cuando hay cambios y hay conexión
  useEffect(() => {
    if (budgets.length > 0 && typeof window !== "undefined" && window.indexedDB && !isOffline) {
      saveBudgetsToDB(budgets)
        .catch((error) => {
          console.error("Error al guardar presupuestos en IndexedDB:", error);
          emmiter.emit('showToast', {
            message: 'Error al guardar datos offline de presupuestos',
            type: 'error'
          });
        });
    }
  }, [budgets, isOffline]);

  // Cargar categorías desde IndexedDB cuando no hay conexión
  useEffect(() => {
    if ((categories.length === 0 || isOffline) && typeof window !== "undefined" && window.indexedDB) {
      getCategoriesFromDB()
        .then((categoriesFromDB) => {
          if (categoriesFromDB && categoriesFromDB.length > 0) {
            setLocalCategories(categoriesFromDB);
          }
        })
        .catch((error) => {
          console.error("Error al recuperar categorías de IndexedDB:", error);
        });
    }
  }, [categories.length, isOffline]);

  // Guardar categorías en IndexedDB cuando hay cambios y hay conexión
  useEffect(() => {
    if (categories.length > 0 && typeof window !== "undefined" && window.indexedDB && !isOffline) {
      saveCategoriesToDB(categories)
        .catch((error) => {
          console.error("Error al guardar categorías en IndexedDB:", error);
        });
    }
  }, [categories, isOffline]);

  // Cargar departamentos desde IndexedDB cuando no hay conexión
  useEffect(() => {
    if ((departments.length === 0 || isOffline) && typeof window !== "undefined" && window.indexedDB) {
      getDepartmentsFromDB()
        .then((departmentsFromDB) => {
          if (departmentsFromDB && departmentsFromDB.length > 0) {
            setLocalDepartments(departmentsFromDB);
          }
        })
        .catch((error) => {
          console.error("Error al recuperar departamentos de IndexedDB:", error);
          emmiter.emit('showToast', {
            message: 'Error al cargar datos offline de departamentos',
            type: 'error'
          });
        });
    } else {
      setLocalDepartments(departments);
    }
  }, [departments, isOffline]);

  // Guardar departamentos en IndexedDB cuando hay cambios y hay conexión
  useEffect(() => {
    if (departments.length > 0 && typeof window !== "undefined" && window.indexedDB && !isOffline) {
      saveDepartmentsToDB(departments)
        .catch((error) => {
          console.error("Error al guardar departamentos en IndexedDB:", error);
          emmiter.emit('showToast', {
            message: 'Error al guardar datos offline de departamentos',
            type: 'error'
          });
        });
    }
  }, [departments, isOffline]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Número de elementos por página

  useEffect(() => {
    console.log("Budgets in BudgetList:", budgets);
    console.log("Available categories:", categories);
    console.log("Available departments:", departments);
    console.log("User role:", userRole);
  }, [budgets, categories, departments, userRole]);

  const handleCreateBudget = async (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
    department_id?: string;
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
          category_type: data.category_type,
          department_id: data.department_id ? parseInt(data.department_id) : undefined
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

  // Obtener el nombre del departamento para una categoría
  const getDepartmentName = (budget: Budget): string => {
    if (budget.department && budget.department.name) {
      return budget.department.name;
    }
    
    if (budget.category && budget.category.department_id) {
      const department = localDepartments.find(d => d.id === budget.category.department_id);
      return department ? department.name : 'Unknown Department';
    }
    
    return 'No Department';
  };

  // Filter budgets based on status, department and search
  const filteredBudgets = localBudgets.filter(budget => {
    // Status filter
    if (filterStatus !== 'all' && budget.status !== filterStatus) {
      return false;
    }
    
    // Department filter
    if (filterDepartment !== 'all') {
      const departmentId = budget.department?.id || budget.category.department_id;
      if (departmentId !== filterDepartment) {
        return false;
      }
    }
    
    // Search (by category)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const categoryNameMatch = budget.category.name.toLowerCase().includes(searchLower);
      const departmentName = getDepartmentName(budget);
      const departmentNameMatch = departmentName.toLowerCase().includes(searchLower);
      
      if (!categoryNameMatch && !departmentNameMatch) {
        return false;
      }
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
  }, [searchTerm, filterStatus, filterDepartment]);

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

  // Agrupar presupuestos por departamento para calcular totales
  const budgetsByDepartment = localDepartments.map(dept => {
    const deptBudgets = budgets.filter(budget => {
      const budgetDeptId = budget.department?.id || budget.category.department_id;
      return budgetDeptId === dept.id && budget.status === 'active';
    });
    
    const totalBudget = deptBudgets.reduce((sum, budget) => 
      sum + parseFloat(budget.max_amount.toString()), 0);

    // Calcular el presupuesto aprobado para este departamento
    const approvedAmount = requests
      .filter(req => {
        // Una solicitud pertenece a un departamento si:
        // 1. El usuario que la creó pertenece al departamento, o
        // 2. La categoría de la solicitud pertenece al departamento
        const reqDeptId = req.department?.id || req.category.department_id;
        return reqDeptId === dept.id && req.status === 'approved';
      })
      .reduce((sum: number, req) => sum + parseFloat(req.requested_amount.toString()), 0);
    
    // Asegurar que nunca tengamos valores negativos para el presupuesto disponible
    const availableBudget = Math.max(0, totalBudget - approvedAmount);
    
    return {
      id: dept.id,
      name: dept.name,
      budgetCount: deptBudgets.length,
      totalBudget,
      availableBudget,
      approvedAmount
    };
  });

  // Efecto para Pusher
  useEffect(() => {
    // Inicializar Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Suscribirse al canal de budget requests
    const channel = pusher.subscribe('budget-requests');

    // Manejar nuevo budget request (solo para admin)
    if (userRole === 'admin') {
      channel.bind('new-request', (data: { budget_request: any }) => {
        emmiter.emit("showToast", {
          message: "New budget request received",
          type: "success"
        });
        router.refresh();
      });
    }

    // Manejar actualizaciones de status (para todos los usuarios)
    channel.bind('request-approved', (data: { budget_request: any }) => {
      emmiter.emit("showToast", {
        message: `Budget request ${data.budget_request.id} has been approved`,
        type: "success"
      });
      router.refresh();
    });

    channel.bind('request-rejected', (data: { budget_request: any }) => {
      emmiter.emit("showToast", {
        message: `Budget request ${data.budget_request.id} has been rejected`,
        type: "error"
      });
      router.refresh();
    });

    // Limpiar suscripción al desmontar
    return () => {
      channel.unbind_all();
      pusher.unsubscribe('budget-requests');
    };
  }, [userRole, router]);

  return (
    <div className="space-y-6">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="flex flex-1 items-center gap-x-2 sm:gap-x-4">
    <div className="relative flex-1 min-w-[180px]">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="search"
        placeholder="Search by category or department..."
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
    <div className="w-[130px]">
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full bg-white text-black">
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
    <div className="w-[130px]">
      <Select value={filterDepartment} onValueChange={setFilterDepartment}>
        <SelectTrigger className="w-full bg-white text-black">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-md">
          <SelectItem value="all">All Departments</SelectItem>
          {localDepartments.map(dept => (
            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {(searchTerm || filterStatus !== 'all' || filterDepartment !== 'all') && (
      <Button 
        variant="ghost" 
        size="sm" 
        className="whitespace-nowrap"
        onClick={() => {
          setSearchTerm('');
          setFilterStatus('all');
          setFilterDepartment('all');
        }}
      >
        <FilterX className="mr-2 h-4 w-4" />
        Clear filters
      </Button>
    )}
  </div>
  {isAdmin && (
    <Button 
      onClick={() => setIsModalOpen(true)} 
      className="whitespace-nowrap"
      disabled={hasConnectionError}
    >
      Create Budget
    </Button>
  )}
</div>


      {/* Departament Budget Summary */}
      {budgetsByDepartment.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4">
          {budgetsByDepartment.map(dept => (
            dept.budgetCount > 0 && (
              <div 
                key={dept.id} 
                className="bg-white rounded-md border p-4 shadow-sm"
                onClick={() => setFilterDepartment(dept.id)}
              >
                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(dept.availableBudget)}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Total allocated: {formatCurrency(dept.totalBudget)}
                    </p>
                    {dept.approvedAmount > 0 && (
                      <p className="text-xs text-green-600">
                        Approved: {formatCurrency(dept.approvedAmount)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {dept.budgetCount} active budget{dept.budgetCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {filteredBudgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No budgets found</h3>
          <p className="text-sm text-gray-500 mb-3">
            {searchTerm || filterStatus !== 'all' || filterDepartment !== 'all'
              ? 'Try adjusting your filters' 
              : isAdmin ? 'Start by creating your first budget' : 'No budgets available'}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-md border">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%] min-w-[150px]">Category</TableHead>
                  <TableHead className="w-[15%] min-w-[120px]">Department</TableHead>
                  <TableHead className="w-[15%] min-w-[120px]">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell w-[25%] min-w-[200px]">Period</TableHead>
                  <TableHead className="w-[10%] min-w-[100px]">Status</TableHead>
                  {isAdmin && <TableHead className="w-[10%] text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium text-black truncate max-w-[180px]" title={budget.category.name}>
                      {budget.category.name}
                    </TableCell>
                    <TableCell className="text-black truncate max-w-[150px]" title={getDepartmentName(budget)}>
                      {getDepartmentName(budget)}
                    </TableCell>
                    <TableCell className="text-black whitespace-nowrap">{formatCurrency(budget.max_amount)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-black whitespace-nowrap">
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
                          disabled={hasConnectionError}
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
          </div>
          
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
        departments={departments}
        loading={loading}
        userDepartmentId={userDepartmentId}
      />

      <EditBudgetModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateBudget}
        categories={categories}
        departments={departments}
        budget={selectedBudget}
        loading={loading}
      />
    </div>
  );
}
