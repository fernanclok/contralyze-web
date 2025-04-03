'use client';

import { useState } from 'react';
import { createInvoice } from '@/app/transactions/actions';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  onSuccess?: () => void;
}

interface CreateInvoiceFormData {
  file: File;
  invoice_number: string;
  due_date?: string;
  notes?: string;
  status: string;
  type: string;
}

export default function CreateInvoiceModal({
  open,
  onOpenChange,
  transactionId,
  onSuccess
}: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('invoice');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!file) {
      setError('Please upload a valid file');
      return;
    }
    if (!invoiceNumber.trim()) {
      setError('Invoice number is required');
      return;
    }
    if (!status) {
      setError('Status is required');
      return;
    }
    if (!type) {
      setError('Type is required');
      return;
    }
    if (dueDate && dueDate < new Date()) {
      setError('Due date cannot be in the past');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createInvoice({
        transaction_id: transactionId,
        file,
        invoice_number: invoiceNumber.trim(),
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        notes: notes.trim() || undefined,
        status,
        type
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Invoice</SheetTitle>
          <SheetDescription>
            Add an invoice to the transaction
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_file">Invoice File</Label>
            <Input
              id="invoice_file"
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  // Validate file size (10MB)
                  if (selectedFile.size > 10 * 1024 * 1024) {
                    setError('File size must be less than 10MB');
                    return;
                  }
                  // Validate file type
                  const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                  if (!validTypes.includes(selectedFile.type)) {
                    setError('File must be PDF, JPG, or PNG');
                    return;
                  }
                  setFile(selectedFile);
                  setError(null);
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={invoiceNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
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
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date: Date | undefined) => setDueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="bill">Bill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              placeholder="Additional notes about the invoice..."
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading || !file || !invoiceNumber || !status || !type}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
