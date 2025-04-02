import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getBudgets, getInfoperCards, getTransactionsStatics, getDeptoData, getLastTransactions, getLastTransanctionByDepto } from "@/app/dashboard/actions";
import ClientDashboardPage from "./ClientDashboard";
import { AlertCircle } from "lucide-react";

export default async function ServerDashboardPage() {
  let session = null;

  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  // Usar Promise.allSettled para manejar múltiples solicitudes
  const results = await Promise.allSettled([
    getBudgets(),
    getInfoperCards(),
    getTransactionsStatics(),
    getDeptoData(),
    getLastTransactions(),
    getLastTransanctionByDepto(),
  ]);

  const [budgetsResult, infoCardsResult, transactionsResult, deptoDataResult, transactionsListResult, transactionsDeptoResult] = results;

  // Manejar los resultados de las promesas
  const budgetsData = budgetsResult.status === "fulfilled" ? budgetsResult.value.budgets : {};
  const infoCardsData = infoCardsResult.status === "fulfilled" ? infoCardsResult.value.info : [];
  const transactionsData = transactionsResult.status === "fulfilled" ? transactionsResult.value.transactions.transactions : {};
  const availableYearsData = transactionsResult.status === "fulfilled" && transactionsResult.value?.transactions?.available_years
  ? transactionsResult.value.transactions.available_years
  : [];
  const deptoData = deptoDataResult.status === "fulfilled" ? deptoDataResult.value.DeptoData : [];
  const transactionslistData = transactionsListResult.status === "fulfilled" ? transactionsListResult.value.transactionsList : [];
  const transactionsDeptoData = transactionsDeptoResult.status === "fulfilled" ? transactionsDeptoResult.value.transactionsDepto : [];
  // Manejo de errores
  const hasError = results.some((result) => result.status === "rejected");

  if (hasError) {
    console.error("One or more API requests failed:", {
      budgetsError: budgetsResult.status === "rejected" ? budgetsResult.reason : null,
      infoCardsError: infoCardsResult.status === "rejected" ? infoCardsResult.reason : null,
      transactionsError: transactionsResult.status === "rejected" ? transactionsResult.reason : null,
      deptoDataError: deptoDataResult.status === "rejected" ? deptoDataResult.reason : null,
      transactionsListError: transactionsListResult.status === "rejected" ? transactionsListResult.reason : null,
      transactionsDeptoError: transactionsDeptoResult.status === "rejected" ? transactionsDeptoResult.reason : null,
    });
  } 


  console.log('aaaaaaaaaaaaa', availableYearsData)
  const user = session || null;
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

    return (
      <AuthenticatedLayout userRole={userRole} userName={userName}>
        {hasError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">
                Could not connect to the server. Using locally stored data temporarily. All creation and editing actions have been disabled.
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