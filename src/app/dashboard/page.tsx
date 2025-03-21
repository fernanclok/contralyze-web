import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getBudgets, getInfoperCards } from "@/app/dashboard/actions";
import ClientDashboardPage from "./ClientDashboard";

export const dynamic = 'force-dynamic';

export default async function ServerDashboardPage() {
  let session, Budget, InfoCards ;
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
  }
  try{
    InfoCards = await getInfoperCards()
  }
  catch(error){
    console.error("Error fetching infocards:", error)
  }
  
    const user = session || null;
    const userRole = session?.role || "user";
    const userName = session
      ? `${session.userFirstName} ${session.userLastName}`.trim()
      : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
                  <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <ClientDashboardPage user={user} Budgets={Budget} Information={InfoCards}/>
    </AuthenticatedLayout>
  );
}