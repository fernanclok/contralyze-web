"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RefreshButton from "@/components/ui/RefreshButton";

export default function ManageClientsClient({
  clients,
  user,
}: {
  clients: any;
  user: any;
}) {
  const [searchClients, setSearchClients] = useState("");
  const filteredClients =
    clients?.client?.filter((client: any) =>
      `${client.name}`.toLowerCase().includes(searchClients.toLowerCase())
    ) || [];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Manage Clients</h1>

      {/* Mostrar mensajes de error si ocurren */}
      {clients.error ? (
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
          {/* Información de los clientes */}
          <div className="w-full flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search clients"
              value={searchClients}
              onChange={(e) => setSearchClients(e.target.value)}
              className="w-1/3 px-2 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring focus:ring-primary"
            />
            <AddClientSheet />
          </div>

          {/* Verifica si hay clientes antes de renderizar la grid */}
          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {filteredClients.map((client: any) => (
                <Card key={client.id} className="shadow-md relative">
                  {client.created_by.id === user.id && (
                    <EditClientSheet client={client} />
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
                      <strong className="text-black">Phone:</strong>{" "}
                      {client.phone}
                    </p>
                    <p className="text-gray-500">
                      <strong className="text-black">Address:</strong>{" "}
                      {client.address}
                    </p>
                    {user.role === "admin" &&
                      client.created_by.id !== user.id && (
                        <p className="text-gray-500">
                          <strong className="text-black">Created by:</strong>{" "}
                          {client.created_by.first_name}{" "}
                          {client.created_by.last_name}
                        </p>
                      )}
                  </CardContent>
                  <CardFooter>
                    <p className="text-gray-500">
                      You have <strong className="text-black">5</strong>{" "}
                      transactions with this client. You can see more info in{" "}
                      <Link
                        href={`/transactions/${client.id}`}
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
              <p className="text-gray-500 text-lg">No clients found</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
