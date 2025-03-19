"use client"

import { useState } from "react";
import DashboardCharts from "./charts/dashboard-charts";
import InfoCards from "./info-cards/info-cards";

export default function ClientDashboardPage({Budgets, user, Information} : {Budgets:any, user:any, Information:any}) {

    // get the last updated date
    const date = new Date();
    const lastUpdated = date.toDateString();
    // make the large date 

  return (
    <div className="flex bg-background pb-12 h-full">
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-full mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-md text-gray-400 bg-gray-100/50 rounded-lg p-2 font-semibold">Last update: {lastUpdated}</span>
            </div>
          </div>
                <InfoCards Info={Information}/>
                <DashboardCharts Budgets={Budgets}/>
        </div>
      </div>
    </div>
  );
}