import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getBudgets, getInfoperCards, getTransactions } from "@/app/dashboard/actions";
import ClientDashboardPage from "./ClientDashboard";

export const dynamic = 'force-dynamic';

export default async function ServerDashboardPage() {
  let session, Budget, InfoCards, transactions ;
   try {
      session = await getSession();
    } catch (error) {
      console.error("Error fetching session:", error);
      session = null;
    }
  try{
    Budget = await getBudgets()
  }
  catch(error){
    console.error("Error fetching bufgeeeeeets:", error)
    Budget = null
  }
  try{
    InfoCards = await getInfoperCards()
  }
  catch(error){
    console.error("Error fetching infocards:", error)
    InfoCards = null
  }
  try {
    transactions = await getTransactions();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    transactions = null;
  }
  
    const user = session || null;
    const userRole = session?.role || "user";
    const userName = session
      ? `${session.userFirstName} ${session.userLastName}`.trim()
      : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <ClientDashboardPage user={user} Budgets={Budget} Information={InfoCards} Transaction={transactions}/>
    </AuthenticatedLayout>
  );
}