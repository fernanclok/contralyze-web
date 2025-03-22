import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetList } from "@/components/budget/BudgetList";
import { BudgetRequestList } from "@/components/budget/BudgetRequestList";
import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";
import { ArrowUpCircle, ArrowDownCircle, Clock, CreditCard, AlertCircle } from "lucide-react";
import { getBudgets, getBudgetRequests, getCategories, getDepartments } from './actions';
import { CollapsibleCharts } from '@/components/budget/CollapsibleCharts';

export default async function BudgetsPage() {
  const session = await getSession();
  const userRole = session?.role || "user";
  const userName = session ? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  const userDepartmentId = session?.departmentId;
  console.log('Page userDepartmentId:', userDepartmentId);

  // Get real data from backend
  const { budgets = [], error: budgetsError } = await getBudgets();
  const { requests = [], error: requestsError } = await getBudgetRequests();
  const { categories = [], error: categoriesError } = await getCategories();
  const { departments = [], error: departmentsError } = await getDepartments();

  // Use real data or empty arrays if errors occurred
  const budgetData =
    Array.isArray(budgets) && budgets.length > 0 ? budgets : [];
  const requestData =
    Array.isArray(requests) && requests.length > 0 ? requests : [];
  const categoryOptions =
    Array.isArray(categories) && categories.length > 0 ? categories : [];
  const departmentOptions =
    Array.isArray(departments) && departments.length > 0 ? departments : [];

  // Filter only active budgets for total calculation
  const activeBudgets = budgetData.filter(
    (budget) => budget.status === "active"
  );

  // Summary calculations
  const totalBudget = activeBudgets.reduce(
    (sum, budget) => sum + parseFloat(budget.max_amount.toString()),
    0
  );
  const totalApproved = requestData
    .filter((req) => req.status === "approved")
    .reduce((sum, req) => sum + parseFloat(req.requested_amount.toString()), 0);
  const totalAvailable = Math.max(0, totalBudget - totalApproved);
  const pendingRequests = requestData.filter(
    (req) => req.status === "pending"
  ).length;
  const approvedRequests = requestData.filter(
    (req) => req.status === "approved"
  ).length;

  // Check for API errors
  const hasError =
    !!budgetsError ||
    !!requestsError ||
    !!categoriesError ||
    !!departmentsError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <h1 className="text-2xl font-bold mb-4">Budget Management</h1>
      {/* <p className="text-gray-500">Manage budgets and requests by department</p> */}

      <div className="space-y-8">
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

        {/* Dashboard Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Available Budget
              </CardTitle>
              <CreditCard className="h-4 w-4 bg-blue-100 text-blue-800 rounded-full border" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-black">
                    {formatCurrency(totalAvailable)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-500">
                      Total allocated: {formatCurrency(totalBudget)}
                    </p>
                    {totalApproved > 0 && (
                      <p className="text-xs text-green-600">
                        Total approved: {formatCurrency(totalApproved)}
                      </p>
                    )}
                  </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Approved Requests
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 bg-green-100 text-green-800 rounded-full border" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-black">
                    {approvedRequests}
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 bg-amber-100 text-amber-800 rounded-full border" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-black">
                  {pendingRequests}
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-black">
                Total Requested
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 bg-purple-100 text-purple-800 rounded-full border" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-black">
                    {formatCurrency(totalBudget)}
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de gráficos colapsables */}
        <CollapsibleCharts
          budgets={budgetData}
          requests={requestData}
          title="Budget Analytics"
        />

        {/* Tabs section */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="budgets" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:w-auto">
                <TabsTrigger value="budgets">Budgets</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="budgets" className="mt-0">
                <BudgetList
                  budgets={budgetData}
                  categories={categoryOptions}
                  departments={departmentOptions}
                  userRole={userRole}
                  hasConnectionError={hasError}
                  requests={requestData}
                  userDepartmentId={userDepartmentId}
                />
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                <BudgetRequestList
                  requests={requestData}
                  categories={categoryOptions}
                  departments={departmentOptions}
                  userRole={userRole}
                  hasConnectionError={hasError}
                  userDepartmentId={userDepartmentId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
