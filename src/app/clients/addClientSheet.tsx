"use client";

import { useState } from "react";
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

import { addClient } from "./actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function AddClientSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  const handleAddClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await addClient(state, formData);
    if (!result.errors) {
      setIsOpen(false); // Cierra el modal si no hay errores
      emmiter.emit("showToast", {
        message: "Client added successfully",
        type: "success",
      });
      router.refresh(); // Refresca la tabla de clientes
    }
    setState(result);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setState(null);
        }
      }}
    >
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary-ligth text-white">
          Add Client
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Client</SheetTitle>
          <SheetDescription>Add a new client to the system</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleAddClient} className="space-y-6">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <div className="mt-4 space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Client Name"
              type="text"
            />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" placeholder="Email" type="email" />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone"
              type="text"
            />
            {state?.errors?.phone && (
              <p className="text-sm text-red-500">{state.errors.phone}</p>
            )}
          </div>
            <div className="mt-4 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                id="address"
                name="address"
                placeholder="Address"
                type="text"
                />
                {state?.errors?.address && (
                <p className="text-sm text-red-500">{state.errors.address}</p>
                )}
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
            <span className="ml-2">Creating...</span>
          </div>
        ) : (
          "Add Client"
        )}
      </Button>
    );
  }
