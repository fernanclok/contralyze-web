"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddClientSheet } from "./addClientSheet";
import { EditClientSheet } from "./editClientSheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { getClientsFromDB, saveClientsToDB } from "@/app/utils/indexedDB";

export default function ManageClientsClient({
  clients,
  user,
  hasError,
}: {
  clients: any;
  user: any;
  hasError: boolean;
}) {
  const [localClients, setLocalClients] = useState(clients || []);
  const [searchClients, setSearchClients] = useState("");

  // Recuperar datos de IndexedDB o del servidor
  useEffect(() => {
    if (clients.length === 0 && typeof window !== "undefined" && window.indexedDB) {
      console.log("No clients from server. Retrieving from IndexedDB...");
      getClientsFromDB()
        .then((clientsFromDB) => {
          if (clientsFromDB && clientsFromDB.length > 0) {
            setLocalClients(clientsFromDB);
          }
        })
        .catch((error) => {
          console.error("Error retrieving clients from IndexedDB:", error);
        });
    } else {
      setLocalClients(clients);
    }
  }, [clients]);

  // Guardar datos en IndexedDB cuando los datos del servidor cambian
  useEffect(() => {
    if (clients.length > 0 && typeof window !== "undefined" && window.indexedDB) {
      saveClientsToDB(clients).catch((error) => {
        console.error("Error saving clients to IndexedDB:", error);
      });
    }
  }, [clients]);

  // Función para actualizar localClients después de crear/editar un cliente
  const updateLocalClients = async () => {
    if (typeof window !== "undefined" && window.indexedDB) {
      try {
        const updatedClients = await getClientsFromDB();
        setLocalClients(updatedClients || []);
      } catch (error) {
        console.error("Error updating local clients:", error);
      }
    }
  };

  const filteredClients =
    localClients?.filter((client: any) =>
      `${client.name}`.toLowerCase().includes(searchClients.toLowerCase())
    ) || [];

  return (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <div className="relative w-full sm:w-1/3 md:w-1/2 lg:w-[395px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search clients..."
            value={searchClients}
            onChange={(e) => setSearchClients(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        {hasError ? (
          <Button className="bg-primary hover:bg-primary-ligth text-white" disabled>
            Add Client
          </Button>
        ) : (
          <AddClientSheet />
        )}
      </div>

      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {filteredClients.map((client: any) => (
            <Card key={client.id} className="relative">
              {!hasError && client.created_by.id === user.id && (
                <EditClientSheet client={client} onClientUpdated={updateLocalClients} />
              )}
              <CardHeader>
                <CardTitle className="text-black">
                  {client.name}{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      client.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {client.isActive ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {client.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  <strong className="text-black">Phone:</strong> {client.phone}
                </p>
                <p className="text-gray-500">
                  <strong className="text-black">Address:</strong> {client.address}
                </p>
                {user.role === "admin" && client.created_by.id !== user.id && (
                  <p className="text-gray-500">
                    <strong className="text-black">Created by:</strong> {client.created_by.first_name} {client.created_by.last_name}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-gray-500">
                  You have <strong className="text-black">5</strong> transactions with this client. You can see more info in{" "}
                  <Link href={`/transactions/${client.id}`} className="hover:underline">
                    transactions
                  </Link>
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-200px)]">
          <p className="text-gray-500 text-lg">No Clients found</p>
        </div>
      )}
    </>
  );
}