"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { type Department, type Category } from '@/app/budgets/actions'
import { emmiter } from '@/lib/emmiter'
import { cn } from "@/lib/utils"

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

interface EditBudgetRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (id: string, data: {
    category_id?: string
    requested_amount?: number
    description?: string
    status?: string
  }) => void
  categories: Category[]
  departments: Department[]
  request: BudgetRequest | null
  loading?: boolean
  userRole: string
}

export function EditBudgetRequestModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  departments,
  request,
  loading = false,
  userRole
}: EditBudgetRequestModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [requestedAmount, setRequestedAmount] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<{
    category?: string;
    requestedAmount?: string;
    description?: string;
  }>({});

  const isAdmin = userRole === "admin"

  // Load request data when modal opens or selected request changes
  useEffect(() => {
    if (request) {
      // Load request data into state
      setCategoryId(request.category_id || "")
      setRequestedAmount(request.requested_amount.toString() || "")
      setDescription(request.description || "")
      setStatus(request.status || "")
      
      // Obtener y establecer el departamento
      const deptId = request.department?.id || 
                  (request.category && request.category.department_id) || '';
      setDepartmentId(deptId);
      
      // Filtrar categorías por departamento
      filterCategoriesByDepartment(deptId);
    }
  }, [request, open])

  // Filtrar categorías por departamento
  const filterCategoriesByDepartment = (deptId: string) => {
    if (deptId && categories.length > 0) {
      const filtered = categories.filter(cat => cat.department_id === deptId);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  };

  // Actualizar el departamento cuando cambie la categoría
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      if (selectedCategory && selectedCategory.department_id) {
        setDepartmentId(selectedCategory.department_id);
      }
    }
  }, [categoryId, categories]);

  // Cuando se selecciona un departamento, filtrar las categorías
  useEffect(() => {
    if (departmentId) {
      filterCategoriesByDepartment(departmentId);
    }
  }, [departmentId, categories]);

  // Función de validación
  const validateForm = () => {
    const newErrors: {
      category?: string;
      requestedAmount?: string;
      description?: string;
    } = {};

    // Validate category
    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }

    // Validate amount
    if (!requestedAmount) {
      newErrors.requestedAmount = 'Amount is required';
    } else {
      const amount = parseFloat(requestedAmount);
      if (isNaN(amount)) {
        newErrors.requestedAmount = 'Amount must be a valid number';
      } else if (amount <= 0) {
        newErrors.requestedAmount = 'Amount must be greater than 0';
      } else if (amount > 999999999.99) {
        newErrors.requestedAmount = 'Amount cannot exceed 999,999,999.99';
      } else if (!/^\d+(\.\d{1,2})?$/.test(requestedAmount)) {
        newErrors.requestedAmount = 'Amount must have a maximum of 2 decimal places';
      }
    }

    // Validate description
    if (!description) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    } else if (!/^[a-zA-Z0-9\s\-_.,!?()áéíóúÁÉÍÓÚñÑ]+$/.test(description)) {
      newErrors.description = 'Description can only contain letters, numbers, and basic punctuation marks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!request || !validateForm()) {
      emmiter.emit('showToast', {
        message: 'Please correct the errors in the form',
        type: 'error'
      });
      return;
    }

    const updatedData = {
      category_id: categoryId,
      requested_amount: parseFloat(requestedAmount),
      description,
      status
    };

    onSubmit(request.id, updatedData);
  };

  // Get department name for display
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  if (!request) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Edit Budget Request</SheetTitle>
        </SheetHeader>
        <div className="my-6 space-y-6">
          {/* Requester information - read only */}
          <div className="space-y-2">
            <Label htmlFor="requester">Requester</Label>
            <Input 
              id="requester" 
              value={request.user?.name || request.user?.firstName || request.user?.first_name || request.user?.lastName || request.user?.last_name || request.user?.email || request.user?.username || request.user?.id || ""} 
              readOnly
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Department display (read-only) */}
          {departmentId && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="p-2 border rounded bg-gray-50">
                {getDepartmentName(departmentId)}
              </div>
            </div>
          )}

          {/* Category selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className={cn("w-full bg-white", errors.category && "border-red-500")}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="requested-amount">Requested Amount</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="requested-amount"
                type="number"
                className={cn("pl-6 w-full", errors.requestedAmount && "border-red-500")}
                placeholder="0.00"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                step="0.01"
                min="0.01"
                max="999999999.99"
              />
            </div>
            {errors.requestedAmount && (
              <p className="text-sm text-red-500">{errors.requestedAmount}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this request"
              className={cn("min-h-[120px]", errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Status - admin only */}
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="w-full bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pending" className="text-amber-600">Pending</SelectItem>
                  <SelectItem value="approved" className="text-green-600">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-red-600">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <SheetFooter className="flex justify-between sm:justify-end gap-2 mt-8">
          <Button variant="outline" onClick={onOpenChange} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Request
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 