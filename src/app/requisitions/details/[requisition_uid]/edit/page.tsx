import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";

import { getRequisitions } from "@/app/requisitions/actions";
import EditRequisition from "./editRequisitionPage";
import { AlertCircle } from "lucide-react";

export default async function RequisitionEditPage({
  params,
}: {
  params: { requisition_uid: string };
}) {
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  const { requisition_uid } = params;

  //data from backend
  const { requisitions = [], error: requisitionError } =
    await getRequisitions();

  const requisitionData =
    Array.isArray(requisitions) && requisitions.length > 0 ? requisitions : [];

  //filtrate the requisition data to get the requisition with the requisition_uid
  const requisition = requisitionData.filter(
    (requisition) => requisition.requisition_uid === requisition_uid
  );

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
              Could not connect to the server. Using demo data temporarily.
            </p>
          </div>
        </div>
      )}

      <EditRequisition requisition={requisition} />
    </AuthenticatedLayout>
  );
}
