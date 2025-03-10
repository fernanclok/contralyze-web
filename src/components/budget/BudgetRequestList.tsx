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
import { NewBudgetRequestModal } from './NewBudgetRequestModal';
import { 
  CheckCircle, PlusCircle, XCircle, Search, FilterX, X, Calendar, Edit, Trash2, AlertCircle, Loader2, User 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createBudgetRequest, approveBudgetRequest, rejectBudgetRequest, updateBudgetRequest, deleteBudgetRequest, createCategory } from '@/app/dashboard/budgets/actions';
import { useRouter } from 'next/navigation';
import { emmiter } from "@/lib/emmiter";
import { EditBudgetRequestModal } from './EditBudgetRequestModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination } from '@/components/ui/pagination';

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

export function BudgetRequestList({ requests, categories, userRole }: { 
  requests: BudgetRequest[],
  categories: { id: string, name: string }[],
  userRole: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<BudgetRequest | null>(null);
  const [isApproveAlertOpen, setIsApproveAlertOpen] = useState(false);
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [requestToApproveReject, setRequestToApproveReject] = useState<BudgetRequest | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Número de elementos por página

  // Verificar si el usuario es administrador
  const isAdmin = userRole === 'admin';

  // Get current user ID from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('user_id'));
    }
  }, []);

  // Check if the current user is the creator of a request
  const isCreator = (request: BudgetRequest) => {
    return request.user_id === currentUserId;
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

  const handleCreateRequest = async (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
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
          category_type: data.category_type
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
      
      console.log('Sending budget request data:', formattedData);
      
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
      console.error('Error creating budget request:', error);
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
        emmiter.emit("showToast", {
          message: `Failed to approve request: ${response.error}`,
          type: "error"
        });
      } else {
        emmiter.emit("showToast", {
          message: "Budget request approved successfully",
          type: "success"
        });
        router.refresh(); // Actualizar la página para reflejar el cambio
      }
    } catch (error) {
      console.error('Error approving budget request:', error);
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
      
      console.log('Rejecting budget request:', id);
      
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
      console.error('Error rejecting budget request:', error);
      emmiter.emit("showToast", {
        message: "Could not reject the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request: BudgetRequest) => {
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
      
      console.log('Updating budget request:', id, data);
      
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
        router.refresh(); // Refresh the page to show changes
      }
    } catch (error) {
      console.error('Error updating budget request:', error);
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
        router.refresh(); // Refresh the page to show changes
      }
    } catch (error) {
      console.error('Error deleting budget request:', error);
      emmiter.emit("showToast", {
        message: "Could not delete the budget request",
        type: "error"
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Filter requests based on status and search
  const filteredRequests = requests.filter(request => {
    // Status filter
    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }
    
    // Search by requester or category
    const searchLower = searchTerm.toLowerCase();
    
    const requesterName = getUserDisplayName(request).toLowerCase();
    const categoryName = request.category.name.toLowerCase();
    
    if (searchTerm && !requesterName.includes(searchLower) && !categoryName.includes(searchLower)) {
      return false;
    }
    
    return true;
  });
  
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
  }, [searchTerm, filterStatus]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 overflow-hidden flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by requester or category..."
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
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || filterStatus !== 'all') && (
            <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        {userRole && (
          <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No budget requests found</h3>
          <p className="text-sm text-gray-500 mb-3">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Start by creating your first budget request'}
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
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created By</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-[160px] text-right">Actions</TableHead>}
                  {!isAdmin && <TableHead className="w-[80px] text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((request) => (
                  <TableRow key={request.id} className={isCreator(request) ? "bg-blue-50" : ""}>
                    <TableCell className="font-semibold">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <div className="text-black">
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
                    <TableCell className="text-black">{request.category.name}</TableCell>
                    <TableCell className="text-black">{formatCurrency(request.requested_amount)}</TableCell>
                    <TableCell className="max-w-xs truncate text-black">{request.description}</TableCell>
                    <TableCell className="text-black">{formatDate(request.request_date)}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusStyle(request.status))}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* For admins, show approve/reject buttons for pending requests */}
                        {isAdmin && request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={loading}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loading}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                        
                        {/* Edit button - Only for the creator or admin */}
                        {(isAdmin || isCreator(request)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRequest(request)}
                            disabled={loading}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        
                        {/* Delete button - Only for the creator or admin */}
                        {(isAdmin || isCreator(request)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRequest(request)}
                            disabled={loading}
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
      )}

      <NewBudgetRequestModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateRequest}
        categories={categories}
        loading={loading}
      />

      <EditBudgetRequestModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateRequest}
        categories={categories}
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