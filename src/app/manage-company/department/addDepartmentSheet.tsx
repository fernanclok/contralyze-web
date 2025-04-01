"use client";

import { useState, useActionState } from "react";
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

import { addDepartment } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function AddDepartmentSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, addDepartmentAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await addDepartment(prevState, formData);
      if (!result.errors) {
        setIsOpen(false); // Cierra el modal si no hay errores
        emmiter.emit("showToast", {
          message: "Department added successfully",
          type: "success",
        });
        router.refresh(); // Refresca la tabla de departamentos
      }
      return result;
    },
    undefined
  );

  const router = useRouter();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary-light text-white">
          Add Department
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Department</SheetTitle>
          <SheetDescription className="pb-4">
            Fill in the details to add a new department to the system.
          </SheetDescription>
        </SheetHeader>
        <form action={addDepartmentAction} className="space-y-6">
            {state?.errors?.server && (
                <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.errors.server}</AlertDescription>
                </Alert>
            )}
          <div className="mt-4 space-y-2">
            <Label htmlFor="department_name">Department Name</Label>
            <Input
              id="department_name"
              name="department_name"
              placeholder="Engineering"
              type="text"
            />
            {state?.errors?.department_name && (
              <p className="text-red-500">{state.errors.department_name}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="department_description">Description</Label>
            <Input
              id="department_description"
              name="department_description"
              placeholder="This department is responsible for..."
              type="text"
            />
            {state?.errors?.department_description && (
              <p className="text-red-500">
                {state.errors.department_description}
              </p>
            )}
          </div>
          <SubmitButton />
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
          <span className="ml-2">Creating...</span>
        </div>
      ) : (
        "Add Department"
      )}
    </Button>
  );
}
