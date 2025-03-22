"use client";

import { useState } from "react";

import { AddUserSheet } from "./user/addUserSheet";
import { EditUserSheet } from "./user/editUserSheet";

import { AddDepartmentSheet } from "./department/addDepartmentSheet";
import { EditDepartmentSheet } from "./department/editDepartmentSheet";
import { DeleteDepartmentSheet } from "./department/deleteDepartmentSheet";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ManageCompanyClient({
  company,
  users,
  departments,
  hasError,
}: {
  company: any;
  users: any;
  departments: any;
  hasError: boolean;
}) {
  const [searchUsers, setSearchUsers] = useState("");
  const [searchDepartments, setSearchDepartments] = useState("");

  const filteredUsers = users.filter((user: any) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchUsers.toLowerCase())
  );

  const filteredDepartments = departments.filter((department: any) =>
    department.name.toLowerCase().includes(searchDepartments.toLowerCase())
  );

  return (
        <>
          {/* Información de la empresa */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: "Company Name", value: company.name || "Company Name" },
              { label: "Company Email", value: company.email || "[email protected]" },
              { label: "Company Phone", value: company.phone || "+1234567890" },
              { label: "Company Address", value: company.address || "null" },
              { label: "Company City", value: company.city || "City" },
              { label: "Company Zip", value: company.zip || "12345" },
              { label: "Company Size", value: company.size || "1-10" }
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
            {hasError ? (
             <Button className="bg-primary hover:bg-primary-light text-white" disabled>
             Add user
           </Button>
            )
            : (
            <AddUserSheet departments={departments || []} />
            )}
            
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
              <TableRow>
                  <TableHead className="hidden md:table-cell">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name} {user.isActive}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right">
                        <EditUserSheet
                          user={user}
                          departments={departments}
                        />
                      </TableCell>
                    </TableRow>
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
              </TableBody>
            </Table>
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
            {hasError ? (
             <Button className="bg-primary hover:bg-primary-light text-white" disabled>
             Add Department
           </Button>
            ) : (
            <AddDepartmentSheet />
            )}
            
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