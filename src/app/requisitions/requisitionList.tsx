"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  Eye,
  FilterX,
  Search,
} from "lucide-react";
import { getRequisitionsFromDB, saveRequisitionsToDB } from "../utils/indexedDB";

export default function RequisitionsList({
  requisitions,
  user,
  departments,
}: {
  requisitions: any[];
  user: any;
  departments: any[];
}) {
  const [localRequisitions, setLocalRequisitions] = useState(requisitions || []);
  const [filter, setFilter] = useState("All status");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (requisitions.length === 0 && typeof window !== "undefined" && window.indexedDB) {
      getRequisitionsFromDB()
      .then((requisionsFromDB) => {
        if (requisionsFromDB && requisionsFromDB.length > 0) {
          setLocalRequisitions(requisionsFromDB);
        }
      })
      .catch((error) => {
        console.error("Error retrieving requisitions from IndexedDB:", error)
      })
    } else (
      setLocalRequisitions(requisitions)
    )
  }, [requisitions]);

  useEffect(() => {
    if (requisitions.length > 0 &&typeof window !== "undefined" && window.indexedDB) {
      saveRequisitionsToDB(requisitions).catch((error) => {
        console.error("Error saving requisitions to IndexedDB:", error)
      })
    }
  }, [requisitions]);

  const filteredRequisitions = localRequisitions.filter((req: any) => {
    const matchesFilter =
      filter === "All status" || req.status.toLowerCase() === filter.toLowerCase();
    const matchesPriorityFilter =
      priorityFilter === "All priorities" ||
      req.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesDepartmentFilter =
      departmentFilter === "All departments" ||
      (req.department && req.department.name.toLowerCase() === departmentFilter.toLowerCase());
    const matchesSearch =
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.requisition_uid.toLowerCase().includes(search.toLowerCase());
    return (
      matchesFilter &&
      matchesPriorityFilter &&
      matchesDepartmentFilter &&
      matchesSearch
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "in checkout":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Function to get the badge color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <>
    <div className="w-full flex justify-between items-center mb-4">
            {/* Search and filter container */}
            <div className="flex items-center gap-4 w-2/3">
              <div className="relative w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search requisition..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All status">All status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {/* select to filter by priority */}
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All priorities">All priorities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {/* select to filter by department only if the user is admin */}
                {user.role === "admin" && (
                  <>
                    <Select
                      value={departmentFilter}
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md">
                        <SelectItem value="All departments">All departments</SelectItem>
                       {departments.map((deparment: any) => (
                          <SelectItem key={deparment.id} value={deparment.name}>
                            {deparment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
              {(filter !== "All status" || priorityFilter !== "All priorities" || departmentFilter !== "All departments") && (
                <Button
                variant="ghost"
                size="sm"
                className="whitespace-nowrap"
                  onClick={() => {
                    setFilter("All status");
                    setPriorityFilter("All priorities");
                    setDepartmentFilter("All departments");
                  }}
                >
                  <FilterX className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="hidden md:table-cell">Request Date</TableHead>
                  <TableHead>Title</TableHead>
                  {user.role === "admin" && (
                    <TableHead className="hidden md:table-cell">
                      Department
                    </TableHead>
                  )}
                  <TableHead className="hidden lg:table-cell">
                    Priority
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequisitions.length > 0 ? (
                  filteredRequisitions.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.requisition_uid}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {req.request_date}
                      </TableCell>
                      <TableCell>{req.title}</TableCell>
                      {user.role === "admin" && (
                        <TableCell className="hidden md:table-cell">
                          {req.department.name}
                        </TableCell>
                      )}
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={getPriorityColor(req.priority)}>
                          {req.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                      ${req.total_amount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/requisitions/details/${req.requisition_uid}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-gray-500"
                    >
                      No requisitions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
    </>
  );
}