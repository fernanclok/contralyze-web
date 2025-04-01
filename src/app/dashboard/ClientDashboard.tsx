"use client"

import { AlertCircle } from "lucide-react";
import DashboardCharts from "./charts/dashboard-charts";
import InfoCards from "./info-cards/info-cards";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientDashboardPage(
    {
      Budgets,
      user, 
      Information, 
      Transaction, 
      AvailableYears, 
      DeptoData,
      TransactionsList,
      TransactionsDepto
    }
   :
     {
      Budgets:any, 
      user:any, 
      Information:any, 
      Transaction:any, 
      AvailableYears:any, 
      DeptoData:any,
      TransactionsList:any,
      TransactionsDepto:any
    }) {

  const hasError =
  !Budgets || !Information || !Transaction || !AvailableYears  ;


    // get the last updated date
    const date = new Date();
    const lastUpdated = date.toDateString();
    // make the large date 
  return (
    <div className="flex bg-background pb-12 h-full">
      <div className="flex-1">
        <div className="space-y-8 p-6"> 
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 bg-gray-100/50 rounded-lg p-2 font-semibold">
                Last update: {lastUpdated}
              </span>
            </div>
          </div>

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

          {/* Mostrar contenido solo si no hay errores */}
          {!hasError && (
                <DashboardCharts
                  Budgets={Budgets}
                  transaction={Transaction}
                  years={AvailableYears}
                  Info={Information} 
                  DeptoData={DeptoData}
                  TransactionsList={TransactionsList}
                  TransactionsDepto={TransactionsDepto}
                />
          )}
        </div>
      </div>
    </div>
  );
}