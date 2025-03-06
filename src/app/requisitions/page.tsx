import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";

import ManageRequisitionsClient from "./manageRequisitionsClient";

export const dynamic = 'force-dynamic';

export default async function RequisitionsPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
        <ManageRequisitionsClient />
    </AuthenticatedLayout>
  );
}
