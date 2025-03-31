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
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Transaction } from '@/app/transactions/actions';
import { InvoiceDetailed } from '@/app/invoices/actions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency } from '@/lib/utils';
import { emmiter } from "@/lib/emmiter";

interface EditInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: {
    transaction_id?: string;
    invoice_number?: string;
    due_date?: string;
    status?: string;
    type?: string;
    notes?: string;
    file?: File;
  }) => void;
  invoice: InvoiceDetailed;
  transactions: Transaction[];
  loading?: boolean;
}

export function EditInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
  invoice,
  transactions,
  loading = false
}: EditInvoiceModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>('pending');
  const [type, setType] = useState<string>('invoice');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [errors, setErrors] = useState<{
    invoiceNumber?: string;
  }>({});

  // Cargar datos de la factura cuando se abre el modal
  useEffect(() => {
    if (invoice && open) {
      setTransactionId(invoice.transaction_id || '');
      setInvoiceNumber(invoice.invoice_number || '');
      setType(invoice.type || 'invoice');
      
      // Configurar fecha de vencimiento si existe
      if (invoice.due_date) {
        try {
          const dueDateObj = new Date(invoice.due_date);
          if (!isNaN(dueDateObj.getTime())) {
            setDueDate(dueDateObj);
          } else {
            console.error('Invalid due date:', invoice.due_date);
            setDueDate(undefined);
          }
        } catch (e) {
          console.error('Error parsing due date:', e);
          setDueDate(undefined);
        }
      } else {
        setDueDate(undefined);
      }
      
      setStatus(invoice.status || 'pending');
      setNotes(invoice.notes || '');
      setFile(null);
      setErrors({});
    }
  }, [invoice, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const validateForm = () => {
    const newErrors: { invoiceNumber?: string } = {};

    if (!invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Solo incluye los campos que cambiaron
    const data: {
      transaction_id?: string;
      invoice_number?: string;
      due_date?: string;
      status?: string;
      type?: string;
      notes?: string;
      file?: File;
    } = {};

    if (transactionId !== invoice.transaction_id) data.transaction_id = transactionId;
    if (invoiceNumber !== invoice.invoice_number) data.invoice_number = invoiceNumber;
    
    const formattedDueDate = dueDate ? format(dueDate, 'yyyy-MM-dd') : '';
    if (formattedDueDate !== invoice.due_date && dueDate) data.due_date = formattedDueDate;
    
    if (status !== invoice.status) data.status = status;
    if (type !== invoice.type) data.type = type;
    if (notes !== invoice.notes) data.notes = notes.trim() || undefined;
    if (file) data.file = file;

    onSubmit(invoice.id, data);
  };

  if (!invoice) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Edit Invoice</SheetTitle>
          <SheetDescription>
            Update the details of invoice #{invoice.invoice_number}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {/* Transaction selector */}
          <div className="space-y-2">
            <Label htmlFor="transaction">Transaction</Label>
            <Select value={transactionId} onValueChange={setTransactionId}>
              <SelectTrigger id="transaction" className="w-full bg-white">
                <SelectValue placeholder="Select related transaction" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md max-h-60">
                {transactions.length === 0 ? (
                  <SelectItem value="none" disabled>No transactions available</SelectItem>
                ) : (
                  transactions
                    .filter(transaction => 
                      // Keep the currently selected transaction in the list even if cancelled
                      transaction.status !== 'cancelled' || transaction.id === transactionId
                    )
                    .map((transaction) => (
                    <SelectItem key={transaction.id} value={transaction.id}>
                      {transaction.reference_number || transaction.id} ({formatCurrency(transaction.amount)})
                      {transaction.status === 'cancelled' && ' (Cancelled)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label htmlFor="invoice-number" className="flex justify-between">
              <span>Invoice Number</span>
              {errors.invoiceNumber && <span className="text-red-500 text-xs">{errors.invoiceNumber}</span>}
            </Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-001"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Select due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs text-gray-500"
                onClick={() => setDueDate(undefined)}
              >
                Clear due date
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="w-full bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md">
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="purchase_order">Purchase Order</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Replace Invoice File (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept=".pdf,.docx,.doc,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </div>
            {file ? (
              <p className="text-xs text-green-600">
                New file selected: {file.name}
              </p>
            ) : invoice.file_path ? (
              <p className="text-xs text-blue-600">
                Current file: {invoice.file_path.split('/').pop()}
              </p>
            ) : null}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this invoice..."
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