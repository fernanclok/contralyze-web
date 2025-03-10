"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMonths, addDays, isBefore, startOfDay, parse } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

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
}

interface EditBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (id: string, data: {
    category_id?: string
    max_amount?: number
    start_date?: string
    end_date?: string
    status?: string
  }) => void
  categories: Category[]
  budget: Budget | null
  loading?: boolean
}

// Options for status
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

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

export function EditBudgetModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  budget,
  loading = false 
}: EditBudgetModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(addMonths(new Date(), 1))
  const [status, setStatus] = useState("active")
  const [periodicity, setPeriodicity] = useState("custom")

  // Current date for validation
  const today = startOfDay(new Date());

  // Load budget data when modal opens or selected budget changes
  useEffect(() => {
    if (budget) {
      // Load budget data into state
      setCategoryId(budget.category_id)
      setMaxAmount(budget.max_amount.toString())
      
      // Convert dates from string to Date
      if (budget.start_date) {
        const startDateObj = new Date(budget.start_date)
        setStartDate(startDateObj)
      }
      
      if (budget.end_date) {
        const endDateObj = new Date(budget.end_date)
        setEndDate(endDateObj)
      }
      
      setStatus(budget.status || "active")
      
      // Default to custom for editing
      setPeriodicity("custom")
    }
  }, [budget, open])

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
      setStartDate(date);
      
      // Update end date based on selected periodicity
      if (periodicity !== "custom") {
        const option = periodOptions.find(opt => opt.value === periodicity);
        if (option) {
          setEndDate(option.calculateEndDate(date));
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
    if (!budget || !budget.id) {
      console.error("No budget selected for editing");
      return;
    }

    if (!categoryId || !maxAmount || !startDate || !endDate || !status) {
      // Handle validation errors
      return
    }

    onSubmit(budget.id, {
      category_id: categoryId,
      max_amount: parseFloat(maxAmount),
      start_date: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      end_date: endDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      status: status
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!budget) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Edit Budget</SheetTitle>
        </SheetHeader>
        <div className="my-6 space-y-6">
          {/* Category selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
            </div>
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

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periodicity */}
          <div className="space-y-2">
            <Label htmlFor="periodicity">Periodicity</Label>
            <Select value={periodicity} onValueChange={handlePeriodicityChange}>
              <SelectTrigger id="periodicity" className="w-full bg-white">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
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
                          startDate ? isBefore(date, startDate) : false
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
            Update Budget
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
} 