import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

import { getSession } from "@/app/lib/session";

import { getRequisitions, getRequisitionDashboard } from "./actions";
import { getDepartments } from "@/app/manage-company/actions";

import RequisitionDashboard from "./requisitionDashboard";
import RequisitionList from "./requisitionList";

export default async function RequisitionsPage(
  props: {
    searchParams: Promise<{ tab?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  const user = session || null;
  const userRole = session?.role || "user";
  const userName = session
    ? `${session.userFirstName} ${session.userLastName}`.trim()
    : "Guest";

  const activeTab = searchParams.tab || "dashboard";

  //data from backend
  // requisitions
  const { requisitions, error: requisitionError } = await getRequisitions();

  const requisitionData = requisitions || [];

  //dashboard
  const { requisitionDashboard = {}, error: requisitionDashboardError } =
    await getRequisitionDashboard();

  const dashboardData =
    requisitionDashboard && typeof requisitionDashboard === "object"
      ? requisitionDashboard
      : {};

  //departments
  let departmentData = [];
  let departmentError = null;

  if (userRole === "admin") {
    const { departments = [], error } = await getDepartments();
    departmentData =
      Array.isArray(departments) && departments.length > 0 ? departments : [];
    departmentError = error;
  }

  //api errors
  const hasError = !!requisitionError || !!requisitionDashboardError || !!departmentError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold mb-4">Manage Requisitions</h1>

      {hasError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">
                Could not connect to the server.
                All creation and editing actions have been disabled.
              </p>
          </div>
        </div>
      )}

      <Tabs defaultValue={activeTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="list">All Requisitions</TabsTrigger>
          </TabsList>

          {hasError ? (
            <Button className="gap-1" disabled>
              Add Requisition
            </Button>
          ) : (
            <Link href="/requisitions/new-requisition">
              <Button className="gap-1">Add Requisition</Button>
            </Link>
          )}
        </div>
        <TabsContent value="dashboard" className="mt-0">
          <RequisitionDashboard
            requisitions={dashboardData.last_5_requisitions || []}
            dashboardData={dashboardData}
            user={user}
            hasError={hasError}
          />
        </TabsContent>
        <TabsContent value="list" className="mt-0">
          <RequisitionList
            requisitions={requisitionData}
            user={user}
            departments={departmentData}
          />
        </TabsContent>
      </Tabs>
    </AuthenticatedLayout>
  );
}
