'use client';

import { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2 } from 'lucide-react';
import { type Department, type Category } from '@/app/budgets/actions';
import axios from 'axios';
import { emmiter } from '@/lib/emmiter';
import { cn } from '@/lib/utils';

interface NewBudgetRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
    department_id?: string;
    requested_amount: number;
    description: string;
    isNewCategory: boolean;
  }) => void;
  categories: Category[];
  departments: Department[];
  loading?: boolean;
}

export function NewBudgetRequestModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  departments,
  loading = false
}: NewBudgetRequestModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [userDepartment, setUserDepartment] = useState<Department | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [errors, setErrors] = useState<{
    category?: string;
    requestedAmount?: string;
    description?: string;
  }>({});

  // Check if there are available categories
  const hasCategories = categories.length > 0;
  
  // Check if there are available departments
  const hasDepartments = departments.length > 0;

  // Cargar información del usuario cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadUserDepartment();
    }
  }, [open]);

  // Cargar el departamento del usuario
  const loadUserDepartment = async () => {
    try {
      setLoadingUserInfo(true);
      const response = await axios.get('/api/user');
      
      if (response.data && response.data.department) {
        // Si el usuario tiene un departamento asignado, lo utilizamos
        const userDept = response.data.department;
        console.log('Departamento del usuario:', userDept);
        
        // Buscar el departamento en la lista de departamentos
        const matchingDepartment = departments.find(d => d.id === userDept.id);
        
        if (matchingDepartment) {
          setUserDepartment(matchingDepartment);
          setDepartmentId(matchingDepartment.id);
          console.log('Departamento seleccionado automáticamente:', matchingDepartment.name);
          
          // Filtrar categorías para este departamento
          filterCategoriesByDepartment(matchingDepartment.id);
        }
      } else {
        console.log('Usuario sin departamento asignado');
        // Si el usuario no tiene departamento, utilizamos el primer departamento disponible
        if (hasDepartments && departments.length > 0) {
          setDepartmentId(departments[0].id);
          filterCategoriesByDepartment(departments[0].id);
        }
      }
    } catch (error) {
      console.error('Error al cargar el departamento del usuario:', error);
      emmiter.emit('showToast', {
        message: 'No se pudo cargar la información del departamento',
        type: 'error'
      });
      
      // Si falla, utilizamos el primer departamento disponible
      if (hasDepartments && departments.length > 0) {
        setDepartmentId(departments[0].id);
        filterCategoriesByDepartment(departments[0].id);
      }
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Filtrar categorías por departamento
  const filterCategoriesByDepartment = (deptId: string) => {
    if (deptId && categories.length > 0) {
      const filtered = categories.filter(cat => cat.department_id === deptId);
      setFilteredCategories(filtered);
      
      // Si hay categorías filtradas, seleccionar la primera por defecto
      if (filtered.length > 0 && !isAddingNewCategory) {
        setCategoryId(filtered[0].id);
      }
    } else {
      setFilteredCategories(categories);
    }
  };

  // If there are no categories, force creating a new one
  useEffect(() => {
    if (!hasCategories) {
      setIsAddingNewCategory(true);
    }
  }, [hasCategories]);

  // Cuando se selecciona un departamento, filtrar las categorías
  useEffect(() => {
    if (departmentId) {
      filterCategoriesByDepartment(departmentId);
    }
  }, [departmentId, categories]);

  // Cuando se selecciona una categoría existente, actualizar el departamento
  useEffect(() => {
    if (!isAddingNewCategory && categoryId) {
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      if (selectedCategory && selectedCategory.department_id) {
        setDepartmentId(selectedCategory.department_id);
      }
    }
  }, [categoryId, categories, isAddingNewCategory]);

  // Función de validación
  const validateForm = () => {
    const newErrors: {
      category?: string;
      requestedAmount?: string;
      description?: string;
    } = {};

    // Validate category
    if (!categoryId && !isAddingNewCategory) {
      newErrors.category = 'Please select a category';
    }
    if (isAddingNewCategory && !newCategoryName) {
      newErrors.category = 'Please enter a name for the new category';
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
    if (!validateForm()) {
      emmiter.emit('showToast', {
        message: 'Please correct the errors in the form',
        type: 'error'
      });
      return;
    }

    onSubmit({
      category_id: isAddingNewCategory ? undefined : categoryId,
      category_name: isAddingNewCategory ? newCategoryName : undefined,
      category_type: isAddingNewCategory ? newCategoryType : undefined,
      department_id: departmentId,
      requested_amount: parseFloat(requestedAmount),
      description,
      isNewCategory: isAddingNewCategory,
    });

    // Reset form after submission
    resetForm();
  };

  const resetForm = () => {
    setCategoryId('');
    setRequestedAmount('');
    setDescription('');
    setIsAddingNewCategory(!hasCategories); // Keep true if no categories
    setNewCategoryName('');
    setNewCategoryType('');
    
    // Mantener el departamento del usuario si está disponible
    if (userDepartment) {
      setDepartmentId(userDepartment.id);
    } else if (hasDepartments && departments.length > 0) {
      setDepartmentId(departments[0].id);
    } else {
      setDepartmentId('');
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleAddNewCategory = () => {
    setIsAddingNewCategory((prev) => !prev);
    if (!isAddingNewCategory) {
      setCategoryId('');
    } else {
      setNewCategoryName('');
      setNewCategoryType('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-auto bg-white">
        <SheetHeader>
          <SheetTitle>New Budget Request</SheetTitle>
        </SheetHeader>
        <div className="my-6 space-y-6">
          {/* Department selection */}
          {hasDepartments && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={departmentId} 
                onValueChange={setDepartmentId}
                disabled={loadingUserInfo}
              >
                <SelectTrigger id="department" className={cn("w-full bg-white", loadingUserInfo ? "opacity-70" : "")}>
                  <SelectValue placeholder={loadingUserInfo ? "Loading department..." : "Select department"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userDepartment && (
                <p className="text-xs text-gray-500">Assigned department: {userDepartment.name}</p>
              )}
            </div>
          )}

          {/* Category Selection or Create New */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
              {hasCategories && (
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  onClick={toggleAddNewCategory}
                  className="h-auto p-0 text-blue-600"
                >
                  {isAddingNewCategory ? "Select Existing" : "Create New"}
                </Button>
              )}
            </div>

            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}

            {isAddingNewCategory ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-category-name">Category Name</Label>
                  <Input
                    id="new-category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Marketing Materials"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-category-type">Category Type</Label>
                  <Input
                    id="new-category-type"
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    placeholder="e.g., Expense, Operational"
                    className="w-full"
                  />
                </div>
              </div>
            ) : hasCategories ? (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" className="w-full bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {departmentId ? (
                    // Show categories filtered by department
                    filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available for this department
                      </SelectItem>
                    )
                  ) : (
                    // Show all categories if no department is selected
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {category.department?.name ? ` (${category.department.name})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {/* Requested Amount */}
          <div className="space-y-2">
            <Label htmlFor="requested-amount">Requested Amount</Label>
            <Input
              id="requested-amount"
              type="number"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder="0.00"
              className={cn("w-full", errors.requestedAmount && "border-red-500")}
              step="0.01"
              min="0.01"
              max="999999999.99"
            />
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
              placeholder="Describe why you need this budget..."
              className={cn("w-full min-h-[120px]", errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {description.length}/1000 characters
            </p>
          </div>
        </div>
        <SheetFooter className="pt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 