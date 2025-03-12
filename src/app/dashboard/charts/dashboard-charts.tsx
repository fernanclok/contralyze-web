"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "./revenue-charts";
import { ExpensesChart } from "./expenses-chart";
import { BudgetComparisonChart } from "./budget-comparison-chart";
import { ArrowUpIcon, UsersIcon, BuildingIcon, UserIcon } from "lucide-react";

export default function DashboardCharts() {
  const [users, setUsers] = useState(0);
  const [departments, setDepartments] = useState(0);
  const [clients, setClients] = useState(0);

  useEffect(() => {
    // Simula la obtención de datos dinámicos
    setUsers(300);
    setDepartments(10);
    setClients(150);
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Active Users</CardTitle>
            <UsersIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{users}</span>
              </div>
                <p className="text-sm text-gray-300 font-thin mt-2">All users are using the app.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Departments</CardTitle>
            <BuildingIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{departments}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-thin mt-2">All departments have its budget.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-400 font-medium">Clients</CardTitle>
            <UserIcon className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="block justify-center items-center">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-black">+{clients}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-thin mt-2">All clients have contact info.</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budget">Budget Comparison</TabsTrigger>
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

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <p>Monthly expenses by category</p>
            </CardHeader>
            <CardContent className="pl-2">
              <ExpensesChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <p>Comparison of budgeted amounts against actual spending</p>
            </CardHeader>
            <CardContent className="pl-2">
              <BudgetComparisonChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

