"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  FileText,
  PieChart,
  ShoppingCart,
  XCircle,
} from "lucide-react";
// Example data to display in the table
// const exampleRequisitions = [
//   {
//     id: "REQ-2023-001",
//     title: "Computers for the sales department",
//     department: "Sales",
//     requestDate: "2023-10-15",
//     requiredDate: "2023-11-15",
//     priority: "High",
//     status: "Approved",
//     total: 4500.0,
//   },
//   {
//     id: "REQ-2023-002",
//     title: "Quarterly office supplies",
//     department: "Administration",
//     requestDate: "2023-10-18",
//     requiredDate: "2023-10-30",
//     priority: "Medium",
//     status: "Pending",
//     total: 850.75,
//   },
//   {
//     id: "REQ-2023-003",
//     title: "Graphic design software",
//     department: "Marketing",
//     requestDate: "2023-10-20",
//     requiredDate: "2023-11-05",
//     priority: "Low",
//     status: "In Checkout",
//     total: 1200.0,
//   },
//   {
//     id: "REQ-2023-004",
//     title: "Furniture for the meeting room",
//     department: "Operations",
//     requestDate: "2023-10-22",
//     requiredDate: "2023-12-01",
//     priority: "Medium",
//     status: "Rejected",
//     total: 3200.5,
//   },
//   {
//     id: "REQ-2023-005",
//     title: "Servers for the data center",
//     department: "IT",
//     requestDate: "2023-10-25",
//     requiredDate: "2023-11-25",
//     priority: "Urgent",
//     status: "Approved",
//     total: 12500.0,
//   },
//   {
//     id: "REQ-2023-006",
//     title: "New office chairs",
//     department: "Administration",
//     requestDate: "2023-10-28",
//     requiredDate: "2023-11-15",
//     priority: "Low",
//     status: "Pending",
//     total: 1500.0,
//   },
//   {
//     id: "REQ-2023-007",
//     title: "Marketing campaign materials",
//     department: "Marketing",
//     requestDate: "2023-10-30",
//     requiredDate: "2023-11-30",
//     priority: "High",
//     status: "In Checkout",
//     total: 2500.0,
//   },
//   {
//     id: "REQ-2023-008",
//     title: "New laptops for the team",
//     department: "IT",
//     requestDate: "2023-11-01",
//     requiredDate: "2023-11-15",
//     priority: "Medium",
//     status: "Pending",
//     total: 7500.0,
//   },
//   {
//     id: "REQ-2023-009",
//     title: "Office renovation project",
//     department: "Operations",
//     requestDate: "2023-11-03",
//     requiredDate: "2023-12-15",
//     priority: "Urgent",
//     status: "Approved",
//     total: 18000.0,
//   },
//   {
//     id: "REQ-2023-010",
//     title: "New marketing software",
//     department: "Marketing",
//     requestDate: "2023-11-05",
//     requiredDate: "2023-11-20",
//     priority: "High",
//     status: "Pending",
//     total: 3200.0,
//   },
//   {
//     id: "REQ-2023-011",
//     title: "New servers for the data center",
//     department: "IT",
//     requestDate: "2023-11-08",
//     requiredDate: "2023-11-30",
//     priority: "Urgent",
//     status: "In Checkout",
//     total: 15000.0,
//   },
//   {
//     id: "REQ-2023-012",
//     title: "Office supplies for the new hires",
//     department: "Administration",
//     requestDate: "2023-11-10",
//     requiredDate: "2023-11-30",
//     priority: "Low",
//     status: "Pending",
//     total: 500.0,
//   },
// ];

export default function RequisitionDashboard({
  requisitions,
  dashboardData,
  user,
  hasError,
}: {
  requisitions: any[];
  dashboardData: any;
  user: any;
  hasError: boolean;
}) {

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

  // Ordenar las requisiciones por fecha de creación en orden descendente
  const sortedRequisitions = requisitions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Tomar las primeras 5 requisiciones más recientes
  const recentRequisitions = sortedRequisitions.slice(0, 5);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Total Requisitions
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {dashboardData.total_month_requisitions}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardData.total_previous_month_requisitions > 0
                ? `+${(
                    ((dashboardData.total_month_requisitions -
                      dashboardData.total_previous_month_requisitions) /
                      dashboardData.total_previous_month_requisitions) *
                    100
                  ).toFixed(2)}% from last month`
                : "No data from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {dashboardData.pending_requisitions}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardData.pending_previous_month_requisitions > 0
                ? `+${(
                    ((dashboardData.pending_requisitions -
                      dashboardData.pending_previous_month_requisitions) /
                      dashboardData.pending_previous_month_requisitions) *
                    100
                  ).toFixed(2)}% from last month`
                : "No data from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Approved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {dashboardData.approved_requisitions}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardData.approved_previous_month_requisitions > 0
                ? `+${(
                    ((dashboardData.approved_requisitions -
                      dashboardData.approved_previous_month_requisitions) /
                      dashboardData.approved_previous_month_requisitions) *
                    100
                  ).toFixed(2)}% from last month`
                : "No data from last month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {dashboardData.rejected_requisitions}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardData.rejected_previous_month_requisitions > 0
                ? `+${(
                    ((dashboardData.rejected_requisitions -
                      dashboardData.rejected_previous_month_requisitions) /
                      dashboardData.rejected_previous_month_requisitions) *
                    100
                  ).toFixed(2)}% from last month`
                : "No data from last month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* requisitions per status */}
      <div className="gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-black">Requisitions by Status</CardTitle>
            <CardDescription className="text-gray-500">
              Distribution of requisition by their actual status
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center">
              <PieChart className="h-20 w-20 text-gray-300" />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">
                  aqui va un grafico de pastel con la distribucion de
                  requisiciones por status
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-black">Recent Requisitions</CardTitle>
          <CardDescription className="text-gray-500">
            Last 5 requisitions created in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequisitions.length > 0 ? (
            <div className="space-y-4">
              {recentRequisitions.map((req: any) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-black">
                        {req.requisition_uid}
                      </p>
                      <p className="text-sm text-gray-500">{req.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black">
                      ${req.total_amount}
                    </p>
                    <Badge className={`text-sm ${getStatusColor(req.status)}`}>
                      {req.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                No recent requisitions found.
              </p>
              {hasError ? (
                <Button className="gap-1" disabled>
                  Create New Requisition
                </Button>
              ) : (
                <Link href="/requisitions/new-requisition">
                  <Button className="gap-1">Create New Requisition</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
