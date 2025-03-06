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

import { editUser } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditUserSheet({
  user,
  departments,
}: {
  user: any;
  departments: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [isActive, setIsActive] = useState(user.isActive);
  const [filteredDepartments, setFilteredDepartments] = useState(departments);
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setRole(user.role);
    setDepartment(user.department_id);
  }, [user]);

  useEffect(() => {
    if (role === "admin") {
      // Si el rol es admin, preseleccionar "General department"
      setDepartment("Admin");
      // Filtrar para mostrar solo el "General department"
      setFilteredDepartments(
        departments.filter((dept) => dept.name === "Admin")
      );
    } else if (role === "user") {
      // Si el rol es user, mostrar todos menos "General department"
      setFilteredDepartments(
        departments.filter((dept) => dept.name !== "Admin")
      );
    } else {
      setDepartment("");
      setFilteredDepartments(departments);
    }
  }, [role, departments]);

  const handleEditUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    // Solo enviar la nueva contraseña si se proporciona y coincide con la confirmación
    if (newPassword && newPassword === confirmPassword) {
      formData.append("new_password", newPassword);
    }

    const result = await editUser(state, formData);
    if (!result.errors) {
      setIsOpen(false); // Cierra el modal si no hay errores
      emmiter.emit("showToast", {
        message: "User updated successfully",
        type: "success",
      });
      router.refresh(); // Refresca la tabla de usuarios
    }
    setState(result);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
          Edit
        </button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Fill in the details to edit the user.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleEditUser}>
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="user_id" value={user.id} />
          <div className="mt-4 space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              type="text"
              name="first_name"
              id="first_name"
              defaultValue={user.first_name}
              required
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              type="text"
              name="last_name"
              id="last_name"
              defaultValue={user.last_name}
              required
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              defaultValue={user.email}
              className="bg-neutral-100"
              readOnly
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="role">Role</Label>
            {user.is_first_user ? (
              <Input
                type="text"
                name="role"
                id="role"
                value={role}
                readOnly
                className="bg-neutral-100"
              />
            ) : (
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="department">Department</Label>
            {user.is_first_user ? (
              <>
                <Input
                  type="text"
                  id="department_display"
                  value={department}
                  readOnly
                  className="bg-neutral-100"
                />
                <input
                  type="hidden"
                  name="department_id"
                  value={user.department_id}
                />
              </>
            ) : (
              <select
                name="department_id"
                id="department_id"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
              >
                {filteredDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="isActive">Status</Label>
            {user.is_first_user ? (
              <Input
                type="text"
                name="isActive"
                id="isActive"
                value={isActive ? "Active" : "Inactive"}
                readOnly
                className="bg-neutral-100"
              />
            ) : (
              <select
                name="isActive"
                id="isActive"
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            )}
          </div>
          {!isActive && (
            <div className="mt-2 text-red-600">
              The user will lose access to the system.
            </div>
          )}
          <div className="mt-4 space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              type="password"
              name="confirm_password"
              id="confirm_password"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div className="mt-6">
            <SubmitButton />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="bg-primary hover:bg-primary-light text-white"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="ml-2">Editing...</span>
        </div>
      ) : (
        "Edit User"
      )}
    </Button>
  );
}
