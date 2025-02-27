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

import { deleteDepartment } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function DeleteDepartmentSheet({
  departmentId,
  usersCount,
}: {
  departmentId: string;
  usersCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const [state, deleteDepartmentAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      if (confirmText !== "CONFIRM") {
        return {
          errors: {
            server: "You must type CONFIRM to delete the department",
          },
        };
      }

      const result = await deleteDepartment(prevState, departmentId);
      if (!result.errors) {
        setIsOpen(false); // Cierra el modal si no hay errores
        emmiter.emit("showToast", {
          message: "Department deleted successfully",
          type: "success",
        });
        router.refresh(); // Refresca la tabla de departamentos
      }
      return result;
    },
    undefined
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
      <button className="font-medium text-red-600 hover:underline ml-2">
          Delete
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Delete Department</SheetTitle>
          {usersCount > 0 ? (
            <SheetDescription className="text-red-500 font-semibold">
              This department has users assigned and cannot be deleted.
            </SheetDescription>
          ) : (
            <SheetDescription>
              Are you sure you want to delete this department? This action cannot be{" "}
              <strong>undone</strong>. Please type <strong>"CONFIRM"</strong> to proceed.
            </SheetDescription>
          )}
        </SheetHeader>

        {usersCount === 0 && (
          <form action={deleteDepartmentAction} className="space-y-6">
            {state?.errors?.server && (
              <Alert className="text-red-500 mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.errors.server}</AlertDescription>
              </Alert>
            )}
            <div className="mt-4 space-y-2">
              <Label htmlFor="confirm_text">Type "CONFIRM" to delete</Label>
              <Input
                id="confirm_text"
                name="confirm_text"
                placeholder="CONFIRM"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>

            <SubmitButton confirmText={confirmText} />
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SubmitButton({ confirmText }: { confirmText: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="bg-red-600 hover:bg-red-700 text-white"
      disabled={pending || confirmText !== "CONFIRM"}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="ml-2">Deleting...</span>
        </div>
      ) : (
        "Delete Department"
      )}
    </Button>
  );
}