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
    const target_date = new Date(Info.info.target_date)
    const target_date_formatted = target_date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })



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
  } = usePagination(activity, 4)
  
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium">
              <DollarSignIcon className="h-5 w-5 text-green-600 " />
            </CardTitle>
            <div className="flex justify-center gap-2 items-center bg-green-100 p-2 rounded-lg">
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
              <p className="text-green-700 text-sm font-semibold">Increase</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Emergency Fund</div>
            <p className="text-xs text-gray-400">
              <span className="text-emerald-500 font-medium inline-flex items-center">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                +3 %
              </span>{" "}
              from last month
            </p>
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
              <strong>${Info.info.emergency_fund}</strong> 10% of total budget.
            </p>
            <div className="flex justify-start gap-2 items-center mt-3">
              <CalendarDays className="text-gray-400 w-4 h-4" />
              <p className="text-gray-400 text-sm ">
                <strong>Target</strong> {target_date_formatted}
              </p>
            </div>
          </CardContent>
          <div className="w-full p-1 rounded-b-xl bg-green-500 hover:bg-green-700 group transition-all duration-300 ease-in-out">
            <button className="text-white w-full font-thin text-sm transition-all duration-400 ease-in-out gap-2 hover:translate-x-2 flex justify-center items-center">
              View Details
              <ArrowDownIcon className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300 ease-in-out" />
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium">
              <TrendingDownIcon className="h-4 w-4 text-orange-600 " />
            </CardTitle>
            <div className="flex justify-center gap-2 items-center bg-orange-100/50 p-2 rounded-lg">
              <ArrowDownIcon className="h-4 w-4 text-orange-600" />
              <p className="text-orange-700 text-sm font-semibold">Decreased</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Expenses</div>
            <p className="text-xs text-gray-400">
              <span className="text-rose-500 font-medium inline-flex items-center">
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                -4.5%
              </span>{" "}
              from last month
            </p>
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
          <div className="w-full p-1 rounded-b-xl bg-yellow-500 hover:bg-yellow-700 group transition-all duration-300 ease-in-out">
            <button className="text-white w-full font-thin text-sm transition-all duration-400 ease-in-out gap-2 hover:translate-x-2 flex justify-center items-center">
              View Details
              <ArrowDownIcon className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300 ease-in-out" />
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex justify-center items-center text-sm font-medium">
              <PercentIcon className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <div className="flex justify-center gap-2 items-center bg-blue-100/50 p-2 rounded-lg">
              <AlarmClock className="h-4 w-4 text-blue-600" />
              <p className="text-blue-700 text-sm font-semibold">It remains</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">Budgets</div>
            <p className="text-xs text-gray-400">
              <span className="text-blue-500 font-medium inline-flex items-center">
                <EqualApproximately className="mr-1 h-3 w-3" />
                3.5%
              </span>{" "}
              for a month
            </p>
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
          <div className="w-full p-1 rounded-b-xl bg-blue-500 hover:bg-blue-700 group transition-all duration-300 ease-in-out">
            <button className="text-white w-full font-thin text-sm transition-all duration-400 ease-in-out gap-2 hover:translate-x-2 flex justify-center items-center">
              View Details
              <ArrowDownIcon className="w-5 h-5 group-hover:-rotate-90 transition-transform duration-300 ease-in-out" />
            </button>
          </div>
        </Card>
      </div>
      <div className="grid grid-flow-col grid-rows-3 gap-4">
        <Card className="row-span-3 h-fit">
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <WalletMinimal className="h-5 w-5 font-blod text-gray-600" />
            <CardTitle className="text-2xl text-gray-800 font-bold">Recent Transactions</CardTitle>
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
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={handleNextTransactionsPage}
                  disabled={transactionsPage === transactionsTotalPages}
                  className="px-4 py-2  text-gray-600 rounded disabled:opacity-50"
                  title="Next Transactions"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIBISES CARD */} 
        <Dibises />

        <Card className="col-span-2 row-span-2 h-fit">
          <CardHeader className="flex flex-row items-center  justify-start gap-4 pb-2">
            <div className="bg-blue-500 p-2 rounded-lg flex justify-center items-center gap-2">
              <UsersIcon className="h-5 w-5 text-gray-100" />
              <CardTitle className="text-xl font-semibold text-white">Accounts</CardTitle>
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
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={handleNextActivityPage}
                  disabled={activityPage === activityTotalPages}
                  className="px-4 py-2  text-gray-600 rounded disabled:opacity-50"
                  title="Next Activity"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

