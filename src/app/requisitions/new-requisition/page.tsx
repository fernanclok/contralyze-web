
import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import AddRequisition from "./addRequisitionPage";

export default async function DashboardPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <AddRequisition />
    </AuthenticatedLayout>
  );
}
