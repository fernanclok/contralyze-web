import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import {
  getUsers,
  getDepartments,
  getCompanyInfo,
} from "@/app/manage-company/actions";

import { AddUserSheet } from "./user/addUserSheet";
import { EditUserSheet } from "./user/editUserSheet";

import { AddDepartmentSheet } from "./department/addDepartmentSheet";
import { EditDepartmentSheet } from "./department/editDepartmentSheet";
import { DeleteDepartmentSheet } from "./department/deleteDepartmentSheet";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RefreshButton from "@/components/ui/RefreshButton";

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

  //obtener la información de la empresa
  try {
    company = await getCompanyInfo();
  } catch (error) {
    console.error("Error fetching company:", error);
    company = { error: "Error fetching company", company: [] };
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
      <h1 className="text-2xl font-bold mb-4">Manage Company</h1>

      {/* Mostrar mensajes de error si ocurren */}
      {company.error || users.error || departments.error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An error occurred, please check your internet connection and try
            again.
          </AlertDescription>
          <RefreshButton />
        </Alert>
      ) : (
        <>
          {/* Información de la empresa */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Company Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: "Company Name", value: company.company.name || "Company Name" },
          { label: "Company Email", value: company.company.email || "[email protected]" },
          { label: "Company Phone", value: company.company.phone || "+1234567890" },
          { label: "Company Address", value: company.company.address || "1234 Main St" },
          { label: "Company City", value: company.company.city || "City" },
          { label: "Company Country", value: company.company.country || "Country" },
          { label: "Company Zip", value: company.company.zip || "12345" },
          { label: "Company Size", value: company.company.size || "1-10" }
        ].map((field, index) => (
          <div key={index}>
            <label className="block text-sm text-gray-600 font-medium">{field.label}</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={field.value}
              disabled
            />
          </div>
        ))}
      </div>

          {/* Mostrar usuarios */}
          <h2 className="text-xl font-bold mt-8 mb-4">Users</h2>
          <div className="w-full flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search users"
              className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
            />
            <AddUserSheet departments={departments.departments || []} />
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.users.length > 0 ? (
                  users.users.map((user: any) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td
                        className={`px-6 py-4 ${
                          user.status === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {user.status}
                      </td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <EditUserSheet
                          user={user}
                          departments={departments.departments}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mostrar departamentos */}
          <h2 className="text-xl font-bold mt-8 mb-4">Departments</h2>
          <div className="w-full flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search departments"
              className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
            />
            <AddDepartmentSheet />
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Users
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.departments.length > 0 ? (
                  departments.departments.map((department: any) => (
                    <tr
                      key={department.id}
                      className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {department.name}
                      </td>
                      <td className="px-6 py-4">{department.users_count}</td>
                      <td className="px-6 py-4">{department.description}</td>
                      <td className="px-6 py-4">
                        {department.name !== "Admin" && (
                          <>
                            <EditDepartmentSheet department={department} />
                            <DeleteDepartmentSheet
                              departmentId={department.id}
                              usersCount={department.users_count}
                            />
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
