"use client"

import { AlertCircle } from "lucide-react"
import DashboardCharts from "./charts/dashboard-charts"
import {
  saveBudgetsStaticsToDB,
  getBudgetsStaticsFromDB,
  saveInfoCardsToDB,
  getInfoCardsFromDB,
  saveTransactionStaticsToDB,
  getTransactionStaticsFromDB,
  saveDepartmentStaticsToDB,
  getDepartmentStaticsFromDB,
  saveLastTransactionsToDB,
  getLastTransactionsFromDB,
  saveLastActivityToDB,
  getLastActivityFromDB,
  saveYearsAvailableToDB,
  getYearsAvailableFromDB,
} from "@/app/utils/indexedDB"
import { useEffect, useState } from "react"

export default function ClientDashboardPage({
  Budgets,
  user,
  Information,
  Transaction,
  AvailableYears,
  DeptoData,
  TransactionsList,
  TransactionsDepto,
}: {
  Budgets: any
  user: any
  Information: any
  Transaction: any
  AvailableYears: any
  DeptoData: any
  TransactionsList: any
  TransactionsDepto: any
}) {
  // Initialize state with proper checks
  const [localBudgets, setLocalBudgets] = useState(Budgets && typeof Budgets === "object" ? Budgets : {})
  const [localInfoCards, setLocalInfoCards] = useState(
    Information && typeof Information === "object" ? Information : {},
  )
  const [localTransactionStatics, setLocalTransactionStatics] = useState(
    Transaction && typeof Transaction === "object" ? Transaction : {},
  )
  const [localDeptoData, setLocalDeptoData] = useState(DeptoData && typeof DeptoData === "object" ? DeptoData : {})
  const [localTransactionsList, setLocalTransactionsList] = useState(
    TransactionsList && typeof TransactionsList === "object" ? TransactionsList : {},
  )
  const [localActivity, setLocalActivity] = useState(
    TransactionsDepto && typeof TransactionsDepto === "object" ? TransactionsDepto : {},
  ) // Fixed: was using TransactionsList instead of TransactionsDepto
  const [localYearsAvailable, setLocalYearsAvailable] = useState(
    AvailableYears && typeof AvailableYears === "object" ? AvailableYears : {},
  )

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const hasError = loadError || (!Budgets && !Information && !Transaction && !AvailableYears)

  // Helper function to check if data is empty
  const isDataEmpty = (data: any) => {
    if (!data) return true
    if (Array.isArray(data) && data.length === 0) return true
    if (typeof data === "object" && Object.keys(data).length === 0) return true
    return false
  }

  // Load data from IndexedDB
  useEffect(() => {
    let isMounted = true
    const loadAllData = async () => {
      if (typeof window === "undefined" || !window.indexedDB) {
        if (isMounted) {
          setLoadError(true)
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)

        // Load Budgets
        if (isDataEmpty(Budgets)) {
          const budgetsFromDB = await getBudgetsStaticsFromDB()
          if (isMounted && budgetsFromDB) {
            console.log("Loaded budgets from IndexedDB:", budgetsFromDB)
            setLocalBudgets(budgetsFromDB)
          }
        }

        // Load Information
        if (isDataEmpty(Information)) {
          const infoCardsFromDB = await getInfoCardsFromDB()
          if (isMounted && infoCardsFromDB) {
            console.log("Loaded info cards from IndexedDB:", infoCardsFromDB)
            setLocalInfoCards(infoCardsFromDB)
          }
        }

        // Load Transaction
        if (isDataEmpty(Transaction)) {
          const transactionFromDB = await getTransactionStaticsFromDB()
          if (isMounted && transactionFromDB) {
            console.log("Loaded transaction statics from IndexedDB:", transactionFromDB)
            setLocalTransactionStatics(transactionFromDB)
          }
        }

        // Load DeptoData
        if (isDataEmpty(DeptoData)) {
          const deptoDataFromDB = await getDepartmentStaticsFromDB()
          if (isMounted && deptoDataFromDB) {
            console.log("Loaded department data from IndexedDB:", deptoDataFromDB)
            setLocalDeptoData(deptoDataFromDB)
          }
        }

        // Load TransactionsList
        if (isDataEmpty(TransactionsList)) {
          const transactionsListFromDB = await getLastTransactionsFromDB()
          if (isMounted && transactionsListFromDB) {
            console.log("Loaded transactions list from IndexedDB:", transactionsListFromDB)
            setLocalTransactionsList(transactionsListFromDB)
          }
        }

        // Load TransactionsDepto
        if (isDataEmpty(TransactionsDepto)) {
          const activityFromDB = await getLastActivityFromDB()
          console.log("Activity loaded from IndexedDB:", activityFromDB);
          if (isMounted && activityFromDB) {
            console.log("Loaded last activity from IndexedDB:", activityFromDB)
            setLocalActivity(activityFromDB)
          }
        }

        // Load AvailableYears
        if (isDataEmpty(AvailableYears)) {
          const yearsFromDB = await getYearsAvailableFromDB()
          if (isMounted && yearsFromDB) {
            console.log("Loaded available years from IndexedDB:", yearsFromDB)
            setLocalYearsAvailable(yearsFromDB)
          }
        }
      } catch (error) {
        console.error("Error loading data from IndexedDB:", error)
        if (isMounted) {
          setLoadError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAllData()

    return () => {
      isMounted = false
    }
  }, [Budgets, Information, Transaction, DeptoData, TransactionsList, TransactionsDepto, AvailableYears])

  // Save data to IndexedDB
  useEffect(() => {
    const saveData = async () => {
      if (typeof window === "undefined" || !window.indexedDB) return

      try {
        // Save Budgets
        if (!isDataEmpty(Budgets)) {
          const budgetsToSave = {
            id: "budgets_summary",
            ...Budgets,
          }
          await saveBudgetsStaticsToDB([budgetsToSave])
          console.log("Saved budgets to IndexedDB")
        }

        // Save Information
        if (!isDataEmpty(Information)) {
          const infoCardsToSave = {
            id: "info_cards",
            ...Information,
          }
          await saveInfoCardsToDB([infoCardsToSave])
          console.log("Saved info cards to IndexedDB")
        }

        // Save Transaction
        if (!isDataEmpty(Transaction)) {
          const transactionsToSave = {
            id: "transactions_summary",
            ...Transaction,
          }
          await saveTransactionStaticsToDB([transactionsToSave])
          console.log("Saved transactions to IndexedDB")
        }

        // Save DeptoData
        if (!isDataEmpty(DeptoData)) {
          const deptoDataToSave = {
            id: "Depto_summary",
            ...DeptoData,
          }
          await saveDepartmentStaticsToDB([deptoDataToSave])
          console.log("Saved department data to IndexedDB")
        }

        // Save TransactionsList
        if (!isDataEmpty(TransactionsList)) {
          const transactionsListToSave = {
            id: "transactions_list",
            ...TransactionsList,
          }
          await saveLastTransactionsToDB([transactionsListToSave])
          console.log("Saved transactions list to IndexedDB")
        }

        // Save TransactionsDepto
        if (!isDataEmpty(TransactionsDepto)) {
          const activityToSave = {
            id: "lastactivity_Depto",
            ...TransactionsDepto,
          }
          await saveLastActivityToDB(activityToSave)
          console.log("Saved last activity to IndexedDB")
        }

        // Save AvailableYears
        if (!isDataEmpty(AvailableYears)) {
          const yearsToSave = {
            id: "years_available",
            ...AvailableYears,
          }
          console.log(yearsToSave, 'aaaaasave')
          await saveYearsAvailableToDB(yearsToSave)
          console.log("Saved available years to IndexedDB")
        }
      } catch (error) {
        console.error("Error saving data to IndexedDB:", error)
      }
    }

    saveData()
  }, [Budgets, Information, Transaction, DeptoData, TransactionsList, TransactionsDepto, AvailableYears])

  // Get the last updated date
  const date = new Date()
  const lastUpdated = date.toDateString()

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

          {/* Loading indicator */}
          {isLoading && (
            <div className="p-4 mb-4 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <div>
                <p className="font-medium">Loading data...</p>
                <p className="text-sm">Please wait while we retrieve your dashboard information.</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {hasError && !isLoading && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Connection Error</p>
                <p className="text-sm">Could not load the data. Please check your connection or try again later.</p>
              </div>
            </div>
          )}

          {/* Dashboard content */}
          {!isLoading && !hasError && (
            <DashboardCharts
              Budgets={localBudgets}
              transaction={localTransactionStatics}
              years={localYearsAvailable}
              Info={localInfoCards}
              DeptoData={localDeptoData}
              TransactionsList={localTransactionsList}
              TransactionsDepto={localActivity}
            />
          )}
        </div>
      </div>
    </div>
  )
}

