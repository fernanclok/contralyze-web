import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BudgetList } from '@/components/budget/BudgetList';
import { BudgetRequestList } from '@/components/budget/BudgetRequestList';
import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Clock, CreditCard, AlertCircle } from "lucide-react";
import { getBudgets, getBudgetRequests, getCategories } from './actions';

export default async function BudgetsPage() {
  const session = await getSession();
  const userRole = session?.role || "user";
  const userName = session ? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";

  // Get real data from backend
  const { budgets = [], error: budgetsError } = await getBudgets();
  const { requests = [], error: requestsError } = await getBudgetRequests();
  const { categories = [], error: categoriesError } = await getCategories();

  // Console logs for debugging
  console.log("Budgets received:", budgets);
  console.log("Requests received:", requests);
  console.log("Categories received:", categories);
  
  // Check data structure for troubleshooting
  if (requests && Array.isArray(requests)) {
    console.log("Number of requests:", requests.length);
    if (requests.length > 0) {
      console.log("Example structure of first request:", 
        JSON.stringify(requests[0], null, 2));
    }
  } else {
    console.log("Requests are not an array or are empty:", requests);
  }

  // Use real data or empty arrays if errors occurred
  const budgetData = Array.isArray(budgets) && budgets.length > 0 ? budgets : [];
  const requestData = Array.isArray(requests) && requests.length > 0 ? requests : [];
  const categoryOptions = Array.isArray(categories) && categories.length > 0 ? categories : [];

  // Filter only active budgets for total calculation
  const activeBudgets = budgetData.filter(budget => budget.status === 'active');
  console.log("Active budgets for total calculation:", activeBudgets.length);
  
  // Summary calculations
  const totalBudget = activeBudgets.reduce((sum, budget) => sum + parseFloat(budget.max_amount.toString()), 0);
  const totalRequested = requestData.reduce((sum, req) => sum + parseFloat(req.requested_amount.toString()), 0);
  const pendingRequests = requestData.filter(req => req.status === 'pending').length;
  const approvedRequests = requestData.filter(req => req.status === 'approved').length;

  // Check for API errors
  const hasError = budgetsError || requestsError || categoriesError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget Management</h1>
          <p className="text-gray-500">Manage budgets and requests by department</p>
        </div>
        
        {hasError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">
                Could not connect to the server. Using demo data temporarily.
              </p>
            </div>
          </div>
        )}
        
        {/* Dashboard Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Budget Total</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalBudget)}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeBudgets.length} active budget{activeBudgets.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved Requests</p>
                  <h3 className="text-2xl font-bold mt-1">{approvedRequests}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <ArrowUpCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingRequests}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Requested</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRequested)}</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <ArrowDownCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
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
                  userRole={userRole}
                />
              </TabsContent>
              
              <TabsContent value="requests" className="mt-0">
                <BudgetRequestList 
                  requests={requestData} 
                  categories={categoryOptions}
                  userRole={userRole} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
