"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

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
  request: BudgetRequest | null
  loading?: boolean
  userRole: string
}

// Status options
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function EditBudgetRequestModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  request,
  loading = false,
  userRole
}: EditBudgetRequestModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [requestedAmount, setRequestedAmount] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")

  const isAdmin = userRole === "admin"

  // Load request data when modal opens or selected request changes
  useEffect(() => {
    if (request) {
      // Load request data into state
      setCategoryId(request.category_id)
      setRequestedAmount(request.requested_amount.toString())
      setDescription(request.description)
      setStatus(request.status || "pending")
    }
  }, [request, open])

  const handleSubmit = () => {
    if (!request || !request.id) {
      console.error("No request selected for editing");
      return;
    }

    if (!categoryId || !requestedAmount || !description) {
      // Handle validation errors
      return
    }

    onSubmit(request.id, {
      category_id: categoryId,
      requested_amount: parseFloat(requestedAmount),
      description: description,
      status: isAdmin ? status : undefined // Only admins can change status
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

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

          {/* Category selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" className="w-full bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md">
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
            <Label htmlFor="requested-amount">Requested Amount</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="requested-amount"
                type="number"
                className="pl-6 w-full"
                placeholder="0.00"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this budget request"
              className="min-h-[120px]"
            />
          </div>

          {/* Status - admin only */}
          {isAdmin && (
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
          )}
        </div>

        <SheetFooter className="flex justify-between sm:justify-end gap-2 mt-8">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1 sm:flex-none">
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