import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { TransactionList } from "@/components/transactions/TransactionList";
import { getTransactions, getCategories, getSuppliers, getClients, getDepartments } from "./actions";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Banknote, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  const userDepartmentId = session?.departmentId;
  
  // Obtener datos del backend
  const { transactions = [], error: transactionsError } = await getTransactions();
  const { categories = [], error: categoriesError } = await getCategories();
  const { suppliers = [], error: suppliersError } = await getSuppliers();
  const { clients = [], error: clientsError } = await getClients();
  const { departments = [], error: departmentsError } = await getDepartments();
  
  // Usar datos reales o arreglos vacíos si ocurrieron errores
  const transactionsData = Array.isArray(transactions) && transactions.length > 0 ? transactions : [];
  const categoryOptions = Array.isArray(categories) && categories.length > 0 ? categories : [];
  const supplierOptions = Array.isArray(suppliers) && suppliers.length > 0 ? suppliers : [];
  const clientOptions = Array.isArray(clients) && clients.length > 0 ? clients : [];
  const departmentOptions = Array.isArray(departments) && departments.length > 0 ? departments : [];
  
  // Calcular ingresos totales
  const totalIncome = transactionsData
    .filter(transaction => transaction && transaction.type === 'income' && transaction.status !== 'cancelled')
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount?.toString() || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
  // Calcular gastos totales
  const totalExpense = transactionsData
    .filter(transaction => transaction && transaction.type === 'expense' && transaction.status !== 'cancelled')
    .reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount?.toString() || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
  // Calcular balance
  const balance = totalIncome - totalExpense;
  
  // Para pending_count, calculamos en el frontend
  const pendingTransactions = transactionsData
    .filter(transaction => transaction && transaction.status === 'pending')
    .length;

  // Calcular transacciones por categoría (similar a lo que haría el backend)
  const categoriesMap = new Map<string | number, {category_id: string | number, total: number, category: any}>();
  
  // Primero agrupamos por categoría
  transactionsData
    .filter(t => t && t.status !== 'cancelled' && t.category_id)
    .forEach(t => {
      const categoryId = t.category_id;
      if (!categoryId) return;
      
      const amount = parseFloat(t.amount?.toString() || '0');
      if (isNaN(amount)) return;
      
      const current = categoriesMap.get(categoryId) || { 
        category_id: categoryId, 
        total: 0, 
        category: t.category 
      };
      
      current.total += amount;
      categoriesMap.set(categoryId, current);
    });
  
  // Luego convertimos a array y ordenamos
  const byCategory = Array.from(categoriesMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Obtener transacciones recientes
  const recentTransactions = [...transactionsData]
    .filter(t => t && t.status !== 'cancelled')
    .sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return dateB - dateA; // orden descendente
    })
    .slice(0, 5);

  console.log('Resumen calculado:', {
    income: totalIncome,
    expense: totalExpense,
    balance,
    pendingTransactions,
    byCategoryCount: byCategory.length,
    recentCount: recentTransactions.length
  });

  // Verificar si hay errores de API
  const hasConnectionError = !!transactionsError || !!categoriesError || !!suppliersError || !!clientsError || !!departmentsError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction Management</h1>
          <p className="text-gray-500">Manage income, expenses and transfers</p>
        </div>
        
        {hasConnectionError && (
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Balance
              </CardTitle>
              <Banknote className="h-4 w-4 bg-blue-100 text-blue-800 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Income
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 bg-green-100 text-green-800 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Expenses
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 bg-red-100 text-red-800 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Pending Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 bg-amber-100 text-amber-800 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {pendingTransactions}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sección de transacciones */}
        <Suspense fallback={<div>Loading...</div>}>
          <Card>
            <CardContent className="p-6">
              <TransactionList 
                transactions={transactionsData}
                categories={categoryOptions}
                suppliers={supplierOptions}
                clients={clientOptions}
                departments={departmentOptions}
                userRole={userRole}
                userDepartmentId={userDepartmentId}
                hasConnectionError={hasConnectionError}
              />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </AuthenticatedLayout>
  );
}
