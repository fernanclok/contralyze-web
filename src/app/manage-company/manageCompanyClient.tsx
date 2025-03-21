"use client";

import { useState } from "react";

import { AddUserSheet } from "./user/addUserSheet";
import { EditUserSheet } from "./user/editUserSheet";

import { AddDepartmentSheet } from "./department/addDepartmentSheet";
import { EditDepartmentSheet } from "./department/editDepartmentSheet";
import { DeleteDepartmentSheet } from "./department/deleteDepartmentSheet";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RefreshButton from "@/components/ui/RefreshButton";

export default function ManageCompanyClient({
  company,
  users,
  departments,
}: {
  company: any;
  users: any;
  departments: any;
}) {
  const [searchUsers, setSearchUsers] = useState("");
  const [searchDepartments, setSearchDepartments] = useState("");
  console.log(users);

  const filteredUsers = users.users.filter((user: any) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchUsers.toLowerCase())
  );

  const filteredDepartments = departments.departments.filter((department: any) =>
    department.name.toLowerCase().includes(searchDepartments.toLowerCase())
  );

  return (
    <>
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
              { label: "Company Address", value: company.company.address || "null" },
              { label: "Company City", value: company.company.city || "City" },
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
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {user.first_name} {user.last_name} {user.isActive}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
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
                value={searchDepartments}
                onChange={(e) => setSearchDepartments(e.target.value)}
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
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department: any) => (
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
    </>
  );
}