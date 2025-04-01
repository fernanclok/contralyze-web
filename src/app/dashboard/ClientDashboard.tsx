"use client"

import { AlertCircle } from "lucide-react";
import DashboardCharts from "./charts/dashboard-charts";
import InfoCards from "./info-cards/info-cards";
import { Card, CardContent } from "@/components/ui/card";
import 
{ 
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
  getYearsAvailableFromDB
}
  from "@/app/utils/indexedDB";
import { useEffect, useState } from "react";

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

// CHECK IF THE DATA IS EMPTY OR NOT
    const [localBudgets, setLocalBudgets] = useState(
      Budgets &&  typeof Budgets === "object" ? Budgets : {}
      );
      const [localinfoCards, setLocalInfoCards] = useState(
        Information && typeof Information === "object" ? Information : {}
      );
      const [localTransactionStatics, setLocalTransactionStatics] = useState(
        Transaction && typeof Transaction === "object" ? Transaction : {}
      );

      const [localDeptoData, setLocalDeptoData] = useState(
        DeptoData && typeof DeptoData === "object" ? DeptoData : {}
      );
      const [localTransactionsList, setLocalTransactionsList] = useState(
        TransactionsList && typeof TransactionsList === "object" ? TransactionsList : {}
      );
      const [localActivity, setLocalActivity] = useState(
        TransactionsList && typeof TransactionsList === "object" ? TransactionsList : {}
      );
      const [localYearsAvailable, setLocalYearsAvailable] = useState(
        AvailableYears && typeof AvailableYears === "object" ? AvailableYears : {}
      );
  const hasError =
  !Budgets || !Information || !Transaction || !AvailableYears  ;
  
  //  CHARGE THE DATA FROM THE INDEXEDDB
  useEffect(() => {
    if(!Budgets || (Array.isArray(Budgets) && Budgets.length === 0)) 
      {
      if (typeof window !== "undefined" && window.indexedDB) {
        getBudgetsStaticsFromDB()
          .then((budgetsRequisitionsFromDB) => {
            if (budgetsRequisitionsFromDB) {
              setLocalBudgets(budgetsRequisitionsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error fetching data from IndexedDB:", error);
          });
      }
      else{
        setLocalBudgets(Budgets);
      }
      }
    
    if(!Information || (Array.isArray(Information) && Information.length === 0)) 
      {
      if (typeof window !== "undefined" && window.indexedDB) {
        getInfoCardsFromDB()
          .then((infoCardsFromDB) => {
            if (infoCardsFromDB) {
              setLocalInfoCards(infoCardsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error fetching data from IndexedDB:", error);
          });
      }
      else{
        setLocalInfoCards(Information);
      }
      }

    if(!Transaction || (Array.isArray(Transaction) && Transaction.length === 0)) 
      {
      if (typeof window !== "undefined" && window.indexedDB) {
        getTransactionStaticsFromDB()
          .then((transactionRequisitionsFromDB) => {
            if (transactionRequisitionsFromDB) {
              setLocalTransactionStatics(transactionRequisitionsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error fetching data from IndexedDB:", error);
          });
      }
      else{
        setLocalTransactionStatics(Transaction);
      }
      }

    if(!DeptoData || (Array.isArray(DeptoData) && DeptoData.length === 0)) 
      {
      if (typeof window !== "undefined" && window.indexedDB) {
        getDepartmentStaticsFromDB()
          .then((DeptoDataRequisitionsFromDB) => {
            if (DeptoDataRequisitionsFromDB) {
              setLocalDeptoData(DeptoDataRequisitionsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error fetching data from IndexedDB:", error);
          });
      }
      }

    if(!TransactionsList || (Array.isArray(TransactionsList) && TransactionsList.length === 0)) 
      {
      if (typeof window !== "undefined" && window.indexedDB) {
        getLastTransactionsFromDB()
          .then((transactionsRequisitionsFromDB) => {
            if (transactionsRequisitionsFromDB) {
              setLocalTransactionsList(transactionsRequisitionsFromDB);
            }
          })
          .catch((error) => {
            console.error("Error fetching data from IndexedDB:", error);
          });
      }
      }

    if(!TransactionsDepto || (Array.isArray(TransactionsDepto) && TransactionsDepto.length === 0))    
      {
        if (typeof window !== "undefined" && window.indexedDB) {
          getLastActivityFromDB()
            .then((activityRequisitionsFromDB) => {
              if (activityRequisitionsFromDB) {
                setLocalActivity(activityRequisitionsFromDB);
              }
            })
            .catch((error) => {
              console.error("Error fetching data from IndexedDB:", error);
            });
        }
      }

    if(!AvailableYears || (Array.isArray(AvailableYears) && AvailableYears.length === 0)) 
      {
        if (typeof window !== "undefined" && window.indexedDB) {
          getYearsAvailableFromDB()
            .then((yearsRequisitionsFromDB) => {
              if (yearsRequisitionsFromDB) {
                setLocalYearsAvailable(yearsRequisitionsFromDB);
              }
            })
            .catch((error) => {
              console.error("Error fetching data from IndexedDB:", error);
            });
        }
      }

  }, [Budgets, Information, Transaction, DeptoData, TransactionsList, TransactionsDepto, AvailableYears]);

  // SAVE THE DATA IN THE INDEXEDDB
    useEffect(() => {
      if (Budgets && typeof window !== "undefined" && window.indexedDB) {
        const budgetsToSave = {
          id: "budgets_summary", // Un identificador único
          ...Budgets,
        };
        console.log("Saving budgets to IndexedDB:", budgetsToSave);
    
        saveBudgetsStaticsToDB([budgetsToSave]).catch((error) => {
          console.error("Error saving budgets to IndexedDB:", error);
        });
      }
      if (Information && typeof window !== "undefined" && window.indexedDB) {
        const infoCardsToSave = {
          id: "info_cards", // Un identificador único
          ...Information,
        };
        console.log("Saving info cards to IndexedDB:", infoCardsToSave);
    
        saveInfoCardsToDB([infoCardsToSave]).catch((error) => {
          console.error("Error saving info cards to IndexedDB:", error);
        });
      }
      if (Transaction && typeof window !== "undefined" && window.indexedDB) {
        const transactionsToSave = {
          id: "transactions_summary", // Un identificador único
          ...Transaction,
        };
        console.log("Saving transactions to IndexedDB:", transactionsToSave);
    
        saveTransactionStaticsToDB([transactionsToSave]).catch((error) => {
          console.error("Error saving transactions to IndexedDB:", error);
        });
      }
      if (DeptoData && typeof window !== "undefined" && window.indexedDB) {
        const DeptoDataToSave = {
          id: "Depto_summary", // Un identificador único
          ...DeptoData,
        };
        console.log("Saving DeptoData to IndexedDB:", DeptoDataToSave);
    
        saveDepartmentStaticsToDB([DeptoDataToSave]).catch((error) => {
          console.error("Error saving DeptoData to IndexedDB:", error);
        });
      }
      if (TransactionsList && typeof window !== "undefined" && window.indexedDB) {
        const transactionsToSave = {
          id: "transactions_list", // Un identificador único
          ...TransactionsList,
        };
        console.log("Saving transactions to IndexedDB:", transactionsToSave);
    
        saveLastTransactionsToDB([transactionsToSave]).catch((error) => {
          console.error("Error saving transactions to IndexedDB:", error);
        });
      }
      if (TransactionsDepto && typeof window !== "undefined" && window.indexedDB) {
        const transactionsToSave = {
          id: "lastactivity_Depto", // Un identificador único
          ...TransactionsDepto,
        };
        console.log("Saving transactions to IndexedDB:", transactionsToSave);
    
        saveLastActivityToDB(transactionsToSave).catch((error) => {
          console.error("Error saving transactions to IndexedDB:", error);
        });
      }
      if (AvailableYears && typeof window !== "undefined" && window.indexedDB) {
        const yearsToSave = {
          id: "years_available", // Un identificador único
          ...AvailableYears,
        };
        console.log("Saving years to IndexedDB:", yearsToSave);
    
        saveYearsAvailableToDB(yearsToSave).catch((error) => {
          console.error("Error saving years to IndexedDB:", error);
        });
      }
    }, [Budgets, Information, Transaction, DeptoData, TransactionsList, TransactionsDepto, AvailableYears]);

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
                  Budgets={localBudgets}
                  transaction={localTransactionStatics}
                  years={localYearsAvailable}
                  Info={localinfoCards} 
                  DeptoData={localDeptoData}
                  TransactionsList={localTransactionsList}
                  TransactionsDepto={localActivity}
                />
          )}
        </div>
      </div>
    </div>
  );
}