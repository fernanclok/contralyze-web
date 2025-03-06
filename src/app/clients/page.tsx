import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getClients } from "@/app/clients/actions";

import ManageClientsClient from "../clients/manageClientsClient";

export const dynamic = 'force-dynamic';

export default async function ClientPage() {
  let session, clients;

  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  try {
    clients = await getClients();
  }
  catch (error) {
    console.error("Error fetching clients:", error);
    clients = { error: "Error fetching clients", clients: [] };
  }

  const user = session || null;
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <ManageClientsClient clients={clients} user={user}/>
    </AuthenticatedLayout>
  );
}
