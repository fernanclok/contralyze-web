"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search } from "lucide-react";
import { getSuppliersFromDB, saveSuppliersToDB } from "@/app/utils/indexedDB";

export default function ManageSuppliersClient({
  suppliers,
  user,
  hasError,
}: {
  suppliers: any;
  user: any;
  hasError: boolean;
}) {
  const [localSuppliers, setLocalSuppliers] = useState(suppliers || []);
  const [searchSuppliers, setSearchSuppliers] = useState("");

  useEffect(() => {
    if (suppliers.length === 0 && typeof window !== "undefined" && window.indexedDB) {
      getSuppliersFromDB()
      .then((suppliersFromDB) => {
        if(suppliersFromDB && suppliersFromDB.length > 0) {
          setLocalSuppliers(suppliersFromDB);
        }
      })
      .catch((error) => {
        console.error("Error retrieving suppliers from IndexedDB:", error)
      })
    } else {
      setLocalSuppliers(suppliers)
    }
  }, [suppliers]);

  useEffect(() => {
    if(suppliers.length > 0 && typeof window !== "undefined" && window.indexedDB) {
      saveSuppliersToDB(suppliers).catch((error) => {
        console.error("Error saving suppliers to IndexedDB:", error)
      });
    }
  }, [suppliers]);

  //funcion para actualizar localSuppliers despues de crear/editar un supplier
  const updateLocalSuppliers = async () => {
    if (typeof window !== "undefined" && window.indexedDB) {
      try {
        const updatedSuppliers = await getSuppliersFromDB();
        setLocalSuppliers(updatedSuppliers || [])
      } catch (error) {
        console.error("Error updating local suppliers:", error);
      }
    }
  }

  const filteredSuppliers =
    localSuppliers?.filter((supplier: any) =>
      `${supplier.name}`.toLowerCase().includes(searchSuppliers.toLowerCase())
    ) || [];

  return (
    <>
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-1/3 md:w-1/2 lg:w-[395px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            value={searchSuppliers}
            onChange={(e) => setSearchSuppliers(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        {hasError ? (
          <Button className="bg-primary hover:bg-primary-light text-white" disabled>
            Add Supplier
          </Button>
        ) : (
          <AddSupplierSheet onSupplierUpdated={updateLocalSuppliers} />
        )}
      </div>

      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {filteredSuppliers.map((supplier: any) => (
            <Card key={supplier.id} className="relative">
              {!hasError && supplier.created_by.id === user.id && (
                <EditSupplierSheet supplier={supplier} onSupplierUpdated={updateLocalSuppliers} />
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
                <p className="text-gray-500">
                  <strong className="text-black">Phone:</strong>{" "}{supplier.phone}</p>
                <p className="text-gray-500">
                  <strong className="text-black">Address:</strong>{" "}
                  {supplier.address}
                </p>
                {user.role === "admin" && supplier.created_by.id !== user.id && (
                  <p>
                    <strong>created by:</strong> {supplier.created_by.first_name}{" "}
                    {supplier.created_by.last_name}
                  </p>
                )}
              </CardContent>
              {/* <CardFooter>
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
              </CardFooter> */}
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