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
import { Eye, Search } from "lucide-react";

// Example data to display in the table
const exampleRequisitions = [
  {
    id: "REQ-2023-001",
    title: "Computers for the sales department",
    department: "Sales",
    requestDate: "2023-10-15",
    requiredDate: "2023-11-15",
    priority: "High",
    status: "Approved",
    total: 4500.0,
  },
  {
    id: "REQ-2023-002",
    title: "Quarterly office supplies",
    department: "Administration",
    requestDate: "2023-10-18",
    requiredDate: "2023-10-30",
    priority: "Medium",
    status: "Pending",
    total: 850.75,
  },
  {
    id: "REQ-2023-003",
    title: "Graphic design software",
    department: "Marketing",
    requestDate: "2023-10-20",
    requiredDate: "2023-11-05",
    priority: "Low",
    status: "In Checkout",
    total: 1200.0,
  },
  {
    id: "REQ-2023-004",
    title: "Furniture for the meeting room",
    department: "Operations",
    requestDate: "2023-10-22",
    requiredDate: "2023-12-01",
    priority: "Medium",
    status: "Rejected",
    total: 3200.5,
  },
  {
    id: "REQ-2023-005",
    title: "Servers for the data center",
    department: "IT",
    requestDate: "2023-10-25",
    requiredDate: "2023-11-25",
    priority: "Urgent",
    status: "Approved",
    total: 12500.0,
  },
  {
    id: "REQ-2023-006",
    title: "New office chairs",
    department: "Administration",
    requestDate: "2023-10-28",
    requiredDate: "2023-11-15",
    priority: "Low",
    status: "Pending",
    total: 1500.0,
  },
  {
    id: "REQ-2023-007",
    title: "Marketing campaign materials",
    department: "Marketing",
    requestDate: "2023-10-30",
    requiredDate: "2023-11-30",
    priority: "High",
    status: "In Checkout",
    total: 2500.0,
  },
  {
    id: "REQ-2023-008",
    title: "New laptops for the team",
    department: "IT",
    requestDate: "2023-11-01",
    requiredDate: "2023-11-15",
    priority: "Medium",
    status: "Pending",
    total: 7500.0,
  },
  {
    id: "REQ-2023-009",
    title: "Office renovation project",
    department: "Operations",
    requestDate: "2023-11-03",
    requiredDate: "2023-12-15",
    priority: "Urgent",
    status: "Approved",
    total: 18000.0,
  },
  {
    id: "REQ-2023-010",
    title: "New marketing software",
    department: "Marketing",
    requestDate: "2023-11-05",
    requiredDate: "2023-11-20",
    priority: "High",
    status: "Pending",
    total: 3200.0,
  },
  {
    id: "REQ-2023-011",
    title: "New servers for the data center",
    department: "IT",
    requestDate: "2023-11-08",
    requiredDate: "2023-11-30",
    priority: "Urgent",
    status: "In Checkout",
    total: 15000.0,
  },
  {
    id: "REQ-2023-012",
    title: "Office supplies for the new hires",
    department: "Administration",
    requestDate: "2023-11-10",
    requiredDate: "2023-11-30",
    priority: "Low",
    status: "Pending",
    total: 500.0,
  },
];

export default function ManageRequisitionsClient({ user }: { user: any }) {
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredRequisitions = exampleRequisitions.filter((req) => {
    const matchesFilter =
      filter === "All" || req.status.toLowerCase() === filter.toLowerCase();
    const matchesPriorityFilter =
      priorityFilter === "All" ||
      req.priority.toLowerCase() === priorityFilter.toLowerCase();
    const matchesDepartmentFilter =
      departmentFilter === "All" ||
      req.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch =
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());
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

  useEffect(() => {
    // Simulate loading time with a small delay to see the spinner
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [exampleRequisitions]);

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
      <h1 className="text-2xl font-bold mb-4">Manage Requisitions</h1>

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
            <p className="text-gray-500">Status:</p>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue>{filter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Checkout">In Checkout</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {/* select to filter by priority */}
            <p className="text-gray-500">Priority:</p>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue>{priorityFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            {/* select to filter by department only if the user is admin */}
            {user.role === "admin" && (
              <>
                <p className="text-gray-500">Department:</p>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue>{departmentFilter}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Administration">
                      Administration
                    </SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* Creation button aligned to the right */}
        <Link href="/requisitions/new-requisition">
          <Button className="gap-1">Add Requisition</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Title</TableHead>
              {user.role === "admin" && (
                <TableHead className="hidden md:table-cell">
                  Department
                </TableHead>
              )}
              <TableHead className="hidden lg:table-cell">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {req.requestDate}
                  </TableCell>
                  <TableCell>{req.title}</TableCell>
                  {user.role === "admin" && (
                    <TableCell className="hidden md:table-cell">
                      {req.department}
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
                    ${req.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No requisitions found matching the search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
