"use client";

import { useState } from "react";

import { AddUserSheet } from "./user/addUserSheet";
import { EditUserSheet } from "./user/editUserSheet";

import { AddDepartmentSheet } from "./department/addDepartmentSheet";
import { EditDepartmentSheet } from "./department/editDepartmentSheet";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterX, Search, X } from "lucide-react";

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
  const [filterUsers, setFilterUsers] = useState("All Status");
  const [searchDepartments, setSearchDepartments] = useState("");
  const [filterDepartments, setFilterDepartments] = useState("All Status");

  const filteredUsers = users.filter((user: any) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchUsers.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchesFilter =
      filterUsers === "All Status" ||
      user.isActive === (filterUsers === "Active");
    return matchesSearch && matchesFilter;
  });

  const filteredDepartments = departments.filter((department: any) => {
    const matchesSearch =
      department.name.toLowerCase().includes(searchDepartments.toLowerCase()) ||
      department.description
        .toLowerCase()
        .includes(searchDepartments.toLowerCase());
    const matchesFilter =
      filterDepartments === "All Status" ||
      department.isActive === (filterDepartments === "Active");
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Información de la empresa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: "Company Name", value: company.name || "Company Name" },
          {
            label: "Company Email",
            value: company.email || "[email protected]",
          },
          { label: "Company Phone", value: company.phone || "+1234567890" },
          { label: "Company Address", value: company.address || "null" },
          { label: "Company City", value: company.city || "City" },
          { label: "Company Zip", value: company.zip || "12345" },
        ].map((field, index) => (
          <div key={index}>
            <label className="block text-sm text-gray-600 font-medium">
              {field.label}
            </label>
            <p className="mt-1 text-sm text-gray-900">{field.value}</p>
          </div>
        ))}
      </div>

      {/* Mostrar usuarios */}
      <h2 className="text-xl font-bold mt-8 mb-4">Users</h2>
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users..."
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              className="pl-8 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Select value={filterUsers} onValueChange={setFilterUsers}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(filterUsers !== "All Status") && (
          <Button
            variant="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => {
              setSearchUsers("");
              setFilterUsers("All Status");
            }}
          >
            <FilterX className="h-4 w-4" />
            Clear filters
          </Button>
        )}
        </div>
        
        {hasError ? (
          <Button
            className="bg-primary hover:bg-primary-light text-white"
            disabled
          >
            Add user
          </Button>
        ) : (
          <AddUserSheet departments={departments || []} />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="md:table-cell">Name</TableHead>
              <TableHead className="md:table-cell">Email</TableHead>
              <TableHead className="md:table-cell">Department</TableHead>
              <TableHead className="md:table-cell">Status</TableHead>
              <TableHead className="md:table-cell">Role</TableHead>
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
                  <TableCell>{user.department.name}</TableCell>
                  <TableCell>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <EditUserSheet user={user} departments={departments} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className=" py-6 text-center text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mostrar departamentos */}
      <h2 className="text-xl font-bold mt-8 mb-4">Departments</h2>
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search departments..."
              value={searchDepartments}
              onChange={(e) => setSearchDepartments(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filterDepartments}
            onValueChange={setFilterDepartments}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {(filterDepartments !== "All Status") && (
          <Button
            variant="ghost"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => {
              setSearchDepartments("");
              setFilterDepartments("All Status");
            }}
          >
            <FilterX className="h-4 w-4" />
            Clear filters
          </Button>
        )}
        </div>
        {hasError ? (
          <Button
            className="bg-primary hover:bg-primary-light text-white"
            disabled
          >
            Add Department
          </Button>
        ) : (
          <AddDepartmentSheet />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="md:table-cell">Name</TableHead>
              <TableHead className="md:table-cell">Users</TableHead>
              <TableHead className="md:table-cell">Description</TableHead>
              <TableHead className="md:table-cell">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department: any) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.users_count}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        department.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {department.name !== "Admin" && (
                      <>
                        <EditDepartmentSheet department={department} />
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                colSpan={8} 
                className="py-6 text-center text-gray-500"
                >
                  No departments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
