"use client";

import { useEffect, useState } from "react";
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
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  getRequisitionsDashboardFromDB,
  saveRequisitionsDashboardToDB,
} from "@/app/utils/indexedDB";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RequisitionDashboard({
  dashboardData,
  user,
  hasError,
}: {
  dashboardData: any;
  user: any;
  hasError: boolean;
}) {
  const [localRequisitionsDashboard, setLocalRequisitionsDashboard] = useState(
    dashboardData && typeof dashboardData === "object" ? dashboardData : {}
  );

  useEffect(() => {
    if (
      !dashboardData ||
      (Array.isArray(dashboardData) && dashboardData.length === 0)
    ) {
      if (typeof window !== "undefined" && window.indexedDB) {
        getRequisitionsDashboardFromDB()
          .then((requisitionsFromDB) => {
            if (requisitionsFromDB) {
              setLocalRequisitionsDashboard(requisitionsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error retrieving requisition from IndexedDB", error);
          });
      }
    } else {
      setLocalRequisitionsDashboard(dashboardData);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData && typeof window !== "undefined" && window.indexedDB) {
      saveRequisitionsDashboardToDB(dashboardData).catch((error) => {
        console.error("Error saving requisitions to IndexedDB:", error);
      });
    }
  }, [dashboardData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pieData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Requisitions by Status",
        data: [
          localRequisitionsDashboard.pending_requisitions,
          localRequisitionsDashboard.approved_requisitions,
          localRequisitionsDashboard.rejected_requisitions,
        ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const hasPieData = pieData.datasets[0].data.some((value) => value > 0);

  console.log(localRequisitionsDashboard)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              Total Requisitions
            </CardTitle>
            <FileText className="h-4 w-4 bg-gray-100 text-gray-800 rounded-full border" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {localRequisitionsDashboard.total_month_requisitions || 0}
            </div>
            <p className="text-xs text-gray-500">
              {localRequisitionsDashboard.total_previous_month_requisitions > 0
                ? `+${(
                    ((localRequisitionsDashboard.total_month_requisitions -
                      localRequisitionsDashboard.total_previous_month_requisitions) /
                      localRequisitionsDashboard.total_previous_month_requisitions) *
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
            <Clock className="h-4 w-4 bg-yellow-100 text-yellow-800 rounded-full border" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {localRequisitionsDashboard.pending_requisitions || 0}
            </div>
            <p className="text-xs text-gray-500">
              {localRequisitionsDashboard.pending_previous_month_requisitions >
              0
                ? `+${(
                    ((localRequisitionsDashboard.pending_requisitions -
                      localRequisitionsDashboard.pending_previous_month_requisitions) /
                      localRequisitionsDashboard.pending_previous_month_requisitions) *
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
            <CheckCircle2 className="h-4 w-4 bg-green-100 text-green-800 rounded-full border" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {localRequisitionsDashboard.approved_requisitions || 0}
            </div>
            <p className="text-xs text-gray-500">
              {localRequisitionsDashboard.approved_previous_month_requisitions >
              0
                ? `+${(
                    ((localRequisitionsDashboard.approved_requisitions -
                      localRequisitionsDashboard.approved_previous_month_requisitions) /
                      localRequisitionsDashboard.approved_previous_month_requisitions) *
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
            <XCircle className="h-4 w-4 bg-red-100 text-red-800 rounded-full border" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {localRequisitionsDashboard.rejected_requisitions || 0}
            </div>
            <p className="text-xs text-gray-500">
              {localRequisitionsDashboard.rejected_previous_month_requisitions >
              0
                ? `+${(
                    ((localRequisitionsDashboard.rejected_requisitions -
                      localRequisitionsDashboard.rejected_previous_month_requisitions) /
                      localRequisitionsDashboard.rejected_previous_month_requisitions) *
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
              <div className="ml-4">
                {hasPieData ? (
                  <div>
                    <Pie data={pieData} />
                  </div>
                ) : (
                  <p className="text-gray-500">No data to show</p>
                )}
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
          {Array.isArray(localRequisitionsDashboard.last_5_requisitions) &&
          localRequisitionsDashboard.last_5_requisitions.length > 0 ? (
            <div className="space-y-4">
              {localRequisitionsDashboard.last_5_requisitions.map(
                (req: any) => (
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
                      <Badge
                        className={`text-sm ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                )
              )}
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
