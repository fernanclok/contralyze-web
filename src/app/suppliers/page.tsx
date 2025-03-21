import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getSuppliers } from "@/app/suppliers/actions";
import { AlertCircle } from "lucide-react";

import ManageSuppliersClient from "./manageSuppliersClient";

export default async function SuppliersPage() {
  const session = await getSession();
  const user = session || null;
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  //data from backend
  const { suppliers, error: supplierError } = await getSuppliers();

  const supplierData = suppliers || [];
  //api errors
  const hasError = !!supplierError;
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold mb-4">Manage Suppliers</h1>

      {hasError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">
                Could not connect to the server.
                All creation and editing actions have been disabled.
              </p>
          </div>
        </div>
      )}

      <ManageSuppliersClient suppliers={supplierData} user={user} />
    </AuthenticatedLayout>
  );
}
