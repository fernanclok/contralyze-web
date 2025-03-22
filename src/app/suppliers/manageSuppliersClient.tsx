"use client";

import { useState } from "react";
import Link from "next/link";
import { AddSupplierSheet } from "./addSupplierSheet";
import { EditSupplierSheet } from "./editSupplierSheet";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManageSuppliersClient({
  suppliers,
  user,
  hasError,
}: {
  suppliers: any;
  user: any;
  hasError: boolean;
}) {
  const [searchSuppliers, setSearchSuppliers] = useState("");

  const filteredSuppliers =
    suppliers?.filter((supplier: any) =>
      `${supplier.name}`.toLowerCase().includes(searchSuppliers.toLowerCase())
    ) || [];

  return (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search suppliers"
          value={searchSuppliers}
          onChange={(e) => setSearchSuppliers(e.target.value)}
          className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
        />
        {hasError ? (
           <Button className="bg-primary hover:bg-primary-ligth text-white" disabled>
           Add Supplier
       </Button>
        ) : (
        <AddSupplierSheet />
        )}
      </div>

      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {filteredSuppliers.map((supplier: any) => (
            <Card key={supplier.id} className="shadow-md relative">
              {supplier.created_by.id === user.id && (
                <EditSupplierSheet supplier={supplier} />
              )}
              <CardHeader>
                <CardTitle className="text-black">
                  {supplier.name}{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-lg ${
                      supplier.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {supplier.isActive ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {supplier.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">{supplier.phone}</p>
                <p className="text-gray-500">{supplier.address}</p>
              </CardContent>
              <CardFooter>
                <p className="text-gray-500">
                  You have <strong className="text-black">5</strong>{" "}
                  transactions with this supplier. You can see more info in{" "}
                  <Link
                    href={`/transactions/${supplier.id}`}
                    className="hover:underline"
                  >
                    transactions
                  </Link>
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-200px)]">
          <p className="text-gray-500 text-lg">No Suppliers found</p>
        </div>
      )}
    </>
  );
}
