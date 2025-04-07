"use client"

import { useState, useEffect } from "react"
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { Transaction, Category, Client, Supplier, Department } from "@/app/transactions/actions"
import { NewTransactionModal } from "./NewTransactionModal"
import { EditTransactionModal } from "./EditTransactionModal"
import { TransactionDetailsModal } from "./TransactionDetailsModal"
import CreateInvoiceModal from "./CreateInvoiceModal"
import { Edit, Calendar, FilterX, X, Info, CheckCircle, XCircle, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createTransaction, updateTransaction, deleteTransaction } from "@/app/transactions/actions"
import { useRouter } from "next/navigation"
import { emmiter } from "@/lib/emmiter"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getTransactionsFromDB, saveTransactionsToDB } from "@/app/utils/indexedDB" // Importar funciones de IndexedDB

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  suppliers: Supplier[]
  clients: Client[]
  departments: Department[]
  userRole: string
  userDepartmentId?: string
  hasConnectionError?: boolean
}

export function TransactionList({
  transactions = [],
  categories = [],
  suppliers = [],
  clients = [],
  departments = [],
  userRole,
  userDepartmentId,
  hasConnectionError = false,
}: TransactionListProps) {
  const router = useRouter()
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false)
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false)
  const [isViewTransactionModalOpen, setIsViewTransactionModalOpen] = useState(false)
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [startDateFilter, setStartDateFilter] = useState("")
  const [endDateFilter, setEndDateFilter] = useState("")
  const [dateFilterVisible, setDateFilterVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  const itemsPerPage = 10
  const isAdmin = userRole === "admin"

  // Usar el hook para manejar transacciones en tiempo real
  const { transactions: allTransactions, isLoading: isRealtimeLoading } = useRealtimeTransactions({
    initialTransactions: transactions,
    enableNotifications: true,
  })

  // Cargar transacciones desde IndexedDB si está offline
  useEffect(() => {
    const loadOfflineTransactions = async () => {
      if (hasConnectionError) {
        console.log("Cargando transacciones desde IndexedDB...")
        const offlineTransactions = await getTransactionsFromDB()
        setFilteredTransactions(offlineTransactions); // Actualizar directamente las transacciones filtradas
        applyFilters(offlineTransactions)
      } else {
        // Guardar transacciones en IndexedDB si hay conexión
        await saveTransactionsToDB(transactions)
      }
    }

    loadOfflineTransactions()
  }, [hasConnectionError, transactions])

  // Guardar transacciones en IndexedDB después de cualquier cambio
  useEffect(() => {
    const saveTransactions = async () => {
      if (!hasConnectionError) {
        console.log("Guardando transacciones en IndexedDB...")
        await saveTransactionsToDB(allTransactions)
      }
    }

    saveTransactions()
  }, [allTransactions, hasConnectionError])

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    if (allTransactions.length > 0) {
      // Información de depuración
      console.log("userRole:", userRole)
      console.log("isAdmin:", isAdmin)
      console.log("userDepartmentId:", userDepartmentId)
      console.log("Total transactions:", allTransactions.length)

      let departmentFilteredTransactions = [...allTransactions]

      // Si no es admin, aplicar filtros más permisivos
      if (!isAdmin && userDepartmentId) {
        // Obtener IDs de categorías que pertenecen al departamento del usuario
        const departmentCategoryIds = categories
          .filter((category) => {
            const match = String(category.department_id) === String(userDepartmentId)
            console.log(
              `Categoría ${category.name} (${category.id}): department_id=${category.department_id}, userDepartmentId=${userDepartmentId}, match=${match}`,
            )
            return match
          })
          .map((category) => category.id)

        console.log("Categorías del departamento:", departmentCategoryIds)

        // Filtrar transacciones que:
        // 1. Pertenecen directamente al departamento del usuario, O
        // 2. Usan categorías que pertenecen al departamento del usuario
        departmentFilteredTransactions = allTransactions.filter((transaction) => {
          const matchesDepartment = String(transaction.department_id) === String(userDepartmentId)
          const matchesCategory = departmentCategoryIds.some(
            (catId) => String(transaction.category_id) === String(catId),
          )

          console.log(
            `Transacción ${transaction.id}: department_id=${transaction.department_id}, category_id=${transaction.category_id}, matchesDepartment=${matchesDepartment}, matchesCategory=${matchesCategory}`,
          )

          return matchesDepartment || matchesCategory
        })

        console.log("Transacciones filtradas por departamento:", departmentFilteredTransactions.length)

        // Actualizar información de depuración
        setDebugInfo(`
          userRole: ${userRole}
          userDepartmentId: ${userDepartmentId}
          Total transactions: ${allTransactions.length}
          Department categories: ${departmentCategoryIds.join(", ")}
          Filtered transactions: ${departmentFilteredTransactions.length}
        `)
      }

      applyFilters(departmentFilteredTransactions)
    }
  }, [
    allTransactions,
    searchTerm,
    typeFilter,
    statusFilter,
    categoryFilter,
    departmentFilter,
    startDateFilter,
    endDateFilter,
    isAdmin,
    userDepartmentId,
    categories, // Añadir categories a las dependencias
  ])

  // Calcular transacciones para la página actual
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  // Funciones para cambiar de página
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("")
    setStatusFilter("")
    setCategoryFilter("")
    setStartDateFilter("")
    setEndDateFilter("")
    setDateFilterVisible(false)
    setDepartmentFilter("all")
  }

  const toggleDateFilter = () => {
    setDateFilterVisible(!dateFilterVisible)
    if (dateFilterVisible) {
      setStartDateFilter("")
      setEndDateFilter("")
    }
  }

  // Función para manejar la creación de una nueva transacción
  const handleCreateTransaction = async (data: any) => {
    setIsLoading(true)
    try {
      const result = await createTransaction(data)
      if (!result.error) {
        // Agregar la nueva transacción a las transacciones filtradas y aplicar filtros
        const updatedTransactions = [result.transaction, ...allTransactions];
        setFilteredTransactions(updatedTransactions); // Actualizar directamente las transacciones filtradas
        applyFilters(updatedTransactions);

        emmiter.emit("showToast", {
          message: "Transaction created successfully",
          type: "success",
        })

        setIsNewTransactionModalOpen(false)
      } else {
        emmiter.emit("showToast", {
          message: result.error,
          type: "error",
        })
      }
      return result
    } catch (error) {
      console.error("Error creating transaction:", error)
      emmiter.emit("showToast", {
        message: "Failed to create transaction",
        type: "error",
      })
      return {
        error: "Failed to create transaction",
        transaction: null,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar la actualización de una transacción
  const handleUpdateTransaction = async (id: string, data: any) => {
    setIsLoading(true)
    try {
      const result = await updateTransaction(id, data)

      if (!result.error) {
        // Actualizar la transacción en la lista y aplicar filtros
        const updatedTransactions = allTransactions.map((transaction) =>
          transaction.id === id ? { ...transaction, ...result.transaction } : transaction,
        );
        setFilteredTransactions(updatedTransactions); // Actualizar directamente las transacciones filtradas
        applyFilters(updatedTransactions);

        emmiter.emit("showToast", {
          message: "Transaction updated successfully",
          type: "success",
        })

        setIsEditTransactionModalOpen(false)
      } else {
        emmiter.emit("showToast", {
          message: result.error,
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
      emmiter.emit("showToast", {
        message: "Error updating transaction",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    setIsLoading(true)
    try {
      const result = await deleteTransaction(transactionToDelete)

      if (result.error) {
        emmiter.emit("showToast", {
          message: result.error,
          type: "error",
        })
        return
      }

      emmiter.emit("showToast", {
        message: "Transaction deleted successfully",
        type: "success",
      })

      setIsDeleteAlertOpen(false)
      setTransactionToDelete(null)
      // No es necesario refrescar la página, Pusher enviará la actualización
      // router.refresh();
    } catch (error) {
      console.error("Error deleting transaction:", error)
      emmiter.emit("showToast", {
        message: "Error deleting transaction",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditTransactionModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const handleViewClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsViewTransactionModalOpen(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "income":
        return "Income"
      case "expense":
        return "Expense"
      case "transfer":
        return "Transfer"
      default:
        return type
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "pending":
        return "Pending"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  // Función para actualizar rápidamente el estado de una transacción
  const handleQuickStatusUpdate = async (transactionId: string, newStatus: "pending" | "completed" | "cancelled") => {
    setIsLoading(true)
    try {
      const result = await updateTransaction(transactionId, { status: newStatus })

      if (result.error) {
        emmiter.emit("showToast", {
          message: result.error,
          type: "error",
        })
        return
      }

      emmiter.emit("showToast", {
        message: `Transaction marked as ${newStatus}`,
        type: "success",
      })

      // Actualizar localmente en caso de que Pusher falle
      if (result.transaction) {
        const updatedTransactions = allTransactions.map((item) => (item.id === transactionId ? { ...item, status: newStatus } : item));
        setFilteredTransactions(updatedTransactions); // Actualizar directamente las transacciones filtradas
        applyFilters(updatedTransactions); // Actualizar los filtros
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
      emmiter.emit("showToast", {
        message: "Error updating transaction status",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (transactions: Transaction[]) => {
    console.log("Aplicando filtros a", transactions.length, "transacciones")
    if (!Array.isArray(transactions) || transactions.length === 0) {
      setFilteredTransactions([])
      return
    }

    let filtered = transactions.filter(Boolean) // Asegurar que no hay elementos nulos

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction?.description?.toLowerCase().includes(lowerSearchTerm) ||
          transaction?.reference_number?.toLowerCase().includes(lowerSearchTerm) ||
          transaction?.category?.name?.toLowerCase().includes(lowerSearchTerm) ||
          transaction?.supplier?.name?.toLowerCase().includes(lowerSearchTerm) ||
          transaction?.client?.name?.toLowerCase().includes(lowerSearchTerm),
      )
    }

    // Filtrar por tipo
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === typeFilter)
    }

    // Filtrar por estado
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    // Filtrar por categoría
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.category_id === categoryFilter)
    }

    // Filtrar por departamento (solo para admins)
    if (isAdmin && departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.department_id === departmentFilter)
    }

    // Filtrar por fecha inicio
    if (startDateFilter) {
      filtered = filtered.filter((transaction) => {
        try {
          const transactionDate = new Date(transaction.transaction_date)
          const startDate = new Date(startDateFilter)
          return transactionDate >= startDate
        } catch (e) {
          console.error("Error comparing dates:", e)
          return false
        }
      })
    }

    // Filtrar por fecha fin
    if (endDateFilter) {
      filtered = filtered.filter((transaction) => {
        try {
          const transactionDate = new Date(transaction.transaction_date)
          const endDate = new Date(endDateFilter)
          return transactionDate <= endDate
        } catch (e) {
          console.error("Error comparing dates:", e)
          return false
        }
      })
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleInvoiceCreated = (transactionId: string) => {
    // Forzar la recarga de la transacción desde el backend
    setIsLoading(true)
    fetch(`/api/transactions/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const updatedTransactions = allTransactions.map((t) => (t.id === transactionId ? data.data : t));
          setFilteredTransactions(updatedTransactions); // Actualizar directamente las transacciones filtradas
          applyFilters(updatedTransactions);
        }
      })
      .catch((error) => {
        console.error("Error fetching updated transaction:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => setSearchTerm("")} aria-label="Clear search">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem> {/* Cerrada correctamente */}
              <SelectItem value="expense">Expense</SelectItem> {/* Cerrada correctamente */}
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant={dateFilterVisible ? "secondary" : "outline"}
            size="icon"
            onClick={toggleDateFilter}
            aria-label="Date filter"
          >
            <Calendar className="h-4 w-4" />
          </Button>

          {(searchTerm || typeFilter || statusFilter || categoryFilter || startDateFilter || endDateFilter) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          )}

          {hasConnectionError ? (
            <Button size="sm" className="gap-1 ml-auto" disabled>
              New Transaction
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsNewTransactionModalOpen(true)} className="gap-1 ml-auto">
              New Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Filtro de fechas */}
      {dateFilterVisible && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-md">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <Input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <Input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between my-2">
        <div className="text-sm text-muted-foreground">
            {isAdmin
            ? departmentFilter !== "all"
              ? `Showing transactions for ${departments.find((d) => d.id === departmentFilter)?.name || "selected department"}`
              : "Showing transactions for all departments"
            : "Showing transactions from your department or with categories from your department"}
        </div>
        <div className="text-sm text-muted-foreground">{filteredTransactions.length} transaction(s) found</div>
      </div>

      {/* Tabla de transacciones */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Relation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {filteredTransactions.length === 0 && allTransactions.length > 0
                    ? "No transactions found that match the filters."
                    : "No transactions registered."}
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap text-black">
                    {(() => {
                      try {
                        const date = new Date(transaction.transaction_date)
                        return !isNaN(date.getTime()) ? format(date, "dd/MM/yyyy") : "Invalid date"
                      } catch (e) {
                        return "Invalid date"
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        transaction.type === "income"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : transaction.type === "expense"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                      }
                    >
                      {getTypeText(transaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-black">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate text-black">
                    {transaction.description || "No description"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-black">
                    {transaction.category?.name || "No category"}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getStatusBadgeColor(transaction.status))}>
                      {getStatusText(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {transaction.supplier?.name && (
                      <span className="block text-sm text-gray-600">Supplier: {transaction.supplier.name}</span>
                    )}
                    {transaction.client?.name && (
                      <span className="block text-sm text-gray-600">Client: {transaction.client.name}</span>
                    )}
                    {!transaction.supplier?.name && !transaction.client?.name && "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(transaction)}
                        disabled={hasConnectionError}
                        title="Edit Transaction"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(transaction)}
                        disabled={hasConnectionError}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {transaction.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuickStatusUpdate(transaction.id, "completed")}
                            disabled={hasConnectionError}
                            title="Mark as Completed"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuickStatusUpdate(transaction.id, "cancelled")}
                            disabled={hasConnectionError}
                            title="Mark as Cancelled"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {transaction.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuickStatusUpdate(transaction.id, "pending")}
                          disabled={hasConnectionError}
                          title="Mark as Pending"
                        >
                          <Info className="h-4 w-4 text-yellow-500" />
                        </Button>
                      )}
                      {transaction.status === "cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuickStatusUpdate(transaction.id, "pending")}
                          disabled={hasConnectionError}
                          title="Mark as Pending"
                        >
                          <Info className="h-4 w-4 text-yellow-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredTransactions.length > itemsPerPage && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalCount={filteredTransactions.length}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Modal para nueva transacción */}
      <NewTransactionModal
        open={isNewTransactionModalOpen}
        onOpenChange={setIsNewTransactionModalOpen}
        onSubmit={handleCreateTransaction}
        categories={categories}
        suppliers={suppliers}
        clients={clients}
        departments={departments}
        userDepartmentId={userDepartmentId}
        loading={isLoading}
      />

      {/* Modal para editar transacción */}
      <EditTransactionModal
        open={isEditTransactionModalOpen}
        onOpenChange={setIsEditTransactionModalOpen}
        onSubmit={handleUpdateTransaction}
        categories={categories}
        suppliers={suppliers}
        clients={clients}
        transaction={selectedTransaction}
        loading={isLoading}
      />

      {/* Modal para ver detalles de transacción */}
      <TransactionDetailsModal
        isOpen={isViewTransactionModalOpen}
        onClose={() => setIsViewTransactionModalOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Modal para crear factura */}
      <CreateInvoiceModal
        open={isCreateInvoiceModalOpen}
        onOpenChange={setIsCreateInvoiceModalOpen}
        transactionId={selectedTransaction?.id || ""}
        onSuccess={() => {
          emmiter.emit("showToast", {
            message: "Invoice created successfully",
            type: "success",
          })
          handleInvoiceCreated(selectedTransaction?.id || "")
          setIsCreateInvoiceModalOpen(false)
        }}
      />

      {/* Alerta de confirmación para eliminar */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected transaction and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

