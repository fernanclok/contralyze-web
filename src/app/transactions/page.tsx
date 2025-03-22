import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { TransactionList } from "@/components/transactions/TransactionList";
import { getTransactions, getCategories, getSuppliers, getClients } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Banknote, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  
  // Obtener datos del backend
  const { transactions = [], error: transactionsError } = await getTransactions();
  const { categories = [], error: categoriesError } = await getCategories();
  const { suppliers = [], error: suppliersError } = await getSuppliers();
  const { clients = [], error: clientsError } = await getClients();
  
  // Usar datos reales o arreglos vacíos si ocurrieron errores
  const transactionsData = Array.isArray(transactions) && transactions.length > 0 ? transactions : [];
  const categoryOptions = Array.isArray(categories) && categories.length > 0 ? categories : [];
  const supplierOptions = Array.isArray(suppliers) && suppliers.length > 0 ? suppliers : [];
  const clientOptions = Array.isArray(clients) && clients.length > 0 ? clients : [];
  
  // Calcular estadísticas
  const totalIncome = transactionsData
    .filter(transaction => transaction && transaction.type === 'income')
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount?.toString() || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
  const totalExpense = transactionsData
    .filter(transaction => transaction && transaction.type === 'expense')
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount?.toString() || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
  const balance = totalIncome - totalExpense;
  
  const pendingTransactions = transactionsData
    .filter(transaction => transaction && transaction.status === 'pending')
    .length;

  // Verificar si hay errores de API
  const hasError = !!transactionsError || !!categoriesError || !!suppliersError || !!clientsError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction Management</h1>
          <p className="text-gray-500">Manage income, expenses and transfers</p>
        </div>
        
        {hasError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">
                Could not connect to the server. Using demo data temporarily. All creation and editing actions have been disabled.
              </p>
            </div>
          </div>
        )}
        
        {/* Tarjetas de Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Balance</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(balance)}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Banknote className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Income</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalIncome)}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <ArrowUpCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(totalExpense)}</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <ArrowDownCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Transactions</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingTransactions}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sección de transacciones */}
        <Card>
          <CardContent className="p-6">
            <TransactionList 
              transactions={transactionsData}
              categories={categoryOptions}
              suppliers={supplierOptions}
              clients={clientOptions}
              userRole={userRole}
              hasConnectionError={hasError}
            />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
