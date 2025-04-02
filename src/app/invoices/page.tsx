import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { getInvoices, getTransactionsForInvoice } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Suspense } from "react";

export default async function InvoicesPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  // Obtener datos del backend
  const { invoices = [], error: invoicesError } = await getInvoices();
  const { transactions = [], error: transactionsError } =
    await getTransactionsForInvoice();

  // Usar datos reales o arreglos vacíos si ocurrieron errores
  const invoicesData =
    Array.isArray(invoices) && invoices.length > 0 ? invoices : [];
  const transactionsData =
    Array.isArray(transactions) && transactions.length > 0 ? transactions : [];

  // Calcular estadísticas
  const totalInvoices = invoicesData.length;
  const totalAmount = invoicesData.reduce((sum, invoice) => {
    const amount = parseFloat(invoice.amount?.toString() || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const pendingInvoices = invoicesData.filter(
    (invoice) => invoice.status === "pending"
  ).length;
  const paidInvoices = invoicesData.filter(
    (invoice) => invoice.status === "paid"
  ).length;

  // Verificar si hay errores de API
  const hasError = !!invoicesError || !!transactionsError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
          <p className="text-gray-500">Manage and track all your invoices</p>
        </div>

        {hasError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">
                Could not connect to the server. Using demo data temporarily.
                All creation and editing actions have been disabled.
              </p>
            </div>
          </div>
        )}

        {/* Tarjetas de Estadísticas */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Invoices
              </CardTitle>
              <FileText className="h-4 w-4 bg-gray-100 text-gray-800 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {totalInvoices}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Amount
              </CardTitle>
              <Receipt className="h-4 w-4 bg-purple-100 text-purple-600 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(totalAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Pending Invoices
              </CardTitle>
              <Clock className="h-4 w-4 bg-amber-100 text-amber-600 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {pendingInvoices}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Paid Invoices
              </CardTitle>
              <CheckCircle className="h-4 w-4 bg-green-100 text-green-600 rounded-full border" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {paidInvoices}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de facturas */}
        <Card>
          <CardContent className="p-6">
            <Suspense
              fallback={
                <div className="text-center py-8">Loading invoices...</div>
              }
            >
              <InvoiceList
                invoices={invoicesData}
                transactions={transactionsData}
                userRole={userRole}
                hasConnectionError={hasError}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
