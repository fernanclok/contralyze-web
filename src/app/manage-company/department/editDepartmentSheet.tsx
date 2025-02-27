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

import { editDepartment } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditDepartmentSheet({ department }: { department: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, editDepartmentAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await editDepartment(prevState, formData);
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
        <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
          Edit
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Department</SheetTitle>
          <SheetDescription>
            Fill in the details to edit the department.
          </SheetDescription>
        </SheetHeader>
        <form action={editDepartmentAction} className="space-y-6">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="department_id" value={department.id} />
            <div className="mt-4 space-y-2">
              <Label>Department Name</Label>
              <Input
                type="text"
                name="department_name"
                defaultValue={department.name}
                placeholder="Department Name"
              />
            </div>
            <div className="mt-4 space-y-2">
              <Label>Department Description</Label>
              <Input
                type="text"
                name="department_description"
                defaultValue={department.description}
                placeholder="Department Description"
              />
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
          <span className="ml-2">Editing...</span>
        </div>
      ) : (
        "Edit Department"
      )}
    </Button>
  );
}
