import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import {
  getUsers,
  getDepartments,
  getCompanyInfo,
} from "@/app/manage-company/actions";

import ManageCompanyClient from "./manageCompanyClient";
import { AlertCircle } from "lucide-react";

export default async function ManageCompanyPage() {
  const session = await getSession();
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  //data from backend
  const { company, error: companyError } = await getCompanyInfo();
  const companyData = company || {};

  const { users, error: usersError } = await getUsers();
  const usersData = users || {};

  const { departments, error: departmentsError } = await getDepartments();
  const departmentsData = departments || {};

  const hasError = !!companyError || !!usersError || !!departmentsError;
  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold mb-4">Manage Company</h1>

      {hasError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">
              Could not connect to the server. All creation and editing actions
              have been disabled.
            </p>
          </div>
        </div>
      )}

      <ManageCompanyClient
        company={companyData}
        users={usersData}
        departments={departmentsData}
        hasError={hasError}
      />
    </AuthenticatedLayout>
  );
}
