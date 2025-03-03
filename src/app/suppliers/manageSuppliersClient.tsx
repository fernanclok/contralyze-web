"use client";

import { useState } from "react";
import Link from "next/link";
// import { AddSupplierSheet } from "./addSupplierSheet";
// import { EditSupplierSheet } from "./editSupplierSheet";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RefreshButton from "@/components/ui/RefreshButton";

export default function ManageSuppliersClient({ suppliers }: { suppliers: any }) {
    const [searchSuppliers, setSearchSuppliers] = useState("");

    const filteredSuppliers =
        suppliers?.supplier?.filter((supplier: any) =>
            `${supplier.name}`.toLowerCase().includes(searchSuppliers.toLowerCase())
        ) || [];

    return (
        <>
        <h1 className="text-2xl font-bold mb-4">Manage Suppliers</h1>
        </>
    )
}