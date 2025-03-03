import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import {
  getUsers,
  getDepartments,
  getCompanyInfo,
} from "@/app/manage-company/actions";

import ManageCompanyClient from "./manageCompanyClient";

export default async function ManageCompanyPage({
  children,
}: {
  children: React.ReactNode;
}) {
  let session, users, departments, company;

  // Obtener sesión
  try {
    session = await getSession();
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  // Obtener la información de la empresa
  try {
    company = await getCompanyInfo();
  } catch (error) {
    console.error("Error fetching company:", error);
    company = { error: "Error fetching company", company: {} };
  }

  // Obtener usuarios
  try {
    users = await getUsers();
  } catch (error) {
    console.error("Error fetching users:", error);
    users = { error: "Error fetching users", users: [] };
  }

  // Obtener departamentos
  try {
    departments = await getDepartments();
  } catch (error) {
    console.error("Error fetching departments:", error);
    departments = { error: "Error fetching departments", departments: [] };
  }

  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <ManageCompanyClient
        company={company}
        users={users}
        departments={departments}
      />
    </AuthenticatedLayout>
  );
}