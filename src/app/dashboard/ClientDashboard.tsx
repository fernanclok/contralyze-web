"use client"

import { useState } from "react";
import DashboardCharts from "./charts/dashboard-charts";
import InfoCards from "./info-cards/info-cards";

export default function ClientDashboardPage({Budgets,user, Information} : {Budgets:any,user:any,Information:any}) {

  const [activeTab, setActiveTab] = useState("transactions");
  return (
    <div className="flex min-h-screen bg-background pb-12">
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last updated: March 5, 2025</span>
            </div>
          </div>

            <nav className="flex items-center p-3 rounded-lg shadow-md border border-gray-200 w-fit bg-white">
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-l-md ${
                    activeTab === "transactions"
                        ? "bg-green-100 text-green-600 shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("transactions")}
                >
                    Transactions & Budgets
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-r-md ${
                    activeTab === "performance"
                        ? "bg-green-100 text-green-600 shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("performance")}
                >
                    Performance Analytics
                </button>
            </nav>


          {activeTab === "transactions" ? <InfoCards Info={ Information}/> : <DashboardCharts Budgets={Budgets}/>}
        </div>
      </div>
    </div>
  );
}