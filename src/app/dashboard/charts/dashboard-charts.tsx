"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-charts";
import { BudgetComparisonChart } from "./budget-comparison-chart";
import { ArrowUpIcon, UsersIcon, BuildingIcon, UserIcon, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import InfoCards from "../info-cards/info-cards";
import Lists from "../info-cards/Lists";
import { Button } from "@/components/ui/button";


export default function DashboardCharts({ Budgets, transaction, years, Info, DeptoData, TransactionsList,TransactionsDepto  } : {Budgets:any, transaction:any, years:any, Info:any, DeptoData:any,TransactionsList:any, TransactionsDepto:any}) {
  // Verificar si hay errores en los datos
  const hasError =
    !Budgets || !transaction || !years
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };


  return (
    <>
     {/* Mostrar mensaje de error si hay problemas */}
     {hasError && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">
              Could not load the data. Please check your connection or try again later.
            </p>
          </div>
        </div>
      )}

      {!hasError && (
        <>
          {/* Info cards */}
            <InfoCards Info={Info} />
           {/* SubInfoCards */}
           <div className="grid grid-cols-4 gap-4 pt-8 ">
            <Card className="p-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600 font-medium">All Budgets</CardTitle>
                <UsersIcon className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="block justify-center items-center">
                  <div className="flex items-center justify-center">
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold text-black">+{Budgets.total_budgets}</span>
                  </div>
                    <p className="text-sm text-gray-400 font-thin mt-2">All budgets from departments and categories.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600 font-medium">Total budgets amount.</CardTitle>
                <BuildingIcon className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="block justify-center items-center">
                  <div className="flex items-center justify-center">
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold text-black">+{Budgets.total_budget_amount}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-thin mt-2">All budget expended.</p>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600 font-medium">Active budgets</CardTitle>
                <UserIcon className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="block justify-center items-center">
                  <div className="flex items-center justify-center">
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold text-black">+{Budgets.total_active_budgets}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-thin mt-2">All active budgets today.</p>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-gray-600 font-medium">Inactive budgets</CardTitle>
                <UserIcon className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="block justify-center items-center">
                  <div className="flex items-center justify-center">
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold text-black">+{Budgets.total_inactive_budgets}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-thin mt-2">Inactive budgets can be expired budgets.</p>
              </CardContent>
            </Card>
          </div>
          

          {/* Tabs */}
            <Tabs defaultValue="budget" className="py-8 bg-white rounded-lg shadow-lg p-8 border border-gray-100">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="budget">Budget Comparison</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
                  <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExpanded}
                  aria-label={isExpanded ? "Collapse charts" : "Expand charts"}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">Hide Charts</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      <span className="text-sm">Show Charts</span>
                    </>
                  )}
                </Button>
              </div>
            {isExpanded && (
             <>
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardContent className="pl-2">
                    <RevenueChart transaction={transaction} Year={years}/>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="budget" className="space-y-4">
                <Card>
                  <CardContent className="pl-2">
                    <BudgetComparisonChart Budgets={Budgets} DeptoData={DeptoData} />
                  </CardContent>
                </Card>
              </TabsContent>
              </>
            )}
            </Tabs>
            {/* lists */}
              <Lists  TransactionsList={TransactionsList} Activity={TransactionsDepto}/>
        </>
        )}
    </>
  );
}

