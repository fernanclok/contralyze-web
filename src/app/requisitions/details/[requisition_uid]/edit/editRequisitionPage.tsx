"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  type File,
  FileText,
  Paperclip,
  Upload,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfDay } from "date-fns"

import { editRequisition } from "@/app/requisitions/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { emmiter } from "@/lib/emmiter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "@/components/ui/card";

export default function EditRequisition({ requisition }: { requisition: any }) {
    console.log(requisition);
    const [state, editRequisitionAction] = useState<any>(requisition);
    const [items, setItems] = useState<any>(requisition.items);
    const [requestDate, setRequestDate] = useState<any>(requisition.request_date);
    const router = useRouter();

    const handleEditRequisition = async( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await editRequisition(requisition.requisition_uid, state);
        if (!result.errors) {
            emmiter.emit("showToast", {
                message: "Requisition edited successfully",
                type: "success",
            });
            router.refresh();
        }
        return result;
    };

  return (
    <div>
      <h1>Edit Requisition</h1>
    </div>
  );
}
