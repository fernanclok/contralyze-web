"use server";
import axios from "axios";
import { cookies } from "next/headers";


export async function getBudgets() {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/all/statistics`,
        {
          headers,
        }
      );
      return { budgets: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching budget info:", error);
  
      // if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      //   return { error: "Error connecting to the server", Budgets: {} };
      // }
  
      return { error: "Error fetching budget info", Budgets: {} };
    }
  }

  export async function getTypeChange(type: string) {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.NEXT_EXCHANGE_API_KEY}/latest/${type}`
      );
  
      return { exchange: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching changetipe info:", error);
  
      if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
        return { error: "Error connecting to the server", Budgets: {} };
      }
  
      return { error: "Error fetching change info", Budgets: {} };
    }
  }


  export async function getInfoperCards() {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", company: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/all/info-cards`,
        {
          headers,
        }
      );
  
      return { info: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching info cards:", error);
  
      // if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      //   return { error: "Error connecting to the server", Budgets: {} };
      // }
  
      return { error: "Error fetching info cards", Budgets: {} };
  }
  }

  export async function getTransactionsStatics() 
  {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", transactions: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/all/statics`,
        {
          headers,
        }
      );
      const transactions = response.data.data;
      return { transactions: transactions, error: null };
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
  
      // if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      //   return { error: "Error connecting to the server", transactions: {} };
      // }
  
      return { error: "Error fetching transactions", transactions: {} };
    }
  }

  export async function getDeptoData() {
    try {
      const token = (await cookies()).get("access_token")?.value;
  
      if (!token) {
        return { error: "No authentication token found", deptoData: {} };
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/department/statics`,
        {
          headers,
        }
      );
      const DeptoData = response.data.data;
      return { DeptoData: DeptoData, error: null };
    } catch (error: any) {
      console.error("Error fetching DeptoData:", error);
  
      // if (error.code === "ECONNREFUSED" || error.response?.status === 429) {
      //   return { error: "Error connecting to the server", DeptoData: {} };
      // }
  
      return { error: "Error fetching DeptoData", DeptoData: {} };
    }
  }

  export async function getLastTransactions(){
    try{
      const token = (await cookies()).get("access_token")?.value;

      if(!token) {
        return {error: "No authentication token found", transactionsList: {}};
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };  
    
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/last/transactions`,
        {
          headers,
        }
      );
      const transactionsList = response.data.data;
      return { transactionsList: transactionsList, error: null };
    } catch(error:any){
      console.error("Error fetching transactions:", error);

      // if(error.code === "ECONNREFUSED" || error.response?.status === 429){
      //   return { error: "Error connecting to the server", transactionsList: {} };
      // }

      return { error: "Error fetching transactions", transactionsList: {} };
    }
  }

  export async function getLastTransanctionByDepto(){
    try{
      const token = (await cookies()).get("access_token")?.value;

      // if(!token) {
      //   return {error: "No authentication token found", transactionsDepto: {}};
      // }

      const headers = {
        Authorization: `Bearer ${token}`,
      };  
    
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transactions/last/department`,
        {
          headers,
        }
      );
      const transactionsDepto = response.data.data;
      return { transactionsDepto: transactionsDepto, error: null };
    } catch(error:any){
      console.error("Error fetching transactions:", error);

      if(error.code === "ECONNREFUSED" || error.response?.status === 429){
        return { error: "Error connecting to the server", transactionsDepto: {} };
      }

      return { error: "Error fetching transactions by depto", transactionsDepto: {} };
    }
  }