import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { getRequisitions } from "@/app/requisitions/actions";
import EditRequisition from "./editRequisitionPage";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: { requisition_uid: string }; // Cambia `slug` a `requisition_uid`
  searchParams: { tab?: string }; // Mantén `searchParams` como está
}

export default async function RequisitionEditPage({ params }: PageProps) {
  const { requisition_uid } = params; // Accede directamente a `requisition_uid`
  const session = await getSession();

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  // Data from backend
  const { requisitions = [], error: requisitionError } = await getRequisitions();

  const requisitionData =
    Array.isArray(requisitions) && requisitions.length > 0 ? requisitions : [];

  // Filtra los datos de la requisición para obtener la requisición con el `requisition_uid`
  const requisition = requisitionData.filter(
    (requisition) => requisition.requisition_uid === requisition_uid
  );

  // API errors
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

      <EditRequisition requisition={requisition[0]} />
    </AuthenticatedLayout>
  );
}