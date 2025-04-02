"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  PercentIcon,
  TrendingDownIcon,
  UsersIcon,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  EqualIcon as EqualApproximately,
  WalletMinimal,
  ShoppingCart,
} from "lucide-react"
import { useState, useEffect } from "react"
import Dibises from "./dibises"


export default function InfoCards({Info}: {Info: any}) {
  const [progress, setProgress] = useState(0); // Progreso dinámico para budgets
  const [progressBudgets, setProgressBudgets] = useState(0); // Progreso dinámico para budgets
  const [progressExpenses, setProgressExpenses] = useState(0); // Progreso dinámico para expenses

  // Normalizar los datos de Info para manejar ambos casos
  const infoData = Array.isArray(Info) && Info.length > 0 ? Info[0] : Info;

    // Verificar si hay errores en los datos originales
    const errors: string[] = [];
    if (!infoData) errors.push("infoData object is missing.");
    if (!infoData?.changes) errors.push("Changes data is missing.");
    if (infoData?.emergency_fund == null) errors.push("Emergency fund data is missing.");
    if (infoData?.total_budget_amount == null) errors.push("Total budget amount data is missing.");
    if (infoData?.total_expenses == null) errors.push("Total expenses data is missing.");

    const target_date = new Date(infoData.target_date)

    
    const target_date_formatted = target_date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    // Función para obtener el ícono dinámico según el estado
    const getStatusIcon = (status: string) => {
        switch (status) {
        case "increased":
            return <ArrowUpIcon className="h-5 w-5 text-green-600" />;
        case "decreased":
            return <ArrowDownIcon className="h-5 w-5 text-red-600" />;
        default:
            return null;
        }
    };

    // Función para obtener el color de fondo según el estado
    const getStatusColor = (status: string) => {
        switch (status) {
        case "increased":
            return "bg-green-100 text-green-700";
        case "decreased":
            return "bg-red-100 text-red-700";
        case "unchanged":
            return "bg-gray-100 text-gray-700";
        default:
            return "";
        }
    };

  // Función para calcular el porcentaje dinámico
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0; // Evitar división por cero
    return Math.min((value / total) * 100, 100); // Limitar el porcentaje a un máximo de 100%
  };

  // useEffect para calcular los porcentajes dinámicos
  useEffect(() => {
    if (infoData) {
      // Calcular el porcentaje para budgets
      const totalBudgets = infoData.total_budget_amount || 0; // Total de budgets
      const currentBudgets = infoData.changes.total_budget_amount?.current || 0; // Valor actual de budgets
      setProgressBudgets(calculatePercentage(currentBudgets, totalBudgets));

      // Calcular el porcentaje para expenses
      const totalExpenses = infoData.total_expenses || 0; // Total de expenses
      const currentExpenses = infoData.changes.total_expenses?.current || 0; // Valor actual de expenses
      setProgressExpenses(calculatePercentage(currentExpenses, totalExpenses));
    }
  }, [infoData]);
  
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
        {/* Emergency fund */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium w-fit bg-green-200/50 p-2 rounded-lg ">
              <DollarSignIcon className="h-4 w-4 text-black  " />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Emergency Fund</div>
                <nav className="flex justify-center gap-2 items-center rounded-lg w-full">
                    <div
                        className={`flex justify-center gap-2 items-center text-xs p-2 my-3 rounded-lg w-full ${getStatusColor(
                            infoData.changes.emergency_fund.previous_status
                        )}`}
                        >
                        {getStatusIcon(infoData.changes.emergency_fund.previous_status)}
                        <p className="text-sm font-semibold">
                            {infoData.changes.emergency_fund.previous_status === "unchanged"
                            ? "Unchanged"
                            : `${infoData.changes.emergency_fund.percentage} % `}
                        </p> {" "}
                        from last update.
                    </div>
                    <div
                        className={`flex justify-center gap-2 items-center p-2 text-xs my-3 rounded-lg w-full ${getStatusColor(
                            infoData.changes.emergency_fund.status
                        )}`}
                        >
                        {getStatusIcon(infoData.changes.emergency_fund.status)}
                        <p className="text-sm font-semibold">
                            {infoData.changes.emergency_fund.status === "unchanged"
                            ? "Unchanged"
                            : `${infoData.changes.emergency_fund.percentage} % ${infoData.changes.emergency_fund.status}`}
                        </p> {" "}
                        from last update.
                    </div>
                </nav>
                <div className="w-ful rounded-full mt-2">
                <div className="flex justify-between items-center p-2">
                    <p className="text-gray-400 text-sm font-thin">Progress</p>
                    <p className="text-gray-500 font-bold text-base">{Math.min((infoData.emergency_fund / (infoData.total_budget_amount * 0.1)) * 100, 100).toFixed(2)}%</p>
                </div>
                <div
                    className="bg-green-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((infoData.emergency_fund / (infoData.total_budget_amount * 0.1)) * 100, 100).toFixed(2)}%`,
                    }}
                ></div>
                </div>
                <p className="text-base text-gray-400 mt-2">
                <strong>${infoData.emergency_fund}</strong> is  {((infoData.emergency_fund / infoData.total_budget_amount) * 100).toFixed(2)}% of total budget.
                </p>
                <p className="text-sm text-gray-500">
                (${(infoData.total_budget_amount * 0.1).toFixed(2)}). This bar shows how much of the goal has been achieved.
                </p>
                <div className="flex justify-start gap-2 items-center mt-3">
                <CalendarDays className="text-gray-400 w-4 h-4" />
                <p className="text-gray-400 text-sm ">
                    <strong>Target</strong> {target_date_formatted}
                </p>`
            </div>
          </CardContent>
         
        </Card>
        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium w-fit bg-orange-100/50 p-2 rounded-lg ">
              <TrendingDownIcon className="h-4 w-4 text-black " />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Expenses</div>
            <nav className="flex justify-center gap-2 items-center rounded-lg w-full">
                <div
                        className={`flex justify-center text-xs gap-2 items-center p-2 my-3 rounded-lg w-full ${getStatusColor(
                            infoData.changes.total_expenses.previous_status
                        )}`}
                        >
                {getStatusIcon(infoData.changes.total_expenses.previous_status)}
                <p className="text-sm font-semibold">
                    {infoData.changes.total_expenses.previous_status === "unchanged"
                    ? "Unchanged"
                    : `${infoData.changes.total_expenses.percentage} %`}
                </p> {" "}
                from last update.
                </div>
                <div
                    className={`flex justify-center gap-2 items-center text-xs p-2 my-3 rounded-lg w-full ${getStatusColor(
                        infoData.changes.total_expenses.status
                    )}`}
                    >
                {getStatusIcon(infoData.changes.total_expenses.status)}
                <p className="text-sm font-semibold">
                    {infoData.changes.total_expenses.status === "unchanged"
                    ? "Unchanged"
                    : `${infoData.changes.total_expenses.percentage} % ${infoData.changes.total_expenses.status}`}
                </p> {" "}
                from last update.
                </div>
            </nav>
            <div className="w-ful rounded-full mt-2">
              <div className="flex justify-between items-center p-2">
                <p className="text-gray-400 text-sm font-thin">Progress</p>
                <p className="text-gray-500 font-bold text-base">
                  {Math.min((infoData.total_expenses / infoData.total_budget_amount) * 100, 100).toFixed(2)}%
                </p>
              </div>
              <div
                className="bg-yellow-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((infoData.total_expenses / infoData.total_budget_amount) * 100, 100).toFixed(2)}%`,
                }}
              ></div>
            </div>
            <p className="text-base text-gray-400 mt-2">
              <strong>${infoData.total_expenses}</strong> is {((infoData.total_expenses / infoData.total_budget_amount) * 100).toFixed(2)}% of the total budget.
            </p>
            <p className="text-sm text-gray-500">
              (${infoData.total_budget_amount.toFixed(2)}). This bar shows how much of the total budget has been spent.
            </p>
            <div className="flex justify-start gap-2 items-center mt-3">
              <CalendarDays className="text-gray-400 w-4 h-4" />
              <p className="text-gray-400 text-sm ">
                <strong>Target</strong> {target_date_formatted}
              </p>
            </div>
          </CardContent>
          
        </Card>
        {/* Budgets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium w-fit bg-green-200/50 p-2 rounded-lg ">
              <DollarSignIcon className="h-4 w-4 text-black  " />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Budgets</div>
                <nav className="flex justify-center gap-2 items-center rounded-lg">
                    <div
                        className={`flex justify-center gap-2 items-center text-xs p-2 my-3 rounded-lg w-full ${getStatusColor(
                            infoData.changes.total_budget_amount.previous_status
                        )}`}
                        >
                        {getStatusIcon(infoData.changes.total_budget_amount.previous_status)}
                        <p className="text-sm font-semibold">
                            {infoData.changes.total_budget_amount.previous_status === "unchanged"
                            ? "Unchanged"
                            : `${infoData.changes.total_budget_amount.percentage} %`}
                        </p> {" "}
                        from last update.
                    </div>
                    <div
                        className={`flex justify-center gap-2 items-center p-2 my-3 text-xs w-full rounded-lg ${getStatusColor(
                            infoData.changes.total_budget_amount.status
                        )}`}
                        >
                        {getStatusIcon(infoData.changes.total_budget_amount.status)}
                        <p className="text-sm font-semibold">
                            {infoData.changes.total_budget_amount.status === "unchanged"
                            ? "Unchanged"
                            : `${infoData.changes.total_budget_amount.percentage} % ${infoData.changes.total_budget_amount.status}`}
                        </p> {" "}
                        from last update.
                    </div>
                </nav>
            <div className="w-full rounded-full mt-2">
              <div className="flex justify-between items-center p-2">
                <p className="text-gray-400 text-sm font-thin">Progress</p>
                <p className="text-gray-500 font-bold text-base">{progress}%</p>
              </div>
              <div
                className="bg-blue-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-base text-gray-400 mt-2">
              <strong>${infoData.total_budget_amount}</strong> for Budgets
            </p>
            <div className="flex justify-start gap-2 items-center mt-3">
              <CalendarDays className="text-gray-400 w-4 h-4" />
              <p className="text-gray-400 text-sm ">
                <strong>Target</strong> {target_date_formatted}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </>
  )
}

