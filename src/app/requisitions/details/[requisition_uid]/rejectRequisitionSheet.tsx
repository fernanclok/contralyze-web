"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { XCircle } from "lucide-react";

import { rejectRequisition } from "@/app/requisitions/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function RejectRequisitionSheet({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  const handleRejectRequisition = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await rejectRequisition(state, formData);
    if (!result.errors) {
      setIsOpen(false); // Cierra el modal si no hay errores
      emmiter.emit("showToast", {
        message: "Requisition rejected successfully",
        type: "success",
      });
      router.refresh(); // Refresca la tabla de requisiciones
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
        <Button className="bg-red-500 hover:bg-red-600 text-white w-full">
          <XCircle className="mr-2 h-4 w-4" />
          Reject Requisition
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reject Requisition</SheetTitle>
          <SheetDescription>Reject a requisition</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleRejectRequisition} className="space-y-6">
          {state?.errors?.server && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.errors.server}</AlertDescription>
            </Alert>
          )}
          <input type="hidden" name="requisition_id" value={id} />
          <div className="mt-4 space-y-2">
            <Label htmlFor="rejection_reason">Reason</Label>
            <Textarea
              id="rejection_reason"
              name="rejection_reason"
              required
              placeholder="Enter the reason for rejecting the requisition"
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
          <span className="ml-2">Rejecting...</span>
        </div>
      ) : (
        "Reject Requisition"
      )}
    </Button>
  );
}
