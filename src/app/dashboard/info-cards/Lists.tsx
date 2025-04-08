"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, ChevronLeft, ChevronRight, CalendarDays, WalletMinimal, ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import Dibises from "./dibises"
import Link from "next/link"
import SideModal from "./SideModal"
import { Badge } from "@/components/ui/badge"

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

export default function Lists({ TransactionsList, Activity }: { TransactionsList: any; Activity: any }) {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null) // Estado para la transacción seleccionada
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para controlar el modal

  // Normalizar TransactionsList para manejar ambos casos
  const normalizeData = (data: any) => {
    if (Array.isArray(data)) {
      // Si es un array con un único objeto, verifica si ese objeto tiene propiedades numeradas
      if (data.length === 1 && typeof data[0] === "object" && !Array.isArray(data[0])) {
        return Object.values(data[0]).filter((item) => typeof item === "object");
      }
      // Si ya es un array plano, úsalo directamente
      return data;
    } else if (typeof data === "object" && data !== null) {
      // Si es un objeto con índices numéricos, conviértelo en un array
      return Object.values(data).filter((item) => typeof item === "object");
    }
    return []; // Si no es un formato válido, devuelve un array vacío
  };

  const recent_transactions = normalizeData(TransactionsList);
  const activity = normalizeData(Activity);

  const handleOpenModal = (transaction: any) => {
    setSelectedTransaction(transaction) // Establece la transacción seleccionada
    setIsModalOpen(true) // Abre el modal
  }

  const handleCloseModal = () => {
    setSelectedTransaction(null) // Limpia la transacción seleccionada
    setIsModalOpen(false) // Cierra el modal
  }

  const {
    currentPage: transactionsPage,
    totalPages: transactionsTotalPages,
    selectedData: selectedTransactions,
    handleNextPage: handleNextTransactionsPage,
    handlePreviousPage: handlePreviousTransactionsPage,
  } = usePagination(recent_transactions, 10);

  const {
    currentPage: activityPage,
    totalPages: activityTotalPages,
    selectedData: selectedActivity,
    handleNextPage: handleNextActivityPage,
    handlePreviousPage: handlePreviousActivityPage,
  } = usePagination(activity, 3);
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2 px-4 sm:px-12">
            <WalletMinimal className="h-5 w-5 font-blod text-gray-600" />
            <CardTitle className="text-xl sm:text-2xl text-gray-600 font-bold w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Recent Transactions</span>
              <Link
                href={"/transactions"}
                className="flex justify-center items-center bg-gray-100 border border-gray-200 p-1 rounded-lg shadow-md"
              >
                <CalendarDays className="h-5 w-5 text-gray-600" />
                <p className="text-base text-gray-400 px-2">View all</p>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="shadow-xl rounded-lg p-2 overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedTransactions.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-5 whitespace-normal md:whitespace-nowrap text-sm text-black">
                        {item.transaction_date
                          ? new Date(item.transaction_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="px-6 py-5 whitespace-normal md:whitespace-nowrap text-sm text-black">
                        {item.description || "N/A"}
                      </td>
                      <td
                        className="px-6 py-5 whitespace-normal md:whitespace-nowrap text-sm text-black"
                      >
                        ${item.amount ? Number(item.amount).toLocaleString() : "N/A"}
                      </td>
                      <Badge
                        className={`align-center m-2 text-sm ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : item.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status || "N/A"}
                      </Badge>
                      <td className="px-6 py-5 whitespace-normal md:whitespace-nowrap text-sm text-gray-500">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)} // Abre el modal con la transacción seleccionada
                          className="w-full flex justify-center items-center"
                        >
                          <Eye className="h-5 w-5 text-gray-600" />
                        </button>
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

        <div className="lg:col-span-1 h-fit">
                {/* DIBISES CARD */}
          <div className="mb-4">
            <Dibises />
          </div>
          <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-4 pb-2">
            <UsersIcon className="h-4 w-4 text-black" />
            <CardTitle className="text-xl sm:text-2xl text-gray-600 font-bold w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Activity</span>
              <Link
                href={"/transactions"}
                className="flex justify-center items-center bg-gray-100 border border-gray-200 p-1 rounded-lg shadow-md"
              >
                <CalendarDays className="h-5 w-5 text-gray-600" />
                <p className="text-base text-gray-400 px-2">View all</p>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="shadow-xl rounded-lg p-2 overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Dept
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedActivity.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-4 whitespace-normal text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${index % 2 === 0 ? "bg-green-100" : "bg-blue-100"}`}>
                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-bold text-gray-800 underline">{item.department}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-normal text-sm">
                        <Badge
                          className={`p-1 rounded-xl flex justify-center items-center ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : item.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.transaction_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-normal text-sm text-gray-500">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="w-full flex justify-center items-center"
                        >
                          <Eye className="h-5 w-5 text-gray-600" />
                        </button>
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
                  className="px-4 py-2 text-gray-600 rounded disabled:opacity-50"
                  title="Next Activity"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>

      {/* Renderiza el EditTransactionModal */}
      <SideModal open={isModalOpen} onOpenChange={setIsModalOpen} transaction={selectedTransaction} />
      </>
  )
}

