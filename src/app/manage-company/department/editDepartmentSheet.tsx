"use client";

import { useState, useActionState, useEffect } from "react";
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
  SheetFooter
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Edit } from "lucide-react";

import { editDepartment } from "../actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";

export function EditDepartmentSheet({ department, onDepartmentUpdated }: { department: any; onDepartmentUpdated:() => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(department.isActive);
  const [state, setState] = useState<any>(null);

  const handleEditDepartment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await editDepartment(state, formData);
    if (!result.errors) {
      setIsOpen(false);
      emmiter.emit("showToast", {
        message: "User updated successfully",
        type: "success",
      });
      router.refresh();
      onDepartmentUpdated();
    }
    setState(result);
  };

  const router = useRouter();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setIsActive(department.isActive);
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary hover:text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Department</SheetTitle>
          <SheetDescription className="pb-4">
            Fill in the details to edit the department.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleEditDepartment} className="space-y-6">
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
          <div className="mt-4 space-y-2">
            <Label htmlFor="isActive">status</Label>
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
          {!isActive && (
            <div className="mt-4 text-red-500">
              If you Inactivate this department, You Can not added new users to
              the deparment. And also the existing users in this department will
              can not make any action.
            </div>
          )}
          <SheetFooter>
            <SubmitButton />
          </SheetFooter>
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
