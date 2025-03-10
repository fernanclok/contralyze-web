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

interface Category {
  id: string
  name: string
}

interface NewBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    category_id?: string
    category_name?: string
    category_type?: string
    max_amount: number
    start_date: Date
    end_date: Date
    isNewCategory: boolean
    periodicity: string
  }) => void
  categories: Category[]
  loading?: boolean
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
  loading = false 
}: NewBudgetModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addMonths(new Date(), 1))
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState("")
  const [periodicity, setPeriodicity] = useState("monthly")

  // Current date for validation
  const today = startOfDay(new Date());

  // Check if there are available categories
  const hasCategories = categories.length > 0

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
      !endDate
    ) {
      // Handle validation errors
      return
    }

    onSubmit({
      category_id: isAddingNewCategory ? undefined : categoryId,
      category_name: isAddingNewCategory ? newCategoryName : undefined,
      category_type: isAddingNewCategory ? newCategoryType : undefined,
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="max-amount">Maximum Amount</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="max-amount"
                type="number"
                className="pl-6 w-full"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Periodicity */}
          <div className="space-y-2">
            <Label htmlFor="periodicity">Periodicity</Label>
            <Select value={periodicity} onValueChange={handlePeriodicityChange}>
              <SelectTrigger id="periodicity" className="w-full bg-white">
                <SelectValue placeholder="Select period" />
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

          {/* Date range */}
          <div className="space-y-2">
            <Label>Period</Label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <Label htmlFor="start-date" className="text-xs text-gray-500">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1 bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                      disabled={(date) => isBefore(date, today)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full">
                <Label htmlFor="end-date" className="text-xs text-gray-500">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 bg-white",
                        periodicity !== "custom" && "opacity-70 cursor-not-allowed"
                      )}
                      disabled={periodicity !== "custom"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  {periodicity === "custom" && (
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => 
                          startDate ? isBefore(date, startDate) : isBefore(date, today)
                        }
                      />
                    </PopoverContent>
                  )}
                </Popover>
                {periodicity !== "custom" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically calculated based on start date and periodicity
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex justify-between sm:justify-end gap-2 mt-8">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

