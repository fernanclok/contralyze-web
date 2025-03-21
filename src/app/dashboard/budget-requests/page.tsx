import { BudgetRequestList } from '@/components/budget/BudgetRequestList';
import AuthenticatedLayout from "@/components/layouts/authenticatedLayout";
import { getSession } from "@/app/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Clock, XCircle, CheckCircle } from "lucide-react";
import { getBudgetRequests, getCategories, getDepartments } from '../budgets/actions';
import { CollapsibleRequestCharts } from '@/components/budget/CollapsibleRequestCharts';

export default async function BudgetRequestsPage() {
  const session = await getSession();
  const userRole = session?.role || "user";
  const userName = session ? `${session.userFirstName} ${session.userLastName}`.trim() : "Guest";
  
  // Obtener el ID del usuario actual para filtrar solicitudes
  const userId = session?.id;

  // Get real data from backend
  const { requests = [], error: requestsError } = await getBudgetRequests();
  const { categories = [], error: categoriesError } = await getCategories();
  const { departments = [], error: departmentsError } = await getDepartments();

  // Use real data or empty arrays if errors occurred
  const requestData = Array.isArray(requests) && requests.length > 0 ? requests : [];
  const categoryOptions = Array.isArray(categories) && categories.length > 0 ? categories : [];
  const departmentOptions = Array.isArray(departments) && departments.length > 0 ? departments : [];

  // Filter requests for the current user if not admin
  const filteredRequests = userRole === 'admin' 
    ? requestData 
    : requestData.filter(request => request.user_id === userId);
  
  // Summary calculations
  const pendingCount = filteredRequests.filter(req => req.status === 'pending').length;
  const approvedCount = filteredRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = filteredRequests.filter(req => req.status === 'rejected').length;
  const totalRequested = filteredRequests
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + parseFloat(req.requested_amount.toString()), 0);

  // Check for API errors
  const hasError = !!requestsError || !!categoriesError || !!departmentsError;

  return (
    <AuthenticatedLayout userRole={userRole} userName={userName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget Requests</h1>
          <p className="text-gray-500">
            {userRole === 'admin' 
              ? 'Manage all budget requests' 
              : 'View and manage your budget requests'}
          </p>
        </div>
        
        {/* Alerta de error si falla la conexión */}
        {hasError && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 mt-0.5" />
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
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <h3 className="text-2xl font-bold mt-1">{filteredRequests.length}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
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
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <h3 className="text-2xl font-bold mt-1">{approvedCount}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Approved</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRequested)}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sección de gráficos */}
        <CollapsibleRequestCharts 
          requests={filteredRequests}
          title="Request Analytics"
        />
        
        {/* Lista de solicitudes */}
        <Card>
          <CardContent className="p-6">
            <BudgetRequestList 
              requests={filteredRequests} 
              categories={categoryOptions}
              departments={departmentOptions}
              userRole={userRole} 
              hasConnectionError={hasError}
            />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
} 