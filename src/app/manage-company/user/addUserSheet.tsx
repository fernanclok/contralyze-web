"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { addUser } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function AddUserSheet({ departments }: { departments: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>(departments);
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (role === "admin") {
      // Si el rol es admin, preseleccionar "General department"
      setDepartment("Admin");
      // Filtrar para mostrar solo el "General department"
      setFilteredDepartments(departments.filter(dept => dept.name === "Admin"));
    } else if (role === "user") {
      // Si el rol es user, mostrar todos menos "General department"
      setFilteredDepartments(departments.filter(dept => dept.name !== "Admin"));
    } else {
      setDepartment("");
      setFilteredDepartments(departments);
    }
  }, [role, departments]);

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addUser(state, formData);
    if (!result.errors) {
      setIsOpen(false); // Cierra el modal si no hay errores
      emmiter.emit("showToast", {
        message: "User added successfully",
        type: "success",
      });
      router.refresh(); // Refresca la tabla de usuarios
    }
    setState(result);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setRole(""); // Restablecer el estado de role
          setDepartment(""); // Restablecer el estado de department
          setState(null); // Restablecer el estado general
        }
      }}
    >
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary-light text-white">
          Add user
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New User</SheetTitle>
          <SheetDescription>
            Fill in the details to add a new user to the system.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleAddUser} className="space-y-6">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <div className="mt-4 space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              placeholder="John"
              type="text"
            />
            {state?.errors?.first_name && (
              <p className="text-sm text-red-500">{state.errors.first_name}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              placeholder="Doe"
              type="text"
            />
            {state?.errors?.last_name && (
              <p className="text-sm text-red-500">{state.errors.last_name}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="example@gmail.com"
              type="email"
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
            {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
            />
            {state?.errors?.confirm_password && (
              <p className="text-sm text-red-500">
                {state.errors.confirm_password}
              </p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={handleRoleChange}
              className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
            >
              <option value="" disabled>
                Choose a role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            {role === "admin" && (
              <p className="text-sm text-neutral-500 mt-2">
                As an admin, you will have access to all areas and be able to
                perform various actions.
              </p>
            )}
            {state?.errors?.role && (
              <p className="text-sm text-red-500">{state.errors.role}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              name="department_id"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
              disabled={!role || (role === "user" && filteredDepartments.length === 0)}
            >
              <option value="">Select a department</option>
              {Array.isArray(filteredDepartments) && filteredDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {role === "user" && filteredDepartments.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                For this role, you need to create a department first.
              </p>
            )}
            {state?.errors?.department_id && (
              <p className="text-sm text-red-500">
                {state.errors.department_id}
              </p>
            )}
          </div>
          <div className="mt-6">
            <SubmitButton disabled={role === "user" && filteredDepartments.length === 0} />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="bg-primary hover:bg-primary-light text-white"
      disabled={pending || disabled}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="ml-2">Creating...</span>
        </div>
      ) : (
        "Add User"
      )}
    </Button>
  );
}