"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Filter, PlusCircle, Search } from "lucide-react";

// Datos de ejemplo para mostrar en la tabla
const requisicionesEjemplo = [
  {
    id: "REQ-2023-001",
    titulo: "Equipos de cómputo para el departamento de ventas",
    departamento: "Ventas",
    fechaSolicitud: "2023-10-15",
    fechaRequerida: "2023-11-15",
    prioridad: "Alta",
    estado: "Aprobada",
    total: 4500.0,
  },
  {
    id: "REQ-2023-002",
    titulo: "Material de oficina trimestral",
    departamento: "Administración",
    fechaSolicitud: "2023-10-18",
    fechaRequerida: "2023-10-30",
    prioridad: "Media",
    estado: "Pendiente",
    total: 850.75,
  },
  {
    id: "REQ-2023-003",
    titulo: "Software de diseño gráfico",
    departamento: "Marketing",
    fechaSolicitud: "2023-10-20",
    fechaRequerida: "2023-11-05",
    prioridad: "Baja",
    estado: "En revisión",
    total: 1200.0,
  },
  {
    id: "REQ-2023-004",
    titulo: "Mobiliario para sala de juntas",
    departamento: "Operaciones",
    fechaSolicitud: "2023-10-22",
    fechaRequerida: "2023-12-01",
    prioridad: "Media",
    estado: "Rechazada",
    total: 3200.5,
  },
  {
    id: "REQ-2023-005",
    titulo: "Servidores para centro de datos",
    departamento: "IT",
    fechaSolicitud: "2023-10-25",
    fechaRequerida: "2023-11-25",
    prioridad: "Urgente",
    estado: "Aprobada",
    total: 12500.0,
  },
];

export default function ManageRequisitionsClient() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredRequisitions = requisicionesEjemplo.filter((req) => {
    const coincideFiltro =
      filter === "All" || req.estado.toLowerCase() === filter;
    const coincideBusqueda =
      req.titulo.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "aprobada":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "en revisión":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "rechazada":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Función para obtener el color de la badge según la prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case "baja":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "media":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "alta":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      case "urgente":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Manage Clients</h1>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
            <Filter className="h-4 2-4 text-gray-500" />
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                    <SelectValue>{filter}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Aprobada">Aprobada</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En revisión">En revisión</SelectItem>
                    <SelectItem value="Rechazada">Rechazada</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar requisición..."
                  className="pl-8 w-full md:w-[300px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Link href="/nueva-requisicion">
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Nueva
                </Button>
              </Link>
            </div>
      </div>
    </>
  );
}
