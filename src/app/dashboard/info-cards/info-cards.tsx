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
  AlarmClock,
  EqualIcon as EqualApproximately,
  WalletMinimal,
  ShoppingCart,
} from "lucide-react"
import { useState, useEffect } from "react"
import Dibises from "./dibises"

// Función de paginación general
const usePagination = (data: any[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const selectedData = data.slice(startIndex, startIndex + itemsPerPage)

  return {
    currentPage,
    totalPages,
    selectedData,
    handleNextPage,
    handlePreviousPage,
  }
}

export default function InfoCards({Info}: {Info: any}) {
  const [progress, setProgress] = useState(0) // Estado para el progreso

  
    // parser target date 
    if (!Info.info) return null
    const target_date = new Date(Info.info.target_date)

    
    const target_date_formatted = target_date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    // Función para obtener el ícono dinámico según el estado
    const getStatusIcon = (status: string) => {
        switch (status) {
        case "increased":
            return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
        case "decreased":
            return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
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

  const recent_transactions = [
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$250.00",
      Status: "Denied",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$250.00",
      Status: "Denied",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$250.00",
      Status: "Denied",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Pending",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
    {
      Date: "2025-03-01",
      Description: "Grocery Shopping",
      Amount: "$150.00",
      Status: "Completed",
    },
  ]

  const activity = [
    {
      icon: "Activity",
      department: "Sales",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Completed",
    },
    {
      icon: "Activity",
      department: "Sales",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Denied",
    },
    {
      icon: "Activity",
      department: "Development",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Completed",
    },
    {
      icon: "Activity",
      department: "Sales",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      icon: "Activity",
      department: "Sales",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      icon: "Activity",
      department: "Sales",
      description: "Recent Activity",
      date: "2025-03-01",
      status: "Pending",
    },
  ]

// Simula un llenado dinámico
// useEffect(() => {
//     const interval = setInterval(() => {
//         setProgress((prevProgress) => {
//             if (prevProgress >= 100) {
//                 clearInterval(interval); // Detiene el intervalo cuando llega al 100%
//                 return 100;
//             }
//             return prevProgress + 10; // Incrementa el progreso en 10% cada vez
//         });
//     }, 1000); // Actualiza cada 1 segundo

//     return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
// }, []);
const {
    currentPage: transactionsPage,
    totalPages: transactionsTotalPages,
    selectedData: selectedTransactions,
    handleNextPage: handleNextTransactionsPage,
    handlePreviousPage: handlePreviousTransactionsPage,
  } = usePagination(recent_transactions, 9)
  
  const {
    currentPage: activityPage,
    totalPages: activityTotalPages,
    selectedData: selectedActivity,
    handleNextPage: handleNextActivityPage,
    handlePreviousPage: handlePreviousActivityPage,
  } = usePagination(activity, 3)
  
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
                <nav className="flex justify-center gap-2 items-center rounded-lg">
                    <div
                        className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                            Info.info.changes.emergency_fund.previous_status
                        )}`}
                        >
                        {getStatusIcon(Info.info.changes.emergency_fund.previous_status)}
                        <p className="text-sm font-semibold">
                            {Info.info.changes.emergency_fund.previous_status === "unchanged"
                            ? "Unchanged"
                            : `${Info.info.changes.emergency_fund.percentage} % ${Info.info.changes.emergency_fund.previous_status}`}
                        </p> {" "}
                        from last update.
                    </div>
                    <div
                        className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                            Info.info.changes.emergency_fund.status
                        )}`}
                        >
                        {getStatusIcon(Info.info.changes.emergency_fund.status)}
                        <p className="text-sm font-semibold">
                            {Info.info.changes.emergency_fund.status === "unchanged"
                            ? "Unchanged"
                            : `${Info.info.changes.emergency_fund.percentage} % ${Info.info.changes.emergency_fund.status}`}
                        </p> {" "}
                        from last update.
                    </div>
                </nav>
                <div className="w-ful rounded-full mt-2">
                <div className="flex justify-between items-center p-2">
                    <p className="text-gray-400 text-sm font-thin">Progress</p>
                    <p className="text-gray-500 font-bold text-base">{progress}%</p>
                </div>
                <div
                    className="bg-green-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
                </div>
                <p className="text-base text-gray-400 mt-2">
                <strong>${Info.info.emergency_fund}</strong> is 10% of total budget.
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
            <nav className="flex justify-center gap-2 items-center rounded-lg">
                <div
                        className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                            Info.info.changes.total_expenses.previous_status
                        )}`}
                        >
                {getStatusIcon(Info.info.changes.total_expenses.previous_status)}
                <p className="text-sm font-semibold">
                    {Info.info.changes.total_expenses.previous_status === "unchanged"
                    ? "Unchanged"
                    : `${Info.info.changes.total_expenses.percentage} % ${Info.info.changes.total_expenses.previous_status}`}
                </p> {" "}
                from last update.
                </div>
                <div
                    className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                        Info.info.changes.total_expenses.status
                    )}`}
                    >
                {getStatusIcon(Info.info.changes.total_expenses.status)}
                <p className="text-sm font-semibold">
                    {Info.info.changes.total_expenses.status === "unchanged"
                    ? "Unchanged"
                    : `${Info.info.changes.total_expenses.percentage} % ${Info.info.changes.total_expenses.status}`}
                </p> {" "}
                from last update.
                </div>
            </nav>
            <div className="w-ful rounded-full mt-2">
              <div className="flex justify-between items-center p-2">
                <p className="text-gray-400 text-sm font-thin">Progress</p>
                <p className="text-gray-500 font-bold text-base">{progress}%</p>
              </div>
              <div
                className="bg-yellow-500 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-base text-gray-400 mt-2">
              <strong>${Info.info.total_expenses}</strong> target
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
                        className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                            Info.info.changes.total_budget_amount.previous_status
                        )}`}
                        >
                        {getStatusIcon(Info.info.changes.total_budget_amount.previous_status)}
                        <p className="text-sm font-semibold">
                            {Info.info.changes.total_budget_amount.previous_status === "unchanged"
                            ? "Unchanged"
                            : `${Info.info.changes.total_budget_amount.percentage} % ${Info.info.changes.total_budget_amount.previous_status}`}
                        </p> {" "}
                        from last update.
                    </div>
                    <div
                        className={`flex justify-center gap-2 items-center p-2 my-3 rounded-lg ${getStatusColor(
                            Info.info.changes.total_budget_amount.status
                        )}`}
                        >
                        {getStatusIcon(Info.info.changes.total_budget_amount.status)}
                        <p className="text-sm font-semibold">
                            {Info.info.changes.total_budget_amount.status === "unchanged"
                            ? "Unchanged"
                            : `${Info.info.changes.total_budget_amount.percentage} % ${Info.info.changes.total_budget_amount.status}`}
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
              <strong>${Info.info.total_budget_amount}</strong> for Budgets
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
      <div className="grid grid-flow-col grid-rows-2 gap-4">
        <Card className="row-span-3 h-fit">
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2 px-12">
            <WalletMinimal className="h-5 w-5 font-blod text-gray-600" />
            <CardTitle className="text-2xl text-gray-600 font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="shadow-xl rounded-lg p-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTransactions.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{item.Date}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{item.Description}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{item.Amount}</td>
                      <td
                        className={`px-6 py-5 whitespace-nowrap text-sm ${item.Status === "Completed" ? "text-green-500" : item.Status === "Denied" ? "text-red-500" : "text-orange-300"}`}
                      >
                        {item.Status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePreviousTransactionsPage}
                  disabled={transactionsPage === 1}
                  className="px-4 py-2 text-gray-600 rounded disabled:opacity-50"
                  title="Previous Transactions"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextTransactionsPage}
                  disabled={transactionsPage === transactionsTotalPages}
                  className="px-4 py-2  text-gray-600 rounded disabled:opacity-50"
                  title="Next Transactions"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIBISES CARD */} 
        <Dibises />

        <Card className="col-span-2 row-span-2 h-fit">
          <CardHeader className="flex flex-row items-center  justify-start gap-4 pb-2">
            <div className="bg-blue-100/50 p-2 rounded-lg flex justify-center items-center gap-2">
              <UsersIcon className="h-4 w-4 text-black" />
              <CardTitle className="text-lg  font-semibold text-black">Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="shadow-xl rounded-lg p-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    ></th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedActivity.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <p
                          className={` flex justify-center items-center ${index % 2 === 0 ? "bg-green  -100" : " bg-blue-100"} p-2 rounded-lg`}
                        >
                          <ShoppingCart className={`h-5 w-5 text-gray-600`} />
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${item.status === "Completed" ? "text-green-100" : item.status === "Denied" ? "text-red-500" : "text-orange-300"}`}
                      >
                        <div
                          className={`p-1 rounded-xl flex justify-center items-center ${item.status === "Completed" ? "bg-green-100 text-green-700" : item.status === "Denied" ? "text-red-700 bg-red-100" : "text-yellow-600 bg-orange-100 "}`}
                        >
                          {item.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePreviousActivityPage}
                  disabled={activityPage === 1}
                  className="px-4 py-2 text-gray-600 rounded disabled:opacity-50"
                  title="Previous activity"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextActivityPage}
                  disabled={activityPage === activityTotalPages}
                  className="px-4 py-2  text-gray-600 rounded disabled:opacity-50"
                  title="Next Activity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

