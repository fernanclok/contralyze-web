import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";

import { getRequisitions } from "@/app/requisitions/actions";
import RequisitionDetails from "./requisitionDetails";
import { AlertCircle } from "lucide-react";

export default async function RequisitionDetailsPage() {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  //data from backend
  const { requisitions = [], error: requisitionError } =
    await getRequisitions();

  const requisitionData =
    Array.isArray(requisitions) && requisitions.length > 0 ? requisitions : [];

  //api errors
  const hasError = !!requisitionError;
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
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

      <RequisitionDetails requisition={requisitionData} user={session} hasError={hasError} />
    </AuthenticatedLayout>
  );
}
