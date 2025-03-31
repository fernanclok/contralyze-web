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

import { editClient } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditClientSheet({ client, onClientUpdated }: { client: any, onClientUpdated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, editClientAction] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await editClient(prevState, formData);
            if (!result.errors) {
                setIsOpen(false); // Cierra el modal si no hay errores
                emmiter.emit("showToast", {
                    message: "Client edited successfully",
                    type: "success",
                });
                router.refresh(); // Refresca la tabla de departamentos
                onClientUpdated(); // Notifica a ManageClientsClient para actualizar la lista
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
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Edit Client</SheetTitle>
                <SheetDescription className="pb-4">
                    Fill in the details to edit the client.
                </SheetDescription>
                </SheetHeader>
                <form action={editClientAction} className="space-y-6">
                    {state?.errors?.server && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{state.errors.server}</AlertDescription>
                        </Alert>
                    )}
                    <input type="hidden" name="client_id" value={client.id} />
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={client.name}
                            required
                        />
                        </div>
                        <div className="mt-4 space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            defaultValue={client.email}
                            required
                        />
                        </div>
                        <div className="mt-4 space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            type="text"
                            name="phone"
                            id="phone"
                            defaultValue={client.phone}
                            required
                        />
                        </div>
                        <div className="mt-4 space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            type="text"
                            name="address"
                            id="address"
                            defaultValue={client.address}
                            required
                        />
                        </div>
                        <div className="mt-4 space-y-2">
                        <Label htmlFor="isActive">Status</Label>
                        <select
                            name="isActive"
                            id="isActive"
                            defaultValue={client.isActive ? "true" : "false"}
                            required
                            className="border border-neutral-200 text-gray-900 text-sm rounded-md focus:ring-primary focus:border-primary block w-full p-2.5"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
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
          "Edit Client"
        )}
      </Button>
    );
  }