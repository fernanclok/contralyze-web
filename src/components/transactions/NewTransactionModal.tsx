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
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Category, Supplier, Client, Department } from '@/app/transactions/actions';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { emmiter } from "@/lib/emmiter";
import CreateInvoiceModal from './CreateInvoiceModal';

interface NewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionData) => Promise<{ error: string | null; transaction: any | null }>;
  categories?: Category[];
  suppliers?: Supplier[];
  clients?: Client[];
  departments?: Department[];
  loading?: boolean;
  userDepartmentId?: string;
}

interface TransactionData {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  client_id?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  reference_number?: string;
}

export function NewTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  categories = [],
  suppliers = [],
  clients = [],
  departments = [],
  loading = false,
  userDepartmentId
}: NewTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [clientId, setClientId] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [departmentId, setDepartmentId] = useState(userDepartmentId || '');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [userDepartment, setUserDepartment] = useState<Department | null>(null);

  // Nuevos estados para manejo de facturas
  const [hasInvoice, setHasInvoice] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState<Date | undefined>(undefined);

  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    invoice?: string | undefined;
  }>({});

  // Estado para el modal de factura
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);

  // Check if there are available categories and departments
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const hasDepartments = Array.isArray(departments) && departments.length > 0;

  // Resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setAmount('');
      setDescription('');
      setCategoryId('');
      setSupplierId('');
      setClientId('');
      setTransactionDate(new Date());
      setStatus('pending');
      setPaymentMethod('');
      setReferenceNumber('');
      setDepartmentId(userDepartmentId || '');
      setHasInvoice(false);
      setInvoiceFile(null);
      setInvoiceNumber('');
      setInvoiceDueDate(undefined);
      setErrors({});
    }
  }, [open, userDepartmentId]);

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
    if (deptId && Array.isArray(categories) && categories.length > 0) {
      const filtered = categories.filter(cat => String(cat.department_id) === String(deptId));
      setFilteredCategories(filtered);

      // Si hay categorías filtradas, seleccionar la primera por defecto
      if (filtered.length > 0 && !isAddingNewCategory) {
        setCategoryId(filtered[0].id);
      } else if (filtered.length === 0) {
        // Si no hay categorías para este departamento, activar el modo de creación
        setIsAddingNewCategory(true);
      }
    } else {
      setFilteredCategories(categories);
    }
  };

  // If there are no categories, force the creation of a new one
  useEffect(() => {
    if (!hasCategories) {
      setIsAddingNewCategory(true);
    }
  }, [hasCategories]);

  // Cuando se selecciona un departamento, filtrar las categorías
  useEffect(() => {
    if (departmentId) {
      filterCategoriesByDepartment(departmentId);
    }
  }, [departmentId, categories]);

  // Toggle entre seleccionar y crear categoría
  const toggleAddNewCategory = () => {
    setIsAddingNewCategory(!isAddingNewCategory);
    if (!isAddingNewCategory) {
      setCategoryId('');
    } else {
      setNewCategoryName('');
      setNewCategoryType('');
    }
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('');
    setSupplierId('none');
    setClientId('none');
    setTransactionDate(new Date());
    setStatus('pending');
    setPaymentMethod('');
    setReferenceNumber('');
    setErrors({});
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setNewCategoryType('');
    setHasInvoice(false);
    setInvoiceFile(null);
    setInvoiceNumber('');
    setInvoiceDueDate(undefined);

    // Cargar el departamento del usuario si existen departamentos
    if (hasDepartments) {
      if (userDepartmentId) {
        const defaultDept = departments.find(d => String(d.id) === String(userDepartmentId));
        if (defaultDept) {
          setDepartmentId(defaultDept.id);
          filterCategoriesByDepartment(defaultDept.id);
        } else if (departments.length > 0) {
          setDepartmentId(departments[0].id);
          filterCategoriesByDepartment(departments[0].id);
        }
      } else if (departments.length > 0) {
        setDepartmentId(departments[0].id);
        filterCategoriesByDepartment(departments[0].id);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!description?.trim()) {
      newErrors.description = 'Please enter a description';
    }

    // Validar factura si se marcó que tiene una
    if (hasInvoice) {
      if (!invoiceFile) {
        newErrors.invoice = 'Please upload an invoice file';
      }
      if (!invoiceNumber?.trim()) {
        newErrors.invoice = 'Please enter an invoice number';
      }
      if (invoiceDueDate && invoiceDueDate < transactionDate) {
        newErrors.invoice = 'Due date cannot be before transaction date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Validar que tengamos todos los datos necesarios para la factura
    if (hasInvoice && (!invoiceFile || !invoiceNumber.trim())) {
      setErrors(prev => ({
        ...prev,
        invoice: 'Please provide all invoice information'
      }));
      return;
    }

    const data: TransactionData = {
      type,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      category_id: categoryId && categoryId !== 'none' ? categoryId : undefined,
      supplier_id: supplierId && supplierId !== 'none' ? supplierId : undefined,
      client_id: clientId && clientId !== 'none' ? clientId : undefined,
      transaction_date: format(transactionDate, 'yyyy-MM-dd'),
      status,
      payment_method: paymentMethod.trim() || undefined,
      reference_number: referenceNumber.trim() || undefined
    };

    const result = await onSubmit(data);

    if (result.error) {
      setErrors(prev => ({
        ...prev,
        invoice: result.error || undefined
      }));
      return;
    }

    // If transaction is completed, show invoice modal
    if (status === 'completed' && result.transaction) {
      setCreatedTransactionId(result.transaction.id);
      setShowInvoiceModal(true);
    } else {
      handleSuccess();
    }
  };

  const handleSuccess = () => {
    setShowInvoiceModal(false);
    setCreatedTransactionId(null);
    onOpenChange(false);
  };

  const handleInvoiceSuccess = () => {
    setShowInvoiceModal(false);
    setCreatedTransactionId(null);
    handleSuccess();
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
              {Array.isArray(suppliers) && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-suppliers" disabled>
                  No suppliers available
                </SelectItem>
              )}
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
              {Array.isArray(clients) && clients.length > 0 ? (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-clients" disabled>
                  No clients available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white">
          <SheetHeader>
            <SheetTitle>New Transaction</SheetTitle>
            <SheetDescription>
              Create a new transaction in the system
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 py-4">
            {/* Transaction type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense' | 'transfer') => {
                setType(value);
                // Reset related fields
                setSupplierId('none');
                setClientId('none');
              }}>
                <SelectTrigger id="type" className="w-full bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-md">
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn("bg-white", errors.amount && "border-red-500")}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Department Selection */}
            {hasDepartments && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={departmentId} 
                  onValueChange={(value: string) => {
                    setDepartmentId(value);
                    filterCategoriesByDepartment(value);
                  }}
                  disabled={loadingUserInfo}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder={loadingUserInfo ? "Loading department..." : "Select department"} />
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
                  <p className="text-sm text-gray-500">Assigned department: {userDepartment.name}</p>
                )}
              </div>
            )}

            {/* Category Selection or Creation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Button 
                  type="button" 
                  onClick={toggleAddNewCategory} 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  {isAddingNewCategory ? "Select Existing" : "Create New"}
                </Button>
              </div>

              {isAddingNewCategory ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Marketing Materials"
                      className="w-full bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category Type</Label>
                    <Input
                      value={newCategoryType}
                      onChange={(e) => setNewCategoryType(e.target.value)}
                      placeholder="e.g., Expense, Operational"
                      className="w-full bg-white"
                    />
                  </div>
                </div>
              ) : (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available for this department
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Related entity field (Supplier or Client) */}
            {getRelatedEntitiesField()}

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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
          </form>
          <SheetFooter>

            <Button 
              onClick={handleSubmit}
              disabled={loading || (!isAddingNewCategory && !categoryId) || (isAddingNewCategory && (!newCategoryName || !newCategoryType))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Create Transaction'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {showInvoiceModal && createdTransactionId && (
        <CreateInvoiceModal
          open={showInvoiceModal}
          onOpenChange={(open) => {
            setShowInvoiceModal(open);
            if (!open) {
              setCreatedTransactionId(null);
              onOpenChange(false);
            }
          }}
          transactionId={createdTransactionId}
          onSuccess={handleInvoiceSuccess}
        />
      )}
    </>
  );
}