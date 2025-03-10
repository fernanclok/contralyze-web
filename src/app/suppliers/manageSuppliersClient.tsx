"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RefreshButton from "@/components/ui/RefreshButton";

export default function ManageSuppliersClient({
  suppliers,
  user,
}: {
  suppliers: any;
  user: any;
}) {
  const [searchSuppliers, setSearchSuppliers] = useState("");
  const [loading, setLoading] = useState(true);
  
  const filteredSuppliers =
    suppliers?.supplier?.filter((supplier: any) =>
      `${supplier.name}`.toLowerCase().includes(searchSuppliers.toLowerCase())
    ) || [];

    useEffect(() => {
      // Simulamos el tiempo de carga con un pequeño delay para ver el spinner
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }, [suppliers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-[calc(100vh-200px)]">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Manage Suppliers</h1>

      {suppliers.error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An error occurred, please check your internet connection and try
            again.
          </AlertDescription>
          <RefreshButton />
        </Alert>
      ) : (
        <>
          <div className="w-full flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search suppliers"
              value={searchSuppliers}
              onChange={(e) => setSearchSuppliers(e.target.value)}
              className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
            />
            <AddSupplierSheet />
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
                    <CardDescription className="text-gray-500">{supplier.email}</CardDescription>
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
      )}
    </>
  );
}
