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

import { editSupplier } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditSupplierSheet({ supplier }: { supplier: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, editSupplierAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await editSupplier(prevState, formData);
      if (!result.errors) {
        setIsOpen(false); // Cierra el modal si no hay errores
        emmiter.emit("showToast", {
          message: "Supplier edited successfully",
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
        <button className="absolute top-2 right-2 font-medium text-blue-600 dark:text-blue-500 hover:underline">
          Edit
        </button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Supplier</SheetTitle>
          <SheetDescription className="pb-4">
            Fill in the details to edit the supplier.
          </SheetDescription>
        </SheetHeader>
        <form action={editSupplierAction} className="space-y-6">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="supplier_id" value={supplier.id} />
          <div className="mt-4 space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Supplier name"
              defaultValue={supplier.name}
            />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              defaultValue={supplier.email}
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              id="phone"
              name="phone"
              placeholder="Phone"
              defaultValue={supplier.phone}
            />
            {state?.errors?.phone && (
              <p className="text-sm text-red-500">{state.errors.phone}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              placeholder="Address"
              defaultValue={supplier.address}
            />
            {state?.errors?.address && (
              <p className="text-sm text-red-500">{state.errors.address}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <select
              name="isActive"
              id="isActive"
              defaultValue={supplier.isActive ? "true" : "false"}
              className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {!supplier.isActive && (
            <div className="mt-2 text-red-600">
              <p>This supplier is inactive.</p>
            </div>
          )}
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
        "Edit Supplier"
      )}
    </Button>
  );
}
