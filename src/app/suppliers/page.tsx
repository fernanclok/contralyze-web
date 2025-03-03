import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getSuppliers } from "@/app/suppliers/actions";

import ManageSuppliersClient from "./manageSuppliersClient";

export default async function SuppliersPage({
  children,
}: {
  children: React.ReactNode;
}) {
  let session, suppliers;

  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  try {
    suppliers = await getSuppliers();
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    suppliers = { error: "Error fetching suppliers", suppliers: [] };
  }

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
        <ManageSuppliersClient suppliers={suppliers} />
    </AuthenticatedLayout>
  );
}
