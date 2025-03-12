import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import ClientDashboardPage from "./ClientDashboard";

export default async function ServerDashboardPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session ? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <ClientDashboardPage />
    </AuthenticatedLayout>
  );
}