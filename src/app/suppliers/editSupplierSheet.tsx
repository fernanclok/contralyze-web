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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { editSupplier } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditSupplierSheet({ supplier }: { supplier: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(supplier.isActive)
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  const handleEditSupplier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget)
    const result = await editSupplier(state, formData);
    if (!result.errors) {
      setIsOpen(false);
      emmiter.emit('showToast', {
        message: "User updated successfully",
        type: "success",
      });
      router.refresh();
    }
    setState(result);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      setIsActive(supplier.isActive)
      }}
    >
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
        <form onSubmit={handleEditSupplier} className="space-y-6">
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
            <Select
              name="isActive"
              value={isActive ? "true" : "false"}
              onValueChange={(value) => setIsActive(value === "true")}
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
