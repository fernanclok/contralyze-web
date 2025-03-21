'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Category, Supplier, Client } from '@/app/transactions/actions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { emmiter } from "@/lib/emmiter";

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description?: string;
    category_id?: string;
    supplier_id?: string;
    client_id?: string;
    transaction_date: string;
    status?: 'pending' | 'completed' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
  }) => void;
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  loading?: boolean;
}

export function NewTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  categories,
  suppliers,
  clients,
  loading = false
}: NewTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [clientId, setClientId] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('completed');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('none');
    setSupplierId('none');
    setClientId('none');
    setTransactionDate(new Date());
    setStatus('completed');
    setPaymentMethod('');
    setReferenceNumber('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: {
      amount?: string;
      description?: string;
    } = {};

    // Validar monto
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }

    // Validar descripción
    if (description && description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const data = {
      type,
      amount: parseFloat(amount),
      description,
      category_id: categoryId !== "none" ? categoryId : undefined,
      supplier_id: type === 'expense' && supplierId !== "none" ? supplierId : undefined,
      client_id: type === 'income' && clientId !== "none" ? clientId : undefined,
      transaction_date: format(transactionDate, 'yyyy-MM-dd'),
      status,
      payment_method: paymentMethod || undefined,
      reference_number: referenceNumber || undefined
    };

    onSubmit(data);
  };

  const getRelatedEntitiesField = () => {
    if (type === 'expense') {
      return (
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger id="supplier" className="w-full bg-white">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md">
              <SelectItem value="none">None</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else if (type === 'income') {
      return (
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="client" className="w-full bg-white">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md">
              <SelectItem value="none">None</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>
            Create a new transaction in the system
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {/* Transaction type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense' | 'transfer') => {
              setType(value);
              // Reset related entity when type changes
              setSupplierId('');
              setClientId('');
            }}>
              <SelectTrigger id="type" className="w-full bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex justify-between">
              <span>Amount</span>
              {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="amount"
                type="number"
                className="pl-6 w-full"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !transactionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transactionDate ? format(transactionDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={(date) => date && setTransactionDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category" className="w-full bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="none">None</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Related entity field (Supplier or Client) */}
          {getRelatedEntitiesField()}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: 'pending' | 'completed' | 'cancelled') => setStatus(value)}
            >
              <SelectTrigger id="status" className="w-full bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Input
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Cash, Transfer, etc."
            />
          </div>

          {/* Reference number */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Invoice number, receipt, etc."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex justify-between">
              <span>Description</span>
              {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the transaction..."
              rows={3}
            />
          </div>
        </div>
        <SheetFooter className="pt-6">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 