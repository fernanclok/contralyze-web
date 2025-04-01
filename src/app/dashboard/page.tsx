import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getBudgets, getInfoperCards, getTransactionsStatics,getDeptoData, getLastTransactions, getLastTransanctionByDepto } from "@/app/dashboard/actions";
import ClientDashboardPage from "./ClientDashboard";
import { AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ServerDashboardPage() {
  let session = null;

  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  // Obtener datos del backend con manejo de errores
  const { budgets = {}, error: Budgeterror } = await getBudgets();
  const { info: InfoCards = [], error: Infoerror } = await getInfoperCards();
  const { transactions: { available_years = [], transactions = [] } = {}, error: transactionsError } = await getTransactionsStatics();
  const { DeptoData = [], error: DeptoDataError } = await getDeptoData();
  const { transactionsList = [], error: transactionslistError } = await getLastTransactions();
  const { transactionsDepto = [], error: transactionsDeptoError } = await getLastTransanctionByDepto();
  
  // Usar datos reales o valores predeterminados si ocurrieron errores
  const budgetsData = budgets && Object.keys(budgets).length > 0
    ? budgets : {};
  const infoCardsData = InfoCards || { emergency_fund: 0, total_budget_amount: 0, total_expenses: 0 };
  const transactionsData = transactions && Object.keys(transactions).length > 0 ? transactions : {};
  const availableYearsData = available_years && available_years.length > 0 ? available_years : [];
  const deptoData = DeptoData && DeptoData.length > 0 ? DeptoData : [];
  const transactionslistData = transactionsList && transactionsList.length > 0 ? transactionsList : [];
  const transactionsDeptoData = transactionsDepto && transactionsDepto.length > 0 ? transactionsDepto : [];


  const user = session || null;
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";


    const hasError =
    !!transactionsError ||
    !!Budgeterror ||
    !!Infoerror ||
    !!DeptoDataError ||
    !!transactionslistError ||
    !!transactionsDeptoError;
  
  if (hasError) {
    console.error("One or more API requests failed:", {
      transactionsError,
      Budgeterror,
      Infoerror,
      DeptoDataError,
      transactionslistError,
      transactionsDeptoError,
    });
  }
    return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
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

      <ClientDashboardPage
        user={user}
        Budgets={budgetsData}
        Information={infoCardsData}
        Transaction={transactionsData}
        AvailableYears={availableYearsData}
        DeptoData={deptoData}
        TransactionsList={transactionslistData}
        TransactionsDepto={transactionsDeptoData}
      />
    </AuthenticatedLayout>
  );
}