"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, addDays, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, PlusCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Department, type Category } from '@/app/budgets/actions'
import axios from "axios"
import { emmiter } from "@/lib/emmiter";

interface NewBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    category_id?: string
    category_name?: string
    category_type?: string
    department_id?: string
    max_amount: number
    start_date: Date
    end_date: Date
    isNewCategory: boolean
    periodicity: string
  }) => void
  categories: Category[]
  departments: Department[]
  loading?: boolean
  userDepartmentId?: string
}

// Periodicity options
type PeriodOption = {
  value: string;
  label: string;
  calculateEndDate: (startDate: Date) => Date;
};

const periodOptions: PeriodOption[] = [
  { 
    value: "monthly", 
    label: "Monthly", 
    calculateEndDate: (startDate) => addMonths(startDate, 1) 
  },
  { 
    value: "bimonthly", 
    label: "Bimonthly", 
    calculateEndDate: (startDate) => addMonths(startDate, 2) 
  },
  { 
    value: "quarterly", 
    label: "Quarterly", 
    calculateEndDate: (startDate) => addMonths(startDate, 3) 
  },
  { 
    value: "semester", 
    label: "Semester", 
    calculateEndDate: (startDate) => addMonths(startDate, 6) 
  },
  { 
    value: "annual", 
    label: "Annual", 
    calculateEndDate: (startDate) => addMonths(startDate, 12) 
  },
  { 
    value: "custom", 
    label: "Custom", 
    calculateEndDate: (startDate) => startDate // Does not change the end date
  }
];

export function NewBudgetModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  departments,
  loading = false,
  userDepartmentId
}: NewBudgetModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addMonths(new Date(), 1))
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [periodicity, setPeriodicity] = useState("monthly")
  const [userDepartment, setUserDepartment] = useState<Department | null>(null)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loadingUserInfo, setLoadingUserInfo] = useState(false)

  // Current date for validation
  const today = startOfDay(new Date());

  // Check if there are available categories
  const hasCategories = categories.length > 0
  
  // Check if there are available departments
  const hasDepartments = departments.length > 0

  // Cargar información del usuario cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadUserDepartment();
    }
  }, [open, userDepartmentId]);

  // Cargar el departamento del usuario
  const loadUserDepartment = () => {
    try {
      setLoadingUserInfo(true);
      
      if (userDepartmentId) {
        // Buscar el departamento en la lista de departamentos
        const matchingDepartment = departments.find(d => String(d.id) === String(userDepartmentId));
        
        if (matchingDepartment) {
          setUserDepartment(matchingDepartment);
          setDepartmentId(matchingDepartment.id);
          console.log('Departamento seleccionado automáticamente:', matchingDepartment.name);
          
          // Filtrar categorías para este departamento
          filterCategoriesByDepartment(matchingDepartment.id);
        } else {
          console.log('No se encontró el departamento en la lista:', userDepartmentId);
          // Intentar usar el ID directamente
          setDepartmentId(String(userDepartmentId));
          filterCategoriesByDepartment(String(userDepartmentId));
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

  // If there are no categories, force the creation of a new one
  useEffect(() => {
    if (!hasCategories) {
      setIsAddingNewCategory(true)
    }
  }, [hasCategories])

  // Update end date when start date or periodicity changes
  useEffect(() => {
    if (startDate && periodicity !== "custom") {
      const option = periodOptions.find(opt => opt.value === periodicity);
      if (option) {
        setEndDate(option.calculateEndDate(startDate));
      }
    }
  }, [startDate, periodicity]);

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

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      // Make sure the selected date is not earlier than today
      const selectedDate = isBefore(date, today) ? today : date;
      setStartDate(selectedDate);
      
      // Update end date based on selected periodicity
      if (periodicity !== "custom") {
        const option = periodOptions.find(opt => opt.value === periodicity);
        if (option) {
          setEndDate(option.calculateEndDate(selectedDate));
        }
      }
    }
  };

  const handlePeriodicityChange = (value: string) => {
    setPeriodicity(value);
    
    // Update end date if there's a start date
    if (startDate && value !== "custom") {
      const option = periodOptions.find(opt => opt.value === value);
      if (option) {
        setEndDate(option.calculateEndDate(startDate));
      }
    }
  };

  const handleSubmit = () => {
    if (
      (!categoryId && !isAddingNewCategory) ||
      (isAddingNewCategory && !newCategoryName) ||
      !maxAmount ||
      !startDate ||
      !endDate ||
      (hasDepartments && !departmentId)
    ) {
      // Mostrar error de validación
      emmiter.emit('showToast', {
        message: 'Por favor, completa todos los campos requeridos',
        type: 'error'
      });
      return
    }

    onSubmit({
      category_id: isAddingNewCategory ? undefined : categoryId,
      category_name: isAddingNewCategory ? newCategoryName : undefined,
      category_type: isAddingNewCategory ? newCategoryType : undefined,
      department_id: departmentId,
      max_amount: parseFloat(maxAmount),
      start_date: startDate!,
      end_date: endDate!,
      isNewCategory: isAddingNewCategory,
      periodicity: periodicity,
    })

    // Reset form after submission
    resetForm()
  }

  const resetForm = () => {
    setCategoryId("")
    setMaxAmount("")
    setStartDate(new Date())
    setEndDate(addMonths(new Date(), 1))
    setIsAddingNewCategory(!hasCategories) // Keep true if no categories
    setNewCategoryName("")
    setNewCategoryType("")
    
    // Mantener el departamento del usuario si está disponible
    if (userDepartment) {
      setDepartmentId(userDepartment.id);
    } else if (hasDepartments && departments.length > 0) {
      setDepartmentId(departments[0].id);
    } else {
      setDepartmentId("");
    }
    
    setPeriodicity("monthly")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const toggleAddNewCategory = () => {
    setIsAddingNewCategory((prev) => !prev)
    if (!isAddingNewCategory) {
      setCategoryId("")
    } else {
      setNewCategoryName("")
      setNewCategoryType("")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Create New Budget</SheetTitle>
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
                  <SelectValue placeholder={loadingUserInfo ? "Cargando departamento..." : "Select department"} />
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
                <p className="text-xs text-gray-500">Departamento asignado: {userDepartment.name}</p>
              )}
            </div>
          )}

          {/* Category selection or create new */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
              {hasCategories && (
                <Button 
                  type="button" 
                  onClick={toggleAddNewCategory} 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-blue-600"
                >
                  {isAddingNewCategory ? "Select Existing" : "Create New"}
                </Button>
              )}
            </div>

            {isAddingNewCategory ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-category-name">Category Name</Label>
                  <Input
                    id="new-category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Marketing"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-category-type">Category Type</Label>
                  <Input
                    id="new-category-type"
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    placeholder="e.g., Expense, Income, Investment"
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
                    // Mostrar categorías filtradas por departamento
                    filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No hay categorías para este departamento
                      </SelectItem>
                    )
                  ) : (
                    // Mostrar todas las categorías si no hay departamento seleccionado
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

          {/* Budget Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              type="number"
              placeholder="0.00"
              className="w-full"
            />
          </div>

          {/* Periodicity */}
          <div className="space-y-2">
            <Label htmlFor="periodicity">Budget Period</Label>
            <Select value={periodicity} onValueChange={handlePeriodicityChange}>
              <SelectTrigger id="periodicity" className="w-full bg-white">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  disabled={[{ from: new Date(0), to: today }]}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="end-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    periodicity !== "custom" ? "bg-gray-100 text-gray-500" : "bg-white"
                  )}
                  disabled={periodicity !== "custom"}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              {periodicity === "custom" && (
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? isBefore(date, startDate) : false}
                  />
                </PopoverContent>
              )}
            </Popover>
            {periodicity !== "custom" && (
              <p className="text-xs text-gray-500">
                End date is automatically calculated based on the selected period
              </p>
            )}
          </div>
        </div>
        <SheetFooter className="pt-6">
          <Button 
            onClick={handleSubmit} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Budget'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

