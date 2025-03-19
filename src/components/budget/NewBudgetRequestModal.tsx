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

interface Category {
  id: string;
  name: string;
}

interface NewBudgetRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    category_id?: string;
    category_name?: string;
    category_type?: string;
    requested_amount: number;
    description: string;
    isNewCategory: boolean;
  }) => void;
  categories: Category[];
  loading?: boolean;
}

export function NewBudgetRequestModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories,
  loading = false
}: NewBudgetRequestModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('');

  // Check if there are available categories
  const hasCategories = categories.length > 0;

  // If there are no categories, force creating a new one
  useEffect(() => {
    if (!hasCategories) {
      setIsAddingNewCategory(true);
    }
  }, [hasCategories]);

  const handleSubmit = () => {
    if (
      (!categoryId && !isAddingNewCategory) ||
      (isAddingNewCategory && !newCategoryName) ||
      !requestedAmount ||
      !description
    ) {
      // Validation error handling
      return;
    }

    onSubmit({
      category_id: isAddingNewCategory ? undefined : categoryId,
      category_name: isAddingNewCategory ? newCategoryName : undefined,
      category_type: isAddingNewCategory ? newCategoryType : undefined,
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
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Create New Budget Request</SheetTitle>
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
              <Select 
                value={categoryId} 
                onValueChange={setCategoryId}
                disabled={isAddingNewCategory || loading}
              >
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
            ) : null}
          </div>

          {/* Requested amount */}
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
              placeholder="Describe the purpose of this budget request"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
        </div>

        <SheetFooter className="flex justify-between sm:justify-end gap-2 mt-8">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 