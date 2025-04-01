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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency } from '@/lib/utils';
import { emmiter } from "@/lib/emmiter";

interface NewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    transaction_id: string;
    invoice_number: string;
    due_date?: string;
    status: string;
    type: string;
    notes?: string;
    file?: File;
  }) => Promise<any>;
  transactions: Transaction[];
  loading?: boolean;
}

export function NewInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
  transactions,
  loading = false
}: NewInvoiceModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>('pending');
  const [type, setType] = useState<string>('invoice');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [errors, setErrors] = useState<{
    invoiceNumber?: string;
    transactionId?: string;
    file?: string;
  }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setTransactionId('');
    setInvoiceNumber('');
    setDueDate(undefined);
    setStatus('pending');
    setType('invoice');
    setNotes('');
    setFile(null);
    setErrors({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const validateForm = () => {
    const newErrors: {
      invoiceNumber?: string;
      transactionId?: string;
      file?: string;
    } = {};

    // Validar número de factura
    if (!invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }

    // Validar transacción
    if (!transactionId) {
      newErrors.transactionId = 'Please select a transaction';
    }
    
    // Validar archivo
    if (!file) {
      newErrors.file = 'Please upload an invoice file';
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

    // Verificación adicional de campos obligatorios
    if (!transactionId || !type || !file) {
      console.error("Campos obligatorios faltantes:", { transactionId, type, file });
      emmiter.emit("showToast", {
        message: "Missing required fields. Please check the form.",
        type: "error"
      });
      return;
    }

    // Verificamos explícitamente el archivo
    if (!file) {
      emmiter.emit("showToast", {
        message: "An invoice file is required.",
        type: "error"
      });
      return;
    }

    // Verificamos que el archivo tenga un tamaño válido
    if (file.size <= 0) {
      emmiter.emit("showToast", {
        message: "The selected file appears to be empty.",
        type: "error"
      });
      return;
    }

    const data = {
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      status,
      type, // Aseguramos que type siempre se envía
      notes: notes.trim() || undefined,
      file // El archivo es obligatorio
    };

    console.log("Enviando datos de factura:", {
      ...data,
      file: {
        name: data.file.name,
        type: data.file.type,
        size: data.file.size
      }
    });

    onSubmit(data)
      .catch(error => {
        console.error("Error en el envío del formulario:", error);
        emmiter.emit("showToast", {
          message: "Failed to create invoice. Please try again.",
          type: "error"
        });
      })
      .finally(() => {
        // No hacer nada, ya que se utiliza la prop loading
      });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>New Invoice</SheetTitle>
          <SheetDescription>
            Create a new invoice in the system
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-4">
          {/* Transaction selection */}
          <div className="space-y-2">
            <Label htmlFor="transaction">Related Transaction</Label>
            <Select value={transactionId} onValueChange={setTransactionId}>
              <SelectTrigger id="transaction" className="w-full bg-white">
                <SelectValue placeholder="Select a transaction" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md max-h-[300px]">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <SelectItem key={transaction.id} value={transaction.id}>
                      {transaction.description} - {formatCurrency(transaction.amount)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-transactions" disabled>
                    No transactions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.transactionId && (
              <p className="text-xs text-red-500">{errors.transactionId}</p>
            )}
          </div>

          {/* Invoice Number */}
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2023-001"
              className="bg-white"
            />
            {errors.invoiceNumber && (
              <p className="text-xs text-red-500">{errors.invoiceNumber}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-md" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <Label htmlFor="file">Invoice File <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept=".pdf,.docx,.doc,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </div>
            {file && (
              <p className="text-xs text-green-600">
                File selected: {file.name}
              </p>
            )}
            {errors.file && (
              <p className="text-xs text-red-500">{errors.file}</p>
            )}
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