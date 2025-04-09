'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { NewBudgetRequestModal } from './NewBudgetRequestModal';
import { 
  CheckCircle, PlusCircle, XCircle, Search, FilterX, X, Calendar, Edit, Trash2, AlertCircle, Loader2, User 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createBudgetRequest, approveBudgetRequest, rejectBudgetRequest, updateBudgetRequest, deleteBudgetRequest, createCategory } from '@/app/budgets/actions';
import { useRouter } from 'next/navigation';
import { emmiter } from "@/lib/emmiter";
import { EditBudgetRequestModal } from './EditBudgetRequestModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination } from '@/components/ui/pagination';
import { getSession } from '@/app/lib/session';
import { type Department, type Category } from '@/types/budget';


interface BudgetRequest {
  id: string;
  user_id: string;
  category_id: string;
  requested_amount: number;
  description: string;
  request_date: string;
  status: string;
  reviewed_by: string | null;
  category: {
    name: string;
    department_id?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    name?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    username?: string;
    id?: string;
  };
  reviewer?: {
    name: string;
  };
}

export function BudgetRequestList({ 
  requests: initialRequests, 
  categories: initialCategories, // Renombrar para evitar conflicto
  departments: initialDepartments, 
  userRole, 
  hasConnectionError = false, 
  userDepartmentId, 
  userId 
}: { 
  requests: BudgetRequest[], 
  categories: Category[], 
  departments: Department[], 
  userRole: string, 
  hasConnectionError?: boolean, 
  userDepartmentId?: string, 
  userId: string 
}) {
  const [requests, setRequests] = useState<BudgetRequest[]>(initialRequests);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [categories, setCategories] = useState<Category[]>(initialCategories); // Agregar estado para categories
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Número de elementos por página

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'admin';

  // Efecto para establecer el departamento del usuario si no es admin
  useEffect(() => {
    if (!isAdmin && userDepartmentId) {
      setFilterDepartment(userDepartmentId);
    }
  }, [isAdmin, userDepartmentId]);

  // Check if the current user is the creator of a request
  const isCreator = (request: BudgetRequest) => {
    return request.user_id === userId; // Usar el userId pasado como prop
  };

  // Get user display name from various possible fields
  const getUserDisplayName = (request: BudgetRequest): string => {
    if (!request.user) {
      return `User ID: ${request.user_id}`;
    }
    
    const user = request.user;
    
    // Try different field combinations for name
    if (user.name) {
      return user.name;
    }
    
    // Try first name + last name combinations
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // Try single name fields
    if (user.firstName || user.first_name) {
      return user.firstName || user.first_name || '';
    }
    
    if (user.lastName || user.last_name) {
      return user.lastName || user.last_name || '';
    }
    
    // Use email or username as fallback
    if (user.email) {
      return user.email;
    }
    
    if (user.username) {
      return user.username;
    }
    
    // Last resort fallback
    return `User ID: ${request.user_id}`;
  };

  // Obtener el nombre del departamento para una solicitud
  const getDepartmentName = (request: BudgetRequest): string => {
    if (request.department?.name) {
      return request.department.name; // Asegurarse de que department y name existan
    }
    
    if (request.category?.department_id) {
      const department = departments.find(d => d.id === request.category.department_id);
      return department ? department.name : 'Unknown Department';
    }
    
    return 'No Department';
  };

  const handleCreateRequest = async (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
    department_id?: string;
    requested_amount: number;
    description: string;
    isNewCategory: boolean;
  }) => {
    try {
      setLoading(true);
      
      let categoryId = data.category_id || '';
      
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
          return;
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
      
      // Ensure categoryId is always defined
      if (!categoryId && categories.length > 0) {
        categoryId = categories[0].id;
      } else if (!categoryId) {
        categoryId = '1'; // Default fallback
      }
      
      const formattedData = {
        category_id: categoryId,
        requested_amount: data.requested_amount,
        description: data.description
      };
      
      const response = await createBudgetRequest(formattedData);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to create request: ${response.error}`,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request created successfully",
          type: "success"
        });
        router.refresh();
      }
    } catch (error) {
      emmiter.emit("showToast", {
        message: "Could not create the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // Function to handle approving a request
  const handleApproveRequest = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await approveBudgetRequest(id);
      
      if (response.error) {
        let errorMessage = response.error;
        
        // Personalizar mensaje según el tipo de error de presupuesto
        if (response.budgetInfo) {
          const { requested, available, budget_type, department } = response.budgetInfo;
          
          if (budget_type === 'total') {
            errorMessage = `Not enough total budget available. Requested: ${formatCurrency(requested)}, Available: ${formatCurrency(available)}`;
          } else if (budget_type === 'department') {
            errorMessage = `Not enough budget available in department ${department}. Requested: ${formatCurrency(requested)}, Available: ${formatCurrency(available)}`;
          }
        }
        
        emmiter.emit("showToast", {
          message: errorMessage,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request approved successfully",
          type: "success"
        });
        router.refresh();
      }
    } catch (error) {
      emmiter.emit("showToast", {
        message: "Could not approve the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle rejecting a request
  const handleRejectRequest = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await rejectBudgetRequest(id);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to reject request: ${response.error}`,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request rejected successfully",
          type: "success"
        });
        router.refresh();
      }
    } catch (error) {
      emmiter.emit("showToast", {
        message: "Could not reject the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request: BudgetRequest) => {
    // Verificar que el usuario sea admin o el creador de la solicitud
    if (!isAdmin && !isCreator(request)) {
      emmiter.emit("showToast", {
        message: "You can only edit your own budget requests",
        type: "error"
      });
      return;
    }
    
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleUpdateRequest = async (id: string, data: {
    category_id?: string;
    requested_amount?: number;
    description?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await updateBudgetRequest(id, data);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to update request: ${response.error}`,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request updated successfully",
          type: "success"
        });
        router.refresh();
      }
    } catch (error) {
      emmiter.emit("showToast", {
        message: "Could not update the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteRequest = (request: BudgetRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRequest) return;
    
    // Verificar que el usuario sea admin o el creador de la solicitud
    if (!isAdmin && !isCreator(selectedRequest)) {
      emmiter.emit("showToast", {
        message: "You can only delete your own budget requests",
        type: "error"
      });
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await deleteBudgetRequest(selectedRequest.id);
      
      if (response.error) {
        emmiter.emit("showToast", {
          message: `Failed to delete request: ${response.error}`,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request deleted successfully",
          type: "success"
        });
        router.refresh();
      }
    } catch (error) {
      emmiter.emit("showToast", {
        message: "Could not delete the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Efecto para Pusher
  useEffect(() => {   
    try {
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
        console.error('Pusher configuration is missing');
        return;
      }

      // Inicializar Pusher
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        forceTLS: true, // Asegurar conexión segura si es necesario
      });

      // Suscribirse al canal de budget requests
      const channel = pusher.subscribe('budget-requests');

      // Manejar nuevo budget request (solo para admin)
      if (userRole === 'admin') {
        channel.bind('new-request', (data: { budget_request: BudgetRequest }) => {
          console.log('Evento recibido: new-request', data);
          setRequests(prev => [data.budget_request, ...prev]);
          emmiter.emit("showToast", {
            message: "New budget request received",
            type: "success"
          });
        });
      }

      // Manejar actualizaciones de status (para todos los usuarios)
      channel.bind('request-approved', (data: { budget_request: BudgetRequest }) => {
        console.log('Evento recibido: request-approved', data);
        setRequests(prev => prev.map(req => 
          req.id === data.budget_request.id ? data.budget_request : req
        ));
        emmiter.emit("showToast", {
          message: `Budget request ${data.budget_request.id} has been approved`,
          type: "success"
        });
      });

      channel.bind('request-rejected', (data: { budget_request: BudgetRequest }) => {
        console.log('Evento recibido: request-rejected', data);
        setRequests(prev => prev.map(req => 
          req.id === data.budget_request.id ? data.budget_request : req
        ));
        emmiter.emit("showToast", {
          message: `Budget request ${data.budget_request.id} has been rejected`,
          type: "error"
        });
      });

      channel.bind('request-updated', (data: { budget_request: BudgetRequest }) => {
        console.log('Evento recibido: request-updated', data);
        setRequests(prev => prev.map(req => 
          req.id === data.budget_request.id ? data.budget_request : req
        ));
        emmiter.emit("showToast", {
          message: `Budget request ${data.budget_request.id} has been updated`,
          type: "success"
        });
      });

      // Limpiar suscripción al desmontar
      return () => {
        try {
          channel.unbind_all();
          pusher.unsubscribe('budget-requests');
        } catch (error) {
          console.error('Error cleaning up Pusher:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
  }, [userRole]);

  // Actualizar el estado local cuando cambian los props
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Helper functions for localStorage
  const getFromLocalStorage = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  };

  const saveToLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  useEffect(() => {
    // Load departments and categories from localStorage if available
    const storedDepartments = getFromLocalStorage("departments");
    const storedCategories = getFromLocalStorage("categories");

    if (storedDepartments) {
      console.log("Loaded departments from localStorage");
      setDepartments(storedDepartments);
    }

    if (storedCategories) {
      console.log("Loaded categories from localStorage");
      setCategories(storedCategories); // Ahora setCategories está definido
    }
  }, []);

  // Save departments and categories to localStorage when they are updated
  useEffect(() => {
    if (departments.length > 0) {
      saveToLocalStorage("departments", departments);
    }
  }, [departments]);

  useEffect(() => {
    if (categories.length > 0) {
      saveToLocalStorage("categories", categories);
    }
  }, [categories]);

  // Filter requests based on status, department and search
  const filteredRequests = useMemo(() => requests.filter(request => {
    // Status filter
    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }

    // Department filter (only for admin)
    if (isAdmin && filterDepartment !== 'all') {
      if (!request.category?.department_id) return false; // Validar que category y department_id existan
      if (request.category.department_id !== filterDepartment) {
        return false;
      }
    }

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = request.user?.name?.toLowerCase() || '';
      const firstName = (request.user?.first_name || request.user?.firstName || '').toLowerCase();
      const lastName = (request.user?.last_name || request.user?.lastName || '').toLowerCase();
      const categoryName = request.category?.name?.toLowerCase() || '';
      const description = request.description.toLowerCase();

      return userName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        description.includes(searchLower);
    }

    return true;
  }), [requests, filterStatus, filterDepartment, searchTerm, isAdmin]);
  
  // Paginación - Calcular elementos para la página actual
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  
  // Cambiar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDepartment]);

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': 
        return 'bg-green-100 text-green-800';
      case 'rejected': 
        return 'bg-red-100 text-red-800';
      case 'pending': 
        return 'bg-amber-100 text-amber-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Agrupar solicitudes por departamento para estadísticas
  const requestsByDepartment = departments.map(dept => {
    const deptRequests = requests.filter(request => {
      const requestDeptId = request.department?.id || request.category?.department_id; // Asegurarse de que request.category exista
      return requestDeptId === dept.id;
    });
    
    const pendingCount = deptRequests.filter(req => req.status === 'pending').length;
    const approvedCount = deptRequests.filter(req => req.status === 'approved').length;
    const rejectedCount = deptRequests.filter(req => req.status === 'rejected').length;

    const totalAmount = deptRequests
      .filter(req => req.status === 'approved')
      .reduce((sum, req) => sum + parseFloat(req.requested_amount.toString()), 0);
    
    return {
      id: dept.id,
      name: dept.name,
      requestCount: deptRequests.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalAmount
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 overflow-hidden flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by requester, department or category..."
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
          <div className="w-[160px] min-w-[140px]">
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem></SelectContent>
            </Select>
          </div>
          {/* Filtro por departamento - Solo visible para administradores */}
          {isAdmin && (
            <div className="w-[160px] min-w-[140px]">
              <Select 
                value={filterDepartment} 
                onValueChange={setFilterDepartment}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(searchTerm || filterStatus !== 'all' || filterDepartment !== 'all') && (
            <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDepartment('all');
            }}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        {userRole && (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="whitespace-nowrap"
            disabled={hasConnectionError}
          >
            New Request
          </Button>
        )}
      </div>

      {/* Department Summary Cards */}
      {requestsByDepartment.length > 0 && isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4">
          {requestsByDepartment.map(dept => (
            dept.requestCount > 0 && (
              <div 
                key={`dept-${dept.id}`} // Prefijo para garantizar unicidad
                className="bg-white rounded-md border p-4 shadow-sm"
                onClick={() => setFilterDepartment(dept.id)}
              >
                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-amber-50 p-1 rounded">
                    <span className="text-amber-600 font-bold block">{dept.pendingCount}</span>
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <div className="bg-green-50 p-1 rounded">
                    <span className="text-green-600 font-bold block">{dept.approvedCount}</span>
                    <span className="text-xs text-gray-600">Approved</span>
                  </div>
                  <div className="bg-red-50 p-1 rounded">
                    <span className="text-red-600 font-bold block">{dept.rejectedCount}</span>
                    <span className="text-xs text-gray-600">Rejected</span>
                  </div>
                </div>
                {dept.approvedCount > 0 && (
                  <p className="text-sm font-medium mt-2 text-blue-600">{formatCurrency(dept.totalAmount)} approved</p>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No budget requests found</h3>
          <p className="text-sm text-gray-500 mb-3">
            {searchTerm || filterStatus !== 'all' || filterDepartment !== 'all'
              ? 'Try adjusting your filters' 
              : 'Start by creating your first budget request'}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-md border">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] min-w-[150px]">Created By</TableHead>
                  <TableHead className="w-[15%] min-w-[120px]">Department</TableHead>
                  <TableHead className="w-[15%] min-w-[120px]">Category</TableHead>
                  <TableHead className="w-[10%] min-w-[100px]">Amount</TableHead>
                  <TableHead className="hidden md:table-cell w-[20%]">Description</TableHead>
                  <TableHead className="hidden sm:table-cell w-[10%] min-w-[100px]">Date</TableHead>
                  <TableHead className="w-[10%] min-w-[100px]">Status</TableHead>
                  {isAdmin && <TableHead className="w-[160px] text-right">Actions</TableHead>}
                  {!isAdmin && <TableHead className="w-[80px] text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((request) => (
                  <TableRow 
                    key={`request-${request.id}`} // Prefijo para garantizar unicidad
                    className={isCreator(request) ? "bg-blue-50" : ""}
                  >
                    <TableCell className="font-semibold">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="text-black truncate max-w-[150px]">
                            {getUserDisplayName(request)}
                          </div>
                        </div>
                        {isCreator(request) && (
                          <span className="text-xs text-blue-600 mt-1 font-bold bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                            You
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-black truncate max-w-[120px]">
                      {getDepartmentName(request)}
                    </TableCell>
                    <TableCell className="text-black truncate max-w-[120px]">{request.category?.name || 'No Category'}</TableCell>
                    <TableCell className="text-black whitespace-nowrap">{formatCurrency(request.requested_amount)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-black truncate max-w-[250px]" title={request.description}>
                        {request.description}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-black whitespace-nowrap">{formatDate(request.request_date)}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusStyle(request.status))}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Solo mostrar botones de aprobar/rechazar para administradores */}
                        {isAdmin && request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={loading || hasConnectionError}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loading || hasConnectionError}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                        
                        {/* Mostrar botón de editar solo para el creador o admin */}
                        {(isAdmin || isCreator(request)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRequest(request)}
                            disabled={loading || hasConnectionError}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        
                        {/* Mostrar botón de eliminar solo para el creador o admin */}
                        {(isAdmin || isCreator(request)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRequest(request)}
                            disabled={loading || hasConnectionError}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Componente de paginación */}
            <div className="p-4">
              <Pagination
                totalCount={filteredRequests.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}

      <NewBudgetRequestModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateRequest}
        categories={categories}
        departments={departments}
        loading={loading}
        isAdmin={userRole === 'admin'}
        userDepartmentId={userDepartmentId}
      />

      <EditBudgetRequestModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateRequest}
        categories={categories}
        departments={departments}
        request={selectedRequest}
        loading={loading}
        userRole={userRole}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this budget request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}