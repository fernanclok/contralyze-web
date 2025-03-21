"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-charts";
import { BudgetComparisonChart } from "./budget-comparison-chart";
import { ArrowUpIcon, UsersIcon, BuildingIcon, UserIcon } from "lucide-react";


export default function DashboardCharts({ Budgets } : {Budgets:any}) {

    if (!Budgets) return null;

  return (
    <>
      <div className="grid grid-cols-4 gap-4 pt-8 ">
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">All Budgets</CardTitle>
            <UsersIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{Budgets.budgets.total_budgets}</span>
              </div>
                <p className="text-sm text-gray-300 font-thin mt-2">All budgets from departments and categories.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Total budgets amount.</CardTitle>
            <BuildingIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{Budgets.budgets.total_budget_amount}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-thin mt-2">All budget expended.</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Active budgets</CardTitle>
            <UserIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{Budgets.budgets.total_active_budgets}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-thin mt-2">All active budgets today.</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Inactive budgets</CardTitle>
            <UserIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{Budgets.budgets.total_inactive_budgets}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-thin mt-2">Inactive budgets can be expired budgets.</p>
          </CardContent>
        </Card>
      </div>
        <Tabs defaultValue="budget" className="py-8">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="budget">Budget Comparison</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <p>Monthly revenue breakdown for the current fiscal year</p>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardContent className="pl-2">
                <BudgetComparisonChart Budgets={Budgets}/>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </>
  );
}

