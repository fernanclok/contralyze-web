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
import { format, parseISO } from 'date-fns';
import { Category, Supplier, Client, Transaction } from '@/app/transactions/actions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { emmiter } from "@/lib/emmiter";

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: {
    type?: 'income' | 'expense' | 'transfer';
    amount?: number;
    description?: string;
    category_id?: string;
    supplier_id?: string;
    client_id?: string;
    transaction_date?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
  }) => void;
  categories: Category[];
  suppliers: Supplier[];
  clients: Client[];
  transaction: Transaction | null;
  loading?: boolean;
}

export function EditTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  categories,
  suppliers,
  clients,
  transaction,
  loading = false
}: EditTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [clientId, setClientId] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('completed');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
  }>({});

  // Cargar datos de la transacción cuando se abre el modal o cambia la transacción
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      setCategoryId(transaction.category_id || 'none');
      setSupplierId(transaction.supplier_id || 'none');
      setClientId(transaction.client_id || 'none');
      
      // Convertir fecha de string a Date con manejo de errores mejorado
      if (transaction.transaction_date) {
        try {
          const dateObj = new Date(transaction.transaction_date);
          // Verificar si la fecha es válida
          if (!isNaN(dateObj.getTime())) {
            setTransactionDate(dateObj);
          } else {
            console.error('Invalid date:', transaction.transaction_date);
            setTransactionDate(new Date());
          }
        } catch (e) {
          console.error('Error parsing date:', e);
          setTransactionDate(new Date());
        }
      } else {
        setTransactionDate(new Date());
      }
      
      setStatus(transaction.status);
      setPaymentMethod(transaction.payment_method || '');
      setReferenceNumber(transaction.reference_number || '');
      setErrors({});
    }
  }, [transaction, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: {
      amount?: string;
      description?: string;
    } = {};

    // Validar monto
    if (amount && parseFloat(amount) <= 0) {
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
    if (!transaction || !transaction.id) {
      console.error('No transaction selected for editing');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const data: {
      type?: 'income' | 'expense' | 'transfer';
      amount?: number;
      description?: string;
      category_id?: string;
      supplier_id?: string;
      client_id?: string;
      transaction_date?: string;
      status?: 'pending' | 'completed' | 'cancelled';
      payment_method?: string;
      reference_number?: string;
    } = {};

    // Solo incluir campos que han cambiado
    if (type !== transaction.type) data.type = type;
    if (amount && parseFloat(amount) !== transaction.amount) data.amount = parseFloat(amount);
    if (description !== transaction.description) data.description = description;
    
    // Manejar categoría
    if (categoryId !== transaction.category_id) {
      data.category_id = categoryId !== "none" ? categoryId : undefined;
    }
    
    // Manejar proveedor/cliente según el tipo
    if (type === 'expense') {
      if (supplierId !== transaction.supplier_id) {
        data.supplier_id = supplierId !== "none" ? supplierId : undefined;
      }
    } else if (type === 'income') {
      if (clientId !== transaction.client_id) {
        data.client_id = clientId !== "none" ? clientId : undefined;
      }
    }
    
    if (transactionDate && format(transactionDate, 'yyyy-MM-dd') !== transaction.transaction_date) {
      data.transaction_date = format(transactionDate, 'yyyy-MM-dd');
    }
    
    if (status !== transaction.status) data.status = status;
    if (paymentMethod !== transaction.payment_method) data.payment_method = paymentMethod || undefined;
    if (referenceNumber !== transaction.reference_number) data.reference_number = referenceNumber || undefined;

    onSubmit(transaction.id, data);
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

  if (!transaction) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>
            Update the details of the transaction
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {/* Type of transaction */}
          <div className="space-y-2">
            <Label htmlFor="type">Type of Transaction</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense' | 'transfer') => {
              setType(value);
              // Reset related entity when type changes
              setSupplierId('');
              setClientId('');
            }}>
              <SelectTrigger id="type" className="w-full bg-white">
                <SelectValue>{type || "Select type"}</SelectValue> {/* Mostrar el valor seleccionado */}
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
                <SelectValue>
                  {categories.find((category) => category.id === categoryId)?.name || "Select category"}
                </SelectValue> {/* Mostrar el valor seleccionado */}
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

          {/* Related entity (Supplier or Client) */}
          {getRelatedEntitiesField()}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value: 'pending' | 'completed' | 'cancelled') => setStatus(value)}
            >
              <SelectTrigger id="status" className="w-full bg-white">
                <SelectValue>{status || "Select status"}</SelectValue> {/* Mostrar el valor seleccionado */}
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
              placeholder="Invoice, Receipt, etc."
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
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}